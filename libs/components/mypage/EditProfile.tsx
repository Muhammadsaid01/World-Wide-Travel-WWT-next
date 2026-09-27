import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { currentUserVar } from '@/apollo/store';
import { GET_MY_PROFILE, type ProfileMember } from '@/apollo/user/query';
import { UPDATE_MEMBER, UPLOAD_PROFILE_IMAGE } from '@/apollo/user/mutation';
import { setJwtToken, restoreUserFromToken } from '@/libs/auth';
import type { MemberUpdate } from '@/libs/types/member/member.update';
import { MemberLanguage } from '@/libs/enums/member.enum';
import { packageImageUrl } from '../package/PackageImage';
import {
	Alert,
	Avatar,
	Breadcrumbs,
	Button,
	Divider,
	MenuItem,
	Paper,
	Skeleton,
	Stack,
	TextField,
	Typography,
} from '@mui/material';
import ArrowBack from '@mui/icons-material/ArrowBack';
import PersonOutlined from '@mui/icons-material/PersonOutlined';
import LocationOnOutlined from '@mui/icons-material/LocationOnOutlined';
import LanguageOutlined from '@mui/icons-material/LanguageOutlined';

const textFields = [
	'memberFullName',
	'memberDesc',
	'memberPhone',
	'memberEmail',
	'memberCountry',
	'memberCity',
	'memberAddress',
] as const;
type TextKey = (typeof textFields)[number];
type Values = Record<TextKey, string>;
function ProfileForm({ member }: { member: ProfileMember }) {
	const router = useRouter();
	const [values, setValues] = useState<Values>(() => ({
		memberFullName: member.memberFullName ?? '',
		memberDesc: member.memberDesc ?? '',
		memberPhone: member.memberPhone ?? '',
		memberEmail: member.memberEmail ?? '',
		memberCountry: member.memberCountry ?? '',
		memberCity: member.memberCity ?? '',
		memberAddress: member.memberAddress ?? '',
	}));
	const [language, setLanguage] = useState(member.memberLanguage);
	const [image, setImage] = useState(member.memberImage ?? '');
	const [file, setFile] = useState<File | null>(null);
	const [preview, setPreview] = useState('');
	const [imageError, setImageError] = useState('');
	const [errors, setErrors] = useState<Partial<Record<TextKey, string>>>({});
	const [serverError, setServerError] = useState('');
	const [busy, setBusy] = useState(false);
	const [saved, setSaved] = useState(false);
	const lock = useRef(false);
	const [upload] = useMutation(UPLOAD_PROFILE_IMAGE, { fetchPolicy: 'no-cache' });
	const [update] = useMutation(UPDATE_MEMBER, { fetchPolicy: 'no-cache' });
	useEffect(
		() => () => {
			if (preview) URL.revokeObjectURL(preview);
		},
		[preview],
	);

	function selectPhoto(selected?: File) {
		if (!selected) return;
		if (!['image/jpeg', 'image/png'].includes(selected.type) || !/\.(jpe?g|png)$/i.test(selected.name)) {
			setImageError('Choose a JPG or PNG image.');
			return;
		}
		if (selected.size > 15000000) {
			setImageError('Image must be 15 MB (15,000,000 bytes) or smaller.');
			return;
		}
		setImageError('');
		setFile(selected);
		setPreview(URL.createObjectURL(selected));
	}
	async function save() {
		if (lock.current || saved) return;
		const input: MemberUpdate = { _id: member._id };
		const nextErrors: Partial<Record<TextKey, string>> = {};
		for (const key of textFields) {
			const value = values[key].trim();
			if (value === (member[key] ?? '')) continue;
			if (key === 'memberFullName' && (value.length < 2 || value.length > 50))
				nextErrors[key] = 'Full name must contain 2–50 characters.';
			if (key === 'memberEmail' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
				nextErrors[key] = 'Enter a valid email address.';
			input[key] = value;
		}
		setErrors(nextErrors);
		if (Object.keys(nextErrors).length || imageError) return;
		if (language !== member.memberLanguage) input.memberLanguage = language;
		lock.current = true;
		setBusy(true);
		setServerError('');
		let persisted = false;
		try {
			let imagePath = image;
			if (file) {
				const response = await upload({ variables: { file } });
				if (!response.data?.imageUploader) throw new Error('Image upload returned no file path.');
				imagePath = response.data.imageUploader;
				setImage(imagePath);
				setFile(null);
				setPreview('');
			}
			if (imagePath !== (member.memberImage ?? '')) input.memberImage = imagePath;
			const response = await update({ variables: { input } });
			if (!response.data?.updateMember || response.data.updateMember._id !== member._id)
				throw new Error('Profile update response was unavailable.');
			persisted = true;
			setSaved(true);
			const token = response.data.updateMember.accessToken;
			if (!token) throw new Error('The server did not return a refreshed session.');
			setJwtToken(token);
			if (!restoreUserFromToken()) throw new Error('The refreshed session could not be restored.');
			await router.push('/mypage'); // Overview uses no-cache and reads the saved member again.
		} catch (error: unknown) {
			setServerError(
				`${persisted ? 'Profile saved, but follow-up failed. ' : ''}${error instanceof Error ? error.message : 'Unable to save profile.'}`,
			);
		} finally {
			lock.current = false;
			setBusy(false);
		}
	}
	function field(key: TextKey, label: string, multiline = false) {
		return (
			<TextField
				fullWidth
				label={label}
				slotProps={{ inputLabel: { shrink: true } }}
				value={values[key]}
				onChange={(event) => setValues((previous) => ({ ...previous, [key]: event.target.value }))}
				error={Boolean(errors[key])}
				helperText={errors[key]}
				multiline={multiline}
				minRows={multiline ? 4 : undefined}
				type={key === 'memberEmail' ? 'email' : key === 'memberPhone' ? 'tel' : 'text'}
			/>
		);
	}
	return (
		<Paper
			component="form"
			noValidate
			className="edit-profile-card"
			onSubmit={(event) => {
				event.preventDefault();
				void save();
			}}
		>
			<fieldset disabled={busy || saved}>
				<section className="edit-profile-photo">
					<Avatar src={preview || packageImageUrl(image)}>
						{(member.memberFullName || member.memberNick)?.slice(0, 1)}
					</Avatar>
					<div>
						<Typography component="h2">Profile Photo</Typography>
						<div className="edit-profile-photo-actions">
							<Button component="label" variant="contained">
								Change Photo
								<input
									hidden
									type="file"
									accept="image/jpeg,image/png"
									disabled={busy || saved}
									onChange={(event) => {
										selectPhoto(event.target.files?.[0]);
										event.target.value = '';
									}}
								/>
							</Button>
							<Button
								type="button"
								color="error"
								variant="outlined"
								disabled={!image && !file}
								onClick={() => {
									setFile(null);
									setPreview('');
									setImage('');
									setImageError('');
								}}
							>
								Remove
							</Button>
						</div>
						<Typography variant="caption" color="text.secondary">
							JPG or PNG · Max 15 MB. Photo changes are saved with your profile.
						</Typography>
						{imageError && (
							<Typography variant="body2" color="error" role="alert">
								{imageError}
							</Typography>
						)}
					</div>
				</section>
				<Divider />
				<section>
					<Typography component="h2">
						<PersonOutlined />
						Personal Information
					</Typography>
					<div className="edit-profile-fields">
						{field('memberFullName', 'Full Name')}
						<TextField
							label="Nickname"
							value={member.memberNick}
							slotProps={{ input: { readOnly: true }, inputLabel: { shrink: true } }}
							helperText="Nickname cannot be changed."
						/>
						<div className="full-width">{field('memberDesc', 'Bio / Description', true)}</div>
						{field('memberPhone', 'Phone Number')}
						{field('memberEmail', 'Email Address')}
					</div>
				</section>
				<Divider />
				<section>
					<Typography component="h2">
						<LocationOnOutlined />
						Location
					</Typography>
					<div className="edit-profile-fields">
						{field('memberCountry', 'Country')}
						{field('memberCity', 'City')}
						<div className="full-width">{field('memberAddress', 'Address')}</div>
					</div>
				</section>
				<Divider />
				<section>
					<Typography component="h2">
						<LanguageOutlined />
						Preferences
					</Typography>
					<TextField
						select
						fullWidth
						label="Preferred Language"
						className="edit-profile-language"
						slotProps={{ inputLabel: { shrink: true } }}
						value={language}
						onChange={(event) => {
							const value = Object.values(MemberLanguage).find((entry) => entry === event.target.value);
							if (value) setLanguage(value);
						}}
					>
						{Object.values(MemberLanguage).map((value) => (
							<MenuItem key={value} value={value}>
								{value.charAt(0) + value.slice(1).toLowerCase()}
							</MenuItem>
						))}
					</TextField>
				</section>
			</fieldset>
			{serverError && <Alert severity="error">{serverError}</Alert>}
			<div className="edit-profile-actions">
				<Button component={Link} href="/mypage" variant="outlined" disabled={busy}>
					Cancel
				</Button>
				<Button type="submit" variant="contained" disabled={busy || saved}>
					{busy ? 'Saving…' : saved ? 'Saved' : 'Save Changes'}
				</Button>
			</div>
		</Paper>
	);
}
export default function EditProfile() {
	const user = useReactiveVar(currentUserVar);
	const { data, loading, error, refetch } = useQuery(GET_MY_PROFILE, { skip: !user, fetchPolicy: 'no-cache' });
	return (
		<div className="edit-profile-page">
			<Breadcrumbs separator="›">
				<Link href="/">Home</Link>
				<Link href="/mypage">My Profile</Link>
				<span aria-current="page">Edit Profile</span>
			</Breadcrumbs>
			<Button component={Link} href="/mypage" startIcon={<ArrowBack />} className="edit-profile-back">
				Back to My Profile
			</Button>
			<header>
				<Typography component="h1">Edit Profile</Typography>
				<Typography color="text.secondary">Update your personal information and profile details.</Typography>
			</header>
			{!user ? (
				<Alert
					severity="info"
					action={
						<Button component={Link} href="/account/login">
							Login
						</Button>
					}
				>
					Log in to edit your profile.
				</Alert>
			) : loading ? (
				<Paper className="edit-profile-card">
					<Stack spacing={3}>
						<Skeleton variant="circular" width={116} height={116} />
						<Skeleton height={60} />
						<Skeleton height={110} />
						<Skeleton height={60} />
						<Skeleton height={60} />
					</Stack>
				</Paper>
			) : error ? (
				<Alert
					severity="error"
					action={
						<Button
							onClick={() => {
								void refetch().catch(() => undefined);
							}}
						>
							Retry
						</Button>
					}
				>
					Profile could not be loaded.
				</Alert>
			) : data?.getMyProfile && data.getMyProfile._id === user._id ? (
				<ProfileForm key={user._id} member={data.getMyProfile} />
			) : (
				<Alert severity="info">Profile information unavailable.</Alert>
			)}
		</div>
	);
}
