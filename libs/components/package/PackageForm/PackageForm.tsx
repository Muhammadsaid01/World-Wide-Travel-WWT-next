import { currentUserVar } from '@/apollo/store';
import {
	CREATE_PACKAGE_EXCLUDE,
	CREATE_PACKAGE_INCLUDE,
	CREATE_PACKAGE_ITINERARY,
	CREATE_PACKAGE_POLICY,
	CREATE_PACKAGE_SCHEDULE,
	CREATE_PACKAGE_TAG,
	CREATE_TRAVEL_PACKAGE,
	DELETE_PACKAGE_EXCLUDE,
	DELETE_PACKAGE_INCLUDE,
	DELETE_PACKAGE_ITINERARY,
	DELETE_PACKAGE_POLICY,
	DELETE_PACKAGE_TAG,
	UPDATE_PACKAGE_ITINERARY,
	UPDATE_PACKAGE_POLICY,
	UPDATE_PACKAGE_SCHEDULE,
	UPDATE_TRAVEL_PACKAGE,
	UPLOAD_PACKAGE_IMAGE,
} from '@/apollo/user/mutation';
import {
	GET_PACKAGE_INCLUSIONS,
	GET_PACKAGE_ITINERARIES,
	GET_PACKAGE_POLICY,
	GET_PACKAGE_SCHEDULES,
	GET_PACKAGE_TAGS,
	GET_TRAVEL_PACKAGE,
} from '@/apollo/user/query';
import { MemberType } from '@/libs/enums/member.enum';
import { ApolloError, useMutation, useQuery } from '@apollo/client';
import ArrowBack from '@mui/icons-material/ArrowBack';
import { Alert, Breadcrumbs, Button, Paper, Skeleton, Typography } from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { EditAction, EditProgress, runEditActions } from './editProgress';
import BasicInfoStep from './BasicInfoStep';
import DestinationStep from './DestinationStep';
import ItineraryStep from './ItineraryStep';
import PackageStepper, { stepLabels } from './PackageStepper';
import PricingStep from './PricingStep';
import ReviewStep from './ReviewStep';
import ScheduleStep from './ScheduleStep';
import TripDetailsStep from './TripDetailsStep';
import {
	buildPackageInput,
	buildPackageUpdate,
	Errors,
	FieldName,
	initialValues,
	itinerariesToValues,
	ItineraryValues,
	packageToValues,
	schedulesToValues,
	ScheduleValues,
	stepFields,
	validateItineraries,
	validatePackage,
	validateSchedules,
} from './formState';

import { publishPackage, PublishProgress } from './publishPackage';
import {
	initialTripDetails,
	newTripDetailsProgress,
	packageTripDetailsToValues,
	publishTripDetails,
	TripDetailsErrors,
	validateTripDetails,
} from './tripDetailsState';

type PackageFormProps = {
	memberId: string;
	mode?: 'create' | 'edit';
	packageId?: string;
};

