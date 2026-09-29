import {
	initialTripDetails,
	validateTripDetails,
	TripDetailsErrors,
	newTripDetailsProgress,
	publishTripDetails,
} from './tripDetailsState';
import { useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ApolloError, useMutation } from '@apollo/client';
import { Alert, Breadcrumbs, Button, Paper, Typography } from '@mui/material';
import ArrowBack from '@mui/icons-material/ArrowBack';
import { currentUserVar } from '@/apollo/store';
import {
	CREATE_TRAVEL_PACKAGE,
	CREATE_PACKAGE_INCLUDE,
	CREATE_PACKAGE_EXCLUDE,
	CREATE_PACKAGE_TAG,
	CREATE_PACKAGE_POLICY,
	CREATE_PACKAGE_ITINERARY,
	CREATE_PACKAGE_SCHEDULE,
	UPLOAD_PACKAGE_IMAGE,
} from '@/apollo/user/mutation';
import { MemberType } from '@/libs/enums/member.enum';
import BasicInfoStep from './BasicInfoStep';
import DestinationStep from './DestinationStep';
import TripDetailsStep from './TripDetailsStep';
import ItineraryStep from './ItineraryStep';
import ScheduleStep from './ScheduleStep';
import PricingStep from './PricingStep';
import ReviewStep from './ReviewStep';
import PackageStepper, { stepLabels } from './PackageStepper';
import {
	buildPackageInput,
	Errors,
	FieldName,
	initialValues,
	ItineraryValues,
	ScheduleValues,
	stepFields,
	validateItineraries,
	validatePackage,
	validateSchedules,
} from './formState';
import { publishPackage, PublishProgress } from './publishPackage';

