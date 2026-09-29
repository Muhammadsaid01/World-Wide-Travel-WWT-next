import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useMutation, useReactiveVar } from '@apollo/client';
import { Alert, Breadcrumbs, Button, MenuItem, Paper, Skeleton, TextField, Typography } from '@mui/material';
import AddPhotoAlternateOutlined from '@mui/icons-material/AddPhotoAlternateOutlined';
import { currentUserVar } from '@/apollo/store';
import { restoreUserFromToken } from '@/libs/auth';
import { CREATE_TRAVEL_PACKAGE, UPLOAD_PACKAGE_IMAGE } from '@/apollo/user/mutation';
import { MemberType } from '@/libs/enums/member.enum';
import { PackageCategory, PackageLevel, PackageType, TransportType } from '@/libs/enums/package.enum';
import type { TravelPackageInput } from '@/libs/types/package/travel-package.input';
import ProfileSidebar from './ProfileSidebar';
import PackageImage from '../package/PackageImage';

type FieldName = Exclude<keyof TravelPackageInput, 'packageImages'>;
type Values = Record<FieldName, string>;
const initialValues: Values = {
	packageTitle: '',
	packageDesc: '',
	packageShortDesc: '',
	packageType: '',
	packageCategory: '',
	packageLevel: '',
	destinationCountry: '',
	destinationCity: '',
	packageDays: '',
	packageNights: '',
	meetingPoint: '',
	latitude: '',
	longitude: '',
	packagePrice: '',
	currency: '',
	minPeople: '',
	maxPeople: '',
	transportType: '',
};
const numericFields = [
	'packageDays',
	'packageNights',
	'latitude',
	'longitude',
	'packagePrice',
	'minPeople',
	'maxPeople',
] as const;
const requiredFields: FieldName[] = [
	'packageTitle',
	'packageDesc',
	'packageCategory',
	'destinationCountry',
	'destinationCity',
	'packageDays',
	'packageNights',
	'packagePrice',
	'maxPeople',
];
const integerMinimums = { packageDays: 1, packageNights: 0, minPeople: 1, maxPeople: 1 } as const;
function PackageForm({ memberId }: { memberId: string }) {
	const router = useRouter();
	const [values, setValues] = useState<Values>(initialValues);
	const [images, setImages] = useState<string[]>([]);
	const [errors, setErrors] = useState<Partial<Record<FieldName | 'packageImages', string>>>({});
	const [failure, setFailure] = useState('');
	const [busy, setBusy] = useState(false);
	const [uploading, setUploading] = useState(false);
	const [created, setCreated] = useState(false);
	const lock = useRef(false);
	const uploadLock = useRef(false);
	const createdRef = useRef(false);
	const [create] = useMutation(CREATE_TRAVEL_PACKAGE, { fetchPolicy: 'no-cache' });
	const [upload] = useMutation(UPLOAD_PACKAGE_IMAGE, { fetchPolicy: 'no-cache' });
	function authorized() {
		const user = currentUserVar();
		return user?._id === memberId && user.memberType === MemberType.AGENT;
	}
	async function selectImages(files: File[]) {
		if (!authorized() || uploadLock.current || lock.current || createdRef.current) return;
		setFailure('');
		if (
			files.some(
				(file) =>
					!['image/jpeg', 'image/png'].includes(file.type) ||
					!/\.(jpe?g|png)$/i.test(file.name) ||
					file.size > 15000000,
			)
		) {
			setErrors((previous) => ({ ...previous, packageImages: 'Choose JPG or PNG images, up to 15 MB each.' }));
			return;
		}
		uploadLock.current = true;
		setUploading(true);
		setErrors((previous) => ({ ...previous, packageImages: undefined }));
		try {
			for (const file of files) {
				if (!authorized()) return;
				const response = await upload({ variables: { file } });
				if (!response.data?.imageUploader) throw new Error('Image upload returned no file path.');
				const path = response.data.imageUploader;
				setImages((previous) => [...previous, path]);
			}
		} catch (error) {
			setFailure(
				error instanceof Error
					? error.message
					: 'An image could not be uploaded. Successfully uploaded images have been kept.',
			);
		} finally {
			uploadLock.current = false;
			setUploading(false);
		}
	}
	async function save() {
		if (!authorized() || lock.current || uploadLock.current || createdRef.current) return;
		const nextErrors: typeof errors = {};
		for (const key of requiredFields) if (!values[key].trim()) nextErrors[key] = 'This field is required.';
		if (values.packageTitle.trim().length < 3 || values.packageTitle.trim().length > 100)
			nextErrors.packageTitle = 'Use 3–100 characters.';
		if (values.packageDesc.trim().length < 10 || values.packageDesc.trim().length > 3000)
			nextErrors.packageDesc = 'Use 10–3000 characters.';
		for (const key of numericFields)
			if (values[key].trim() && !Number.isFinite(Number(values[key]))) nextErrors[key] = 'Enter a valid number.';
		for (const [key, minimum] of Object.entries(integerMinimums) as [keyof typeof integerMinimums, number][]) {
			if (
				values[key].trim() &&
				(!Number.isInteger(Number(values[key])) || Number(values[key]) < minimum || Number(values[key]) > 2147483647)
			)
				nextErrors[key] = `Enter a whole number from ${minimum} to 2147483647.`;
		}
		if (values.packagePrice.trim() && Number(values.packagePrice) < 0)
			nextErrors.packagePrice = 'Price cannot be negative.';
		if (values.minPeople && values.maxPeople && Number(values.minPeople) > Number(values.maxPeople))
			nextErrors.minPeople = 'Minimum travelers cannot exceed maximum travelers.';
		if (!images.length) nextErrors.packageImages = 'Upload at least one package image.';
		setErrors(nextErrors);
		setFailure('');
		if (Object.keys(nextErrors).length) return;
		const input: TravelPackageInput = {
			packageTitle: values.packageTitle.trim(),
			packageDesc: values.packageDesc.trim(),
			packageCategory: values.packageCategory as PackageCategory,
			destinationCountry: values.destinationCountry.trim(),
			destinationCity: values.destinationCity.trim(),
			packageDays: Number(values.packageDays),
			packageNights: Number(values.packageNights),
			packagePrice: Number(values.packagePrice),
			maxPeople: Number(values.maxPeople),
			packageImages: images,
		};
		for (const key of ['packageShortDesc', 'meetingPoint', 'currency'] as const)
			if (values[key].trim()) input[key] = values[key].trim();
		for (const key of ['latitude', 'longitude', 'minPeople'] as const)
			if (values[key].trim()) input[key] = Number(values[key]);
		if (values.packageType) input.packageType = values.packageType as PackageType;
		if (values.packageLevel) input.packageLevel = values.packageLevel as PackageLevel;
		if (values.transportType) input.transportType = values.transportType as TransportType;
		lock.current = true;
		setBusy(true);
		try {
			const response = await create({ variables: { input } });
			if (!response.data?.createTravelPackage._id) throw new Error('Package creation was not confirmed by the server.');
			createdRef.current = true;
			setCreated(true);
			await router.push('/mypage/packages?created=1');
		} catch (error) {
			setFailure(
				`${createdRef.current ? 'Package created, but navigation failed. ' : ''}${error instanceof Error ? error.message : 'Unable to create package.'}`,
			);
		} finally {
			lock.current = false;
			setBusy(false);
		}
	}
	const disabled = busy || uploading || created;
	function field(key: FieldName, label: string, options?: Record<string, string>, multiline = false) {
		const numeric = numericFields.some((value) => value === key);
		return (
			<TextField
				key={key}
				fullWidth
				label={label}
				required={requiredFields.includes(key)}
				value={values[key]}
				disabled={disabled}
				select={Boolean(options)}
				type={numeric ? 'number' : 'text'}
				multiline={multiline}
				minRows={multiline ? 4 : undefined}
				error={Boolean(errors[key])}
				helperText={errors[key]}
				slotProps={{
					htmlInput: numeric
						? {
								step: key in integerMinimums ? 1 : 'any',
								...(key in integerMinimums
									? { min: integerMinimums[key as keyof typeof integerMinimums] }
									: key === 'packagePrice'
										? { min: 0 }
										: {}),
							}
						: undefined,
				}}
				onChange={(event) => setValues((previous) => ({ ...previous, [key]: event.target.value }))}
			>
				{options && !requiredFields.includes(key) && <MenuItem value="">Default</MenuItem>}
				{options &&
					Object.values(options).map((value) => (
						<MenuItem value={value} key={value}>
							{value.charAt(0) + value.slice(1).toLowerCase()}
						</MenuItem>
					))}
			</TextField>
		);
	}
	return (
		<form
			className="create-package-form"
			noValidate
			onSubmit={(event) => {
				event.preventDefault();
				void save();
			}}
		>
			<Paper component="section">
				<Typography component="h2">Package Details</Typography>
				<div className="create-package-fields">
					<div className="full-width">{field('packageTitle', 'Package Title')}</div>
					<div className="full-width">{field('packageDesc', 'Description', undefined, true)}</div>
					<div className="full-width">{field('packageShortDesc', 'Short Description (optional)')}</div>
					{field('packageCategory', 'Category', PackageCategory)}
					{field('packageType', 'Type (optional)', PackageType)}
					{field('packageLevel', 'Level (optional)', PackageLevel)}
					{field('transportType', 'Transport (optional)', TransportType)}
				</div>
			</Paper>
			<Paper component="section">
				<Typography component="h2">Destination &amp; Duration</Typography>
				<div className="create-package-fields">
					{field('destinationCountry', 'Destination Country')}
					{field('destinationCity', 'Destination City')}
					{field('packageDays', 'Days')}
					{field('packageNights', 'Nights')}
					<div className="full-width">{field('meetingPoint', 'Meeting Point (optional)')}</div>
					{field('latitude', 'Latitude (optional)')}
					{field('longitude', 'Longitude (optional)')}
				</div>
			</Paper>
			<Paper component="section">
				<Typography component="h2">Price &amp; Group Size</Typography>
				<div className="create-package-fields">
					{field('packagePrice', 'Price')}
					{field('currency', 'Currency (optional)')}
					{field('minPeople', 'Minimum Travelers (optional)')}
					{field('maxPeople', 'Maximum Travelers')}
				</div>
			</Paper>
			<Paper component="section">
				<Typography component="h2">Package Images</Typography>
				<Typography color="text.secondary">
					Upload JPG or PNG images, up to 15 MB each. The first image is the package thumbnail.
				</Typography>
				<Button component="label" variant="outlined" startIcon={<AddPhotoAlternateOutlined />} disabled={disabled}>
					{uploading ? 'Uploading…' : 'Upload Images'}
					<input
						hidden
						type="file"
						multiple
						accept="image/jpeg,image/png"
						disabled={disabled}
						onChange={(event) => {
							const files = Array.from(event.target.files ?? []);
							event.target.value = '';
							void selectImages(files);
						}}
					/>
				</Button>
				{errors.packageImages && <Alert severity="error">{errors.packageImages}</Alert>}
				<div className="create-package-images">
					{images.map((path, index) => (
						<div key={`${path}-${index}`}>
							<div className="create-package-image">
								<PackageImage path={path} alt={`Package image ${index + 1}`} />
							</div>
							<Button
								color="error"
								disabled={disabled}
								aria-label={`Remove image ${index + 1}`}
								onClick={() => setImages((previous) => previous.filter((_, i) => i !== index))}
							>
								Remove
							</Button>
						</div>
					))}
				</div>
			</Paper>
			{failure && <Alert severity="error">{failure}</Alert>}
			{created && (
				<Alert severity="success">
					Package created successfully. <Link href="/mypage/packages">Back to My Packages</Link>
				</Alert>
			)}
			<div className="create-package-actions">
				<Button component={Link} href="/mypage/packages" disabled={busy || uploading} variant="outlined">
					Cancel
				</Button>
				<Button type="submit" variant="contained" disabled={disabled}>
					{busy ? 'Creating…' : 'Create Package'}
				</Button>
			</div>
		</form>
	);
}
export default function CreatePackage() {
	const router = useRouter();
	const user = useReactiveVar(currentUserVar);
	useEffect(() => {
		if (!router.isReady) return;
		const current = currentUserVar() ?? restoreUserFromToken();
		if (!current?._id) void router.replace('/account/login');
		else if (current.memberType !== MemberType.AGENT) void router.replace('/mypage');
	}, [router, user?._id, user?.memberType]);
	if (!user?._id || user.memberType !== MemberType.AGENT)
		return <Skeleton aria-label="Checking agent access" height={180} />;
	return (
		<div className="my-bookings-page agent-dashboard-page create-package-page">
			<Breadcrumbs separator="/" className="my-bookings-breadcrumb">
				<Link href="/">Home</Link>
				<Link href="/mypage">My Profile</Link>
				<Link href="/mypage/packages">My Packages</Link>
				<span aria-current="page">Create New Package</span>
			</Breadcrumbs>
			<div className="my-bookings-layout">
				<ProfileSidebar active="My Packages" />
				<div className="agent-dashboard-main">
					<header>
						<Typography component="h1">Create New Package</Typography>
						<Typography color="text.secondary">Add your travel package to WWT.</Typography>
					</header>
					<PackageForm key={user._id} memberId={user._id} />
				</div>
			</div>
		</div>
	);
}