export default function PackageForm({ memberId, mode = 'create', packageId }: PackageFormProps) {
	const router = useRouter();
	const isEdit = mode === 'edit';
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
	const hydrated = useRef(false);
	const [editReady, setEditReady] = useState(false);
	const [editStarted, setEditStarted] = useState(false);
	const editActions = useRef<EditAction[]>([]);
	const editProgress = useRef<EditProgress>({ next: 0 });
	const originalItineraries = useRef<ItineraryValues[]>([]);
	const originalSchedules = useRef<ScheduleValues[]>([]);

	const originalIncludes = useRef<{ _id: string; content: string }[]>([]);

	const originalExcludes = useRef<{ _id: string; title: string }[]>([]);

	const originalTags = useRef<{ _id: string; tagName: string }[]>([]);

	const originalPolicy = useRef<{
		_id: string;
		cancelPolicy: string;
		refundPolicy: string;
	} | null>(null);
	const progress = useRef<PublishProgress>({ packageId: '', itineraries: 0, schedules: 0 });
	const headingRef = useRef<HTMLHeadingElement>(null);
	const shouldLoadEditData = isEdit && Boolean(packageId);

	const {
		data: packageData,
		loading: packageLoading,
		error: packageError,
	} = useQuery(GET_TRAVEL_PACKAGE, {
		variables: { input: packageId ?? '' },
		skip: !shouldLoadEditData,
		fetchPolicy: 'no-cache',
	});

	const {
		data: itineraryData,
		loading: itineraryLoading,
		error: itineraryError,
	} = useQuery(GET_PACKAGE_ITINERARIES, {
		variables: { packageId: packageId ?? '' },
		skip: !shouldLoadEditData,
		fetchPolicy: 'no-cache',
	});

	const {
		data: scheduleData,
		loading: scheduleLoading,
		error: scheduleError,
	} = useQuery(GET_PACKAGE_SCHEDULES, {
		variables: { packageId: packageId ?? '' },
		skip: !shouldLoadEditData,
		fetchPolicy: 'no-cache',
	});

	const {
		data: inclusionData,
		loading: inclusionLoading,
		error: inclusionError,
	} = useQuery(GET_PACKAGE_INCLUSIONS, {
		variables: { packageId: packageId ?? '' },
		skip: !shouldLoadEditData,
		fetchPolicy: 'no-cache',
	});

	const {
		data: tagData,
		loading: tagLoading,
		error: tagError,
	} = useQuery(GET_PACKAGE_TAGS, {
		variables: { packageId: packageId ?? '' },
		skip: !shouldLoadEditData,
		fetchPolicy: 'no-cache',
	});

	const {
		data: policyData,
		loading: policyLoading,
		error: policyError,
	} = useQuery(GET_PACKAGE_POLICY, {
		variables: { packageId: packageId ?? '' },
		skip: !shouldLoadEditData,
		fetchPolicy: 'no-cache',
	});

	const editLoading =
		packageLoading || itineraryLoading || scheduleLoading || inclusionLoading || tagLoading || policyLoading;

	const editError = packageError || itineraryError || scheduleError || inclusionError || tagError || policyError;
	const editDataComplete = Boolean(
		packageData?.getTravelPackage &&
		itineraryData?.getItineraries &&
		scheduleData?.getPackageSchedules &&
		inclusionData?.getPackageIncludes &&
		inclusionData?.getPackageExcludes &&
		tagData?.getPackageTags &&
		policyData?.getPackagePolicy,
	);
	const ownsPackage = packageData?.getTravelPackage?.agentData?.memberId === memberId;
	useEffect(() => {
		if (hydrated.current || !isEdit || editLoading || editError || !editDataComplete || !ownsPackage) {
			return;
		}

		const pkg = packageData?.getTravelPackage;
		if (!pkg) return;

		hydrated.current = true;

		originalItineraries.current = itinerariesToValues(itineraryData?.getItineraries ?? []);
		originalSchedules.current = schedulesToValues(scheduleData?.getPackageSchedules ?? []);
		originalIncludes.current = (inclusionData?.getPackageIncludes ?? []).map((item) => ({
			_id: String(item._id),
			content: item.content,
		}));

		originalExcludes.current = (inclusionData?.getPackageExcludes ?? []).map((item) => ({
			_id: String(item._id),
			title: item.title,
		}));

		originalTags.current = (tagData?.getPackageTags ?? []).map((item) => ({
			_id: String(item._id),
			tagName: item.tagName,
		}));

		const policy = policyData?.getPackagePolicy?.[0];

		originalPolicy.current = policy
			? {
					_id: String(policy._id),
					cancelPolicy: policy.cancelPolicy,
					refundPolicy: policy.refundPolicy,
				}
			: null;

		queueMicrotask(() => {
			setEditReady(true);
			setValues(packageToValues(pkg));
			setImages(pkg.packageImages ?? []);

			setItineraries(itinerariesToValues(itineraryData?.getItineraries ?? []));

			setSchedules(schedulesToValues(scheduleData?.getPackageSchedules ?? []));

			setDetails(
				packageTripDetailsToValues(
					inclusionData?.getPackageIncludes ?? [],
					inclusionData?.getPackageExcludes ?? [],
					tagData?.getPackageTags ?? [],
					policyData?.getPackagePolicy ?? [],
				),
			);
		});
	}, [
		editError,
		editDataComplete,
		ownsPackage,
		isEdit,
		editLoading,
		packageData,
		itineraryData,
		scheduleData,
		inclusionData,
		tagData,
		policyData,
	]);
	const [create] = useMutation(CREATE_TRAVEL_PACKAGE, { fetchPolicy: 'no-cache' });
	const [createItinerary] = useMutation(CREATE_PACKAGE_ITINERARY, { fetchPolicy: 'no-cache' });
	const [createSchedule] = useMutation(CREATE_PACKAGE_SCHEDULE, { fetchPolicy: 'no-cache' });
	const [createInclude] = useMutation(CREATE_PACKAGE_INCLUDE, { fetchPolicy: 'no-cache' });
	const [createExclude] = useMutation(CREATE_PACKAGE_EXCLUDE, { fetchPolicy: 'no-cache' });
	const [createTag] = useMutation(CREATE_PACKAGE_TAG, { fetchPolicy: 'no-cache' });
	const [createPolicy] = useMutation(CREATE_PACKAGE_POLICY, { fetchPolicy: 'no-cache' });
	const [updatePackage] = useMutation(UPDATE_TRAVEL_PACKAGE, {
		fetchPolicy: 'no-cache',
	});

	const [updateItinerary] = useMutation(UPDATE_PACKAGE_ITINERARY, {
		fetchPolicy: 'no-cache',
	});

	const [updateSchedule] = useMutation(UPDATE_PACKAGE_SCHEDULE, {
		fetchPolicy: 'no-cache',
	});

	const [updatePolicy] = useMutation(UPDATE_PACKAGE_POLICY, {
		fetchPolicy: 'no-cache',
	});
	const [upload] = useMutation(UPLOAD_PACKAGE_IMAGE, { fetchPolicy: 'no-cache' });

	const [deleteItinerary] = useMutation(DELETE_PACKAGE_ITINERARY, {
		fetchPolicy: 'no-cache',
	});

	const [deleteInclude] = useMutation(DELETE_PACKAGE_INCLUDE, {
		fetchPolicy: 'no-cache',
	});

	const [deleteExclude] = useMutation(DELETE_PACKAGE_EXCLUDE, {
		fetchPolicy: 'no-cache',
	});

	const [deleteTag] = useMutation(DELETE_PACKAGE_TAG, {
		fetchPolicy: 'no-cache',
	});

	const [deletePolicy] = useMutation(DELETE_PACKAGE_POLICY, {
		fetchPolicy: 'no-cache',
	});
	function authorized() {
		const user = currentUserVar();
		return user?._id === memberId && user.memberType === MemberType.AGENT && (!isEdit || (editReady && ownsPackage));
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
		const dates = validateSchedules(
			schedules.map((item) => {
				const original = scheduleData?.getPackageSchedules.find((row) => row._id === item._id);
				return original ? { ...item, startDate: String(original.startDate), endDate: String(original.endDate) } : item;
			}),
		);
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
		if (isEdit) {
			if (!packageId || !editReady) return;
			lock.current = true;
			setBusy(true);
			setFailure('');
			try {
				if (!editStarted) {
					const actions: EditAction[] = [];
					const add = (action: EditAction) => actions.push(action);
					add(() =>
						updatePackage({
							variables: {
								input: buildPackageUpdate(packageId, values, images),
							},
						}),
					);
					// Free removed day numbers before creating replacements. Stage renumbered rows
					// away from all original/final numbers so swaps respect the unique day index.
					const retained = new Set(itineraries.map((item) => item._id));
					for (const original of originalItineraries.current) {
						if (!retained.has(original._id))
							add(() => deleteItinerary({ variables: { input: { _id: original._id! } } }));
					}
					const used = new Set([...itineraries, ...originalItineraries.current].map((item) => Number(item.dayNumber)));
					let temporaryDay = 1;
					for (const item of itineraries) {
						const original = originalItineraries.current.find((row) => row._id === item._id);
						if (original && original.dayNumber !== item.dayNumber) {
							while (used.has(temporaryDay)) temporaryDay++;
							const dayNumber = temporaryDay++;
							used.add(dayNumber);
							add(() => updateItinerary({ variables: { input: { _id: item._id!, packageId, dayNumber } } }));
						}
					}
					for (const item of itineraries) {
						const original = originalItineraries.current.find((row) => row._id === item._id);
						const input = {
							packageId,
							dayNumber: Number(item.dayNumber),
							title: item.title.trim(),
							description: item.description.trim(),
						};
						if (item._id) {
							if (JSON.stringify(original) !== JSON.stringify(item))
								add(() => updateItinerary({ variables: { input: { _id: item._id!, ...input } } }));
						} else add(() => createItinerary({ variables: { input } }));
					}

					for (const item of schedules) {
						const original = originalSchedules.current.find((row) => row._id === item._id);
						if (item._id && original) {
							if (item.scheduleStatus && item.scheduleStatus !== original.scheduleStatus) {
								add(() =>
									updateSchedule({
										variables: {
											input: { _id: item._id!, packageId, scheduleStatus: item.scheduleStatus || undefined },
										},
									}),
								);
							}
						} else {
							add(() =>
								createSchedule({
									variables: {
										input: {
											packageId,
											startDate: item.startDate,
											endDate: item.endDate,
											availableSeats: Number(item.availableSeats),
											scheduleStatus: item.scheduleStatus || undefined,
										},
									},
								}),
							);
						}
					}
					const syncList = (
						original: { _id: string; value: string }[],
						values: string[],
						create: (value: string) => ReturnType<EditAction>,
						remove: (_id: string) => ReturnType<EditAction>,
						lowercase = false,
					) => {
						const normalize = (value: string) => (lowercase ? value.trim().toLowerCase() : value.trim());
						const remaining = new Set(values.map(normalize).filter(Boolean));
						for (const item of original) {
							if (remaining.has(normalize(item.value))) remaining.delete(normalize(item.value));
							else add(() => remove(item._id));
						}
						for (const value of remaining) add(() => create(value));
					};
					syncList(
						originalIncludes.current.map((item) => ({ _id: item._id, value: item.content })),
						details.packageIncludes,
						(content) => createInclude({ variables: { input: { packageId, content } } }),
						(_id) => deleteInclude({ variables: { input: { _id } } }),
					);
					syncList(
						originalExcludes.current.map((item) => ({ _id: item._id, value: item.title })),
						details.packageExcludes,
						(title) => createExclude({ variables: { input: { packageId, title } } }),
						(_id) => deleteExclude({ variables: { input: { _id } } }),
					);
					syncList(
						originalTags.current.map((item) => ({ _id: item._id, value: item.tagName })),
						details.packageTags,
						(tagName) => createTag({ variables: { input: { packageId, tagName } } }),
						(_id) => deleteTag({ variables: { input: { _id } } }),
						true,
					);
					const policy = originalPolicy.current;
					const input = { cancelPolicy: details.cancelPolicy.trim(), refundPolicy: details.refundPolicy.trim() };
					if (policy) {
						if (!input.cancelPolicy && !input.refundPolicy)
							add(() => deletePolicy({ variables: { input: { _id: policy._id } } }));
						else if (input.cancelPolicy !== policy.cancelPolicy || input.refundPolicy !== policy.refundPolicy)
							add(() => updatePolicy({ variables: { policyId: policy._id, input } }));
					} else if (input.cancelPolicy && input.refundPolicy)
						add(() => createPolicy({ variables: { input: { packageId, ...input } } }));
					editActions.current = actions;
					setEditStarted(true);
				}
				await runEditActions(editActions.current, editProgress.current, () => {
					if (!authorized()) throw new Error('Your agent session changed. Please sign in again.');
				});
				setComplete(true);
				try {
					await router.push('/mypage/packages?updated=1');
				} catch {
					setFailure('Changes saved. Use Back to My Packages.');
				}
			} catch (error) {
				const rejectedBeforeWrite =
					error instanceof ApolloError &&
					!error.networkError &&
					error.graphQLErrors.length > 0 &&
					error.graphQLErrors.every((item) =>
						[
							'GRAPHQL_PARSE_FAILED',
							'GRAPHQL_VALIDATION_FAILED',
							'BAD_USER_INPUT',
							'UNAUTHENTICATED',
							'FORBIDDEN',
						].includes(String(item.extensions?.code)),
					);
				const unknownResult = !rejectedBeforeWrite;
				setUncertain(unknownResult);
				setFailure(
					`${editProgress.current.next}/${editActions.current.length} changes confirmed. ${error instanceof Error ? error.message : 'Saving failed.'} ${unknownResult ? 'Check My Packages and reload before editing again; the last write may have completed.' : 'Retry to save the remaining changes. Inputs are locked to avoid repeating completed writes.'}`,
				);
			} finally {
				lock.current = false;
				setBusy(false);
			}
			return;
		}
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
	const disabled = busy || uploading || created || uncertain || complete || editStarted;
	const fields = {
		values,
		errors,
		disabled,
		onChange: (key: FieldName, value: string) => setValues((previous) => ({ ...previous, [key]: value })),
	};
	if (isEdit && (editLoading || (!editReady && !editError && editDataComplete && ownsPackage)))
		return <Skeleton aria-label="Loading package editor" height={400} />;
	if (isEdit && (!editReady || editError || !ownsPackage))
		return (
			<Alert severity="error">
				Unable to load this package for editing. Only your own active packages can be edited. {editError?.message}{' '}
				<Link href="/mypage/packages">Back to My Packages</Link>
			</Alert>
		);
	return (
		<div className="package-creation-page">
			<div className="package-creation-container">
				<Breadcrumbs separator="/" aria-label="Breadcrumb">
					<Link href="/">Home</Link>
					<Link href="/mypage/packages">My Packages</Link>
					<span aria-current="page">{isEdit ? 'Edit Package' : 'Create New Package'}</span>
				</Breadcrumbs>
				<Button component={Link} href="/mypage/packages" startIcon={<ArrowBack />} disabled={busy || uploading}>
					Back to My Packages
				</Button>
				<header className="package-creation-heading">
					<Typography component="h1">{isEdit ? 'Edit Package' : 'Create New Package'}</Typography>

					<Typography color="text.secondary">
						{isEdit
							? 'Update your travel package information.'
							: 'Build your next travel experience, one step at a time.'}
					</Typography>
				</header>
				{isEdit && (
					<Alert severity="info">
						Only open schedules are shown. Closed and finished schedules remain unchanged. Existing dates and seats
						cannot be edited, and existing schedules cannot be removed here. You can add departures or change an open
						schedule’s status.
					</Alert>
				)}
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
									? isEdit
										? 'Review & Save'
										: 'Review & Publish'
									: activeStep === 0
										? 'Basic Information'
										: stepLabels[activeStep]}
						</Typography>
						{activeStep === 6 && (
							<Typography color="text.secondary">
								{isEdit
									? 'Review your changes before saving them.'
									: 'Review your package information before publishing it on WWT.'}
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
						<ScheduleStep
							protectExisting={isEdit}
							items={schedules}
							errors={scheduleErrors}
							disabled={disabled}
							onChange={setSchedules}
						/>
					)}
					{activeStep === 5 && <PricingStep {...fields} scheduleCount={schedules.length} />}
					{activeStep === 6 && (
						<ReviewStep
							mode={mode}
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
							{isEdit ? 'Package updated successfully.' : 'Package published successfully.'}{' '}
							<Link href="/mypage/packages">Back to My Packages</Link>
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
								? isEdit
									? 'Saving…'
									: 'Publishing…'
								: activeStep < 6
									? activeStep === 5
										? 'Next Step'
										: 'Next'
									: created
										? 'Retry Remaining Entries'
										: isEdit
											? editStarted
												? 'Retry Remaining Changes'
												: 'Save Changes'
											: 'Publish Package'}
						</Button>
					</footer>
				</Paper>
			</div>
		</div>
	);
}