export default function PackageForm({ memberId }: { memberId: string }) {
	const router = useRouter();
	const [details, setDetails] = useState(initialTripDetails);
	const [detailErrors, setDetailErrors] = useState<TripDetailsErrors>({});
	const detailsProgress = useRef(newTripDetailsProgress());
	const [values, setValues] = useState(initialValues);
	const [images, setImages] = useState<string[]>([]);
	const [itineraries, setItineraries] = useState<ItineraryValues[]>([]);
	const [schedules, setSchedules] = useState<ScheduleValues[]>([]);
	const [activeStep, setActiveStep] = useState(0);
	const [errors, setErrors] = useState<Errors>({});
	const [itineraryErrors, setItineraryErrors] = useState<string[]>([]);
	const [scheduleErrors, setScheduleErrors] = useState<string[]>([]);
	const [failure, setFailure] = useState('');
	const [busy, setBusy] = useState(false);
	const [uploading, setUploading] = useState(false);
	const [created, setCreated] = useState(false);
	const [complete, setComplete] = useState(false);
	const [uncertain, setUncertain] = useState(false);
	const lock = useRef(false);
	const uploadLock = useRef(false);
	const progress = useRef<PublishProgress>({ packageId: '', itineraries: 0, schedules: 0 });
	const headingRef = useRef<HTMLHeadingElement>(null);
	const [create] = useMutation(CREATE_TRAVEL_PACKAGE, { fetchPolicy: 'no-cache' });
	const [createItinerary] = useMutation(CREATE_PACKAGE_ITINERARY, { fetchPolicy: 'no-cache' });
	const [createSchedule] = useMutation(CREATE_PACKAGE_SCHEDULE, { fetchPolicy: 'no-cache' });
	const [createInclude] = useMutation(CREATE_PACKAGE_INCLUDE, { fetchPolicy: 'no-cache' });
	const [createExclude] = useMutation(CREATE_PACKAGE_EXCLUDE, { fetchPolicy: 'no-cache' });
	const [createTag] = useMutation(CREATE_PACKAGE_TAG, { fetchPolicy: 'no-cache' });
	const [createPolicy] = useMutation(CREATE_PACKAGE_POLICY, { fetchPolicy: 'no-cache' });
	const [upload] = useMutation(UPLOAD_PACKAGE_IMAGE, { fetchPolicy: 'no-cache' });
	function authorized() {
		const user = currentUserVar();
		return user?._id === memberId && user.memberType === MemberType.AGENT;
	}
	async function selectImages(files: File[]) {
		if (!authorized() || uploadLock.current || lock.current || progress.current.packageId) return;
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

	function changeStep(step: number) {
		setActiveStep(step);
		requestAnimationFrame(() => {
			headingRef.current?.focus();
			headingRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
		});
	}
	function validate(step?: number) {
		const packageErrors = validatePackage(values, images);
		const tripErrors = validateTripDetails(details);
		if (step === undefined || step === 2) setDetailErrors(tripErrors);
		const days = validateItineraries(itineraries);
		const dates = validateSchedules(schedules);
		setErrors((previous) =>
			step === undefined
				? packageErrors
				: {
						...previous,
						...Object.fromEntries(stepFields[step].map((key) => [key, packageErrors[key]])),
					},
		);
		if (step === undefined || step === 3) setItineraryErrors(days);
		if (step === undefined || step === 4) setScheduleErrors(dates);
		const invalidStep = [0, 1, 2, 3, 4, 5].find(
			(index) =>
				(step === undefined || index === step) &&
				(stepFields[index].some((key) => packageErrors[key]) ||
					(index === 2 && Object.keys(tripErrors).length > 0) ||
					(index === 3 && days.some(Boolean)) ||
					(index === 4 && dates.some(Boolean))),
		);
		if (invalidStep !== undefined) {
			changeStep(invalidStep);
			return false;
		}
		return true;
	}
	async function publish() {
		if (!authorized() || lock.current || uploadLock.current || uncertain || complete) return;
		if (!validate()) return;
		lock.current = true;
		setBusy(true);
		setFailure('');
		try {
			const checkAccess = () => {
				if (!authorized()) throw new Error('Your agent session changed. Please sign in again.');
			};
			await publishPackage(buildPackageInput(values, images), itineraries, schedules, progress.current, {
				createPackage: async (input) => {
					checkAccess();
					const result = await create({ variables: { input } });
					return result.data?.createTravelPackage._id || '';
				},
				createItinerary: async (input) => {
					checkAccess();
					const result = await createItinerary({ variables: { input } });
					return result.data?.createItinerary._id || '';
				},
				createSchedule: async (input) => {
					checkAccess();
					const result = await createSchedule({ variables: { input } });
					return result.data?.createPackageSchedule._id || '';
				},
			});
			await publishTripDetails(progress.current.packageId, details, detailsProgress.current, {
				createInclude: async (input) => {
					checkAccess();
					const result = await createInclude({ variables: { input } });
					return result.data?.createPackageInclude._id || '';
				},
				createExclude: async (input) => {
					checkAccess();
					const result = await createExclude({ variables: { input } });
					return result.data?.createPackageExclude._id || '';
				},
				createTag: async (input) => {
					checkAccess();
					const result = await createTag({ variables: { input } });
					return result.data?.createPackageTag._id || '';
				},
				createPolicy: async (input) => {
					checkAccess();
					const result = await createPolicy({ variables: { input } });
					return result.data?.createPackagePolicy._id || '';
				},
			});
			setComplete(true);
			try {
				await router.push('/mypage/packages?created=1');
			} catch {
				setFailure('Everything was saved, but navigation failed. Use Back to My Packages.');
			}
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Unable to publish package.';
			// A transport error can happen after a write commits. Do not blindly repeat an unconfirmed write.
			const unknownResult = !(error instanceof ApolloError) || Boolean(error.networkError);
			setUncertain(unknownResult);
			const saved = progress.current;
			setFailure(
				`${saved.packageId ? `Package ${saved.packageId} was created and is active. Confirmed: ${saved.itineraries}/${itineraries.length} itinerary days and ${saved.schedules}/${schedules.length} schedules; ${detailsProgress.current.includes} includes, ${detailsProgress.current.excludes} excludes, ${detailsProgress.current.tags} tags, and ${detailsProgress.current.policy ? 1 : 0} policy. Publishing is incomplete. ` : 'Publishing did not complete. '}${message}${unknownResult ? ' The last save could not be confirmed. Check My Packages before trying again to avoid duplicates.' : saved.packageId ? ' Retry to save the remaining entries.' : ''}`,
			);
		} finally {
			setCreated(Boolean(progress.current.packageId));
			lock.current = false;
			setBusy(false);
		}
	}
	const disabled = busy || uploading || created || uncertain;
	const fields = {
		values,
		errors,
		disabled,
		onChange: (key: FieldName, value: string) => setValues((previous) => ({ ...previous, [key]: value })),
	};
	return (
		<div className="package-creation-page">
			<div className="package-creation-container">
				<Breadcrumbs separator="/" aria-label="Breadcrumb">
					<Link href="/">Home</Link>
					<Link href="/mypage/packages">My Packages</Link>
					<span aria-current="page">Create New Package</span>
				</Breadcrumbs>
				<Button component={Link} href="/mypage/packages" startIcon={<ArrowBack />} disabled={busy || uploading}>
					Back to My Packages
				</Button>
				<header className="package-creation-heading">
					<Typography component="h1">Create New Package</Typography>
					<Typography color="text.secondary">Build your next travel experience, one step at a time.</Typography>
				</header>
				<PackageStepper activeStep={activeStep} />
				<Paper
					component="form"
					className={`package-form-card ${activeStep === 5 ? 'package-form-pricing' : activeStep === 6 ? 'package-form-review-card' : ''}`}
					noValidate
					onSubmit={(event) => {
						event.preventDefault();
						if (activeStep < 6) {
							if (!disabled && validate(activeStep)) changeStep(activeStep + 1);
						} else void publish();
					}}
				>
					<header className="package-form-step-heading">
						<Typography variant="overline">
							Step {activeStep + 1} of 7{activeStep === 5 ? ': Pricing' : ''}
						</Typography>
						<Typography component="h2" tabIndex={-1} ref={headingRef}>
							{activeStep === 5
								? 'Set the base price travelers will pay per person for this package.'
								: activeStep === 6
									? 'Review & Publish'
									: activeStep === 0
										? 'Basic Information'
										: stepLabels[activeStep]}
						</Typography>
						{activeStep === 6 && (
							<Typography color="text.secondary">
								Review your package information before publishing it on WWT.
							</Typography>
						)}
					</header>
					{activeStep === 0 && (
						<BasicInfoStep
							{...fields}
							images={images}
							uploading={uploading}
							onUpload={(files) => void selectImages(files)}
							onRemove={(index) => setImages((previous) => previous.filter((_, i) => i !== index))}
						/>
					)}
					{activeStep === 1 && <DestinationStep {...fields} />}
					{activeStep === 2 && (
						<TripDetailsStep {...fields} details={details} detailErrors={detailErrors} onDetailsChange={setDetails} />
					)}
					{activeStep === 3 && (
						<ItineraryStep items={itineraries} errors={itineraryErrors} disabled={disabled} onChange={setItineraries} />
					)}
					{activeStep === 4 && (
						<ScheduleStep items={schedules} errors={scheduleErrors} disabled={disabled} onChange={setSchedules} />
					)}
					{activeStep === 5 && <PricingStep {...fields} scheduleCount={schedules.length} />}
					{activeStep === 6 && (
						<ReviewStep
							details={details}
							values={values}
							images={images}
							itineraries={itineraries}
							schedules={schedules}
						/>
					)}
					{failure && (
						<Alert severity={complete ? 'warning' : 'error'}>
							{failure}
							{(created || uncertain) && (
								<>
									{' '}
									<Link href="/mypage/packages">Back to My Packages</Link>
								</>
							)}
						</Alert>
					)}
					{complete && (
						<Alert severity="success">
							Package published successfully. <Link href="/mypage/packages">Back to My Packages</Link>
						</Alert>
					)}
					<footer className="package-form-actions">
						<Button
							variant="outlined"
							disabled={activeStep === 0 || disabled}
							onClick={() => changeStep(activeStep - 1)}
						>
							Previous
						</Button>
						<Button type="submit" variant="contained" disabled={busy || uploading || uncertain || complete}>
							{busy
								? 'Publishing…'
								: activeStep < 6
									? activeStep === 5
										? 'Next Step'
										: 'Next'
									: created
										? 'Retry Remaining Entries'
										: 'Publish Package'}
						</Button>
					</footer>
				</Paper>
			</div>
		</div>
	);
}
