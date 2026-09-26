import { useRouter } from 'next/router';
import { CREATE_BOOKING } from '@/apollo/user/mutation';
import type { BookingInput } from '@/libs/types/booking/booking.input';
import PackageImage from '@/libs/components/package/PackageImage';
import PackagePolicy from '@/libs/components/package/PackagePolicy';
import { useRef, useState } from 'react';
import Link from 'next/link';
import { useApolloClient, useMutation, useQuery, useReactiveVar } from '@apollo/client';
import {
	Alert,
	Box,
	Checkbox,
	FormControlLabel,
	Step,
	StepLabel,
	Stepper,
	Button,
	Divider,
	MenuItem,
	Paper,
	Skeleton,
	Stack,
	TextField,
	Typography,
} from '@mui/material';
import { bookingDraftVar, createdBookingVar, currentUserVar } from '@/apollo/store';
import { GET_TRAVEL_PACKAGE, GET_PACKAGE_SCHEDULES, VALIDATE_COUPON } from '@/apollo/user/query';
import type { BookingDraft } from '@/libs/types/booking/booking-draft';
import type { TravelerInput } from '@/libs/types/booking/traveler.input';
import type { CouponValidation } from '@/libs/types/booking/coupon';
import type { CustomJwtPayload } from '@/libs/types/customJwtPayload';
import { TravelerGender } from '@/libs/enums/booking.enum';
import { MemberType } from '@/libs/enums/member.enum';
import { ScheduleStatus } from '@/libs/enums/package.enum';
import { formatScheduleDate } from '@/libs/components/package/PackageSchedules';

export default function BookingCheckout() {
	const draft = useReactiveVar(bookingDraftVar);
	const user = useReactiveVar(currentUserVar);
	const created = useReactiveVar(createdBookingVar);
	if (!draft && created && created.memberId === user?._id)
		return (
			<div className="booking-page">
				<Alert severity="info">Booking {created.bookingCode} was created. Continue to the payment step.</Alert>
				<Button component={Link} href={`/booking/payment/${created._id}`}>
					Continue to Payment
				</Button>
			</div>
		);
	if (!draft)
		return (
			<div className="booking-page">
				<Alert severity="info">Your booking selection is unavailable. Please select a package and dates again.</Alert>
				<Button component={Link} href="/package">
					Browse Packages
				</Button>
			</div>
		);
	if (!user)
		return (
			<div className="booking-page">
				<Alert severity="info">
					Log in to continue booking. Your selection stays available in this tab until refresh.
				</Alert>
				<Button component={Link} href="/account/login">
					Login
				</Button>
			</div>
		);
	return (
		<BookingForm
			key={`${user._id}-${draft.packageId}-${draft.scheduleId}-${draft.adultCount}-${draft.childCount}-${draft.infantCount}`}
			draft={draft}
			user={user}
		/>
	);
}

type TravelerDraft = Omit<TravelerInput, 'bookingId' | 'gender'> & { gender: TravelerGender | '' };
const fields = [
	['firstName', 'First name', 'text'],
	['lastName', 'Last name', 'text'],
	['dateOfBirth', 'Date of birth', 'date'],
	['nationality', 'Nationality', 'text'],
	['passportNumber', 'Passport number', 'text'],
	['passportExpireDate', 'Passport expiry date', 'date'],
] as const;

function BookingForm({ draft, user }: { draft: BookingDraft; user: CustomJwtPayload }) {
	const client = useApolloClient();
	const router = useRouter();
	const [createBooking, { loading: submitting }] = useMutation(CREATE_BOOKING, { fetchPolicy: 'no-cache' });
	const submitLock = useRef(false);
	const [submitError, setSubmitError] = useState('');
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [agreed, setAgreed] = useState(false);
	const packageQuery = useQuery(GET_TRAVEL_PACKAGE, {
		variables: { input: draft.packageId },
		fetchPolicy: 'network-only',
	});
	const schedulesQuery = useQuery(GET_PACKAGE_SCHEDULES, {
		variables: { packageId: draft.packageId },
		fetchPolicy: 'network-only',
	});
	const [contact, setContact] = useState({
		contactName: user.memberFullName || user.memberNick || '',
		contactPhone: user.memberPhone || '',
		contactEmail: user.memberEmail || '',
		specialRequest: '',
	});
	const travelerLabels = Array.from({ length: draft.peopleCount }, (_, i) => `Traveler ${i + 1}`);
	const [travelers, setTravelers] = useState<TravelerDraft[]>(() =>
		travelerLabels.map(() => ({
			firstName: '',
			lastName: '',
			dateOfBirth: '',
			gender: '',
			nationality: '',
			passportNumber: '',
			passportExpireDate: '',
		})),
	);
	const [couponCode, setCouponCode] = useState('');
	const [coupon, setCoupon] = useState<{ result: CouponValidation; amount: number; code: string } | null>(null);
	const [couponError, setCouponError] = useState('');
	const [applying, setApplying] = useState(false);
	const item = packageQuery.data?.getTravelPackage;
	const schedule = schedulesQuery.data?.getPackageSchedules.find((entry) => entry._id === draft.scheduleId);
	const peopleCount = draft.adultCount + draft.childCount + draft.infantCount;
	const subtotal = item ? peopleCount * item.packagePrice : 0;
	const activeCoupon =
		coupon?.amount === subtotal && coupon.code === couponCode && coupon.result.valid ? coupon.result : null;
	async function applyCoupon() {
		setApplying(true);
		setCoupon(null);
		setCouponError('');
		try {
			const result = await client.query({
				query: VALIDATE_COUPON,
				variables: { input: { couponCode: couponCode.trim(), bookingAmount: subtotal } },
				fetchPolicy: 'no-cache',
			});
			if (!result.data.validateCoupon.valid) setCouponError(result.data.validateCoupon.message);
			else setCoupon({ result: result.data.validateCoupon, amount: subtotal, code: couponCode });
		} catch (error) {
			setCouponError(error instanceof Error ? error.message : 'Coupon validation failed. Please try again.');
		} finally {
			setApplying(false);
		}
	}
	if (packageQuery.loading || schedulesQuery.loading)
		return (
			<div className="booking-page" aria-label="Loading booking" aria-busy="true">
				<Skeleton height={120} />
				<Skeleton variant="rounded" height={400} />
			</div>
		);
	if (packageQuery.error || schedulesQuery.error)
		return (
			<div className="booking-page">
				<Alert severity="error">Booking information could not be loaded.</Alert>
				<Button
					onClick={() => {
						void Promise.all([packageQuery.refetch(), schedulesQuery.refetch()]).catch(() => undefined);
					}}
				>
					Retry
				</Button>
			</div>
		);
	const valid =
		item &&
		schedule &&
		schedule.scheduleStatus === ScheduleStatus.OPEN &&
		[draft.adultCount, draft.childCount, draft.infantCount].every((count) => Number.isInteger(count) && count >= 0) &&
		peopleCount === draft.peopleCount &&
		peopleCount >= Math.max(1, item.minPeople) &&
		peopleCount <= item.maxPeople &&
		peopleCount <= schedule.availableSeats;
	if (!valid)
		return (
			<div className="booking-page">
				<Alert severity="warning">
					This selection is no longer available. Please review the package dates and traveler count.
				</Alert>
				<Button component={Link} href={`/package/${draft.packageId}`}>
					Return to Package
				</Button>
			</div>
		);
	const money = (value: number) => `${item.currency} ${value.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;

	async function submit() {
		if (submitLock.current || applying || !item || !valid) return;
		const nextErrors: Record<string, string> = {};
		for (const field of ['contactName', 'contactPhone'] as const)
			if (!contact[field].trim()) nextErrors[field] = 'Required.';
		if (contact.contactEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.contactEmail.trim()))
			nextErrors.contactEmail = 'Enter a valid email.';
		const inputs: BookingInput['travelers'] = [];
		const passports = new Set<string>();
		travelers.forEach((traveler, index) => {
			for (const [field] of fields) {
				const value = traveler[field].trim();
				if (!value) nextErrors[`${index}.${field}`] = 'Required.';
				else if ((field === 'firstName' || field === 'lastName') && (value.length < 2 || value.length > 50))
					nextErrors[`${index}.${field}`] = 'Use 2–50 characters.';
				else if (
					(field === 'dateOfBirth' || field === 'passportExpireDate') &&
					(!/^\d{4}-\d{2}-\d{2}$/.test(value) ||
						Number.isNaN(Date.parse(value)) ||
						new Date(value).toISOString().slice(0, 10) !== value)
				)
					nextErrors[`${index}.${field}`] = 'Enter a valid date.';
			}
			const passport = traveler.passportNumber.trim().toUpperCase();
			if (passports.has(passport))
				nextErrors[`${index}.passportNumber`] = 'Each traveler must have a different passport number.';
			passports.add(passport);
			if (!traveler.gender) nextErrors[`${index}.gender`] = 'Select a gender.';
			else
				inputs.push({
					...traveler,
					firstName: traveler.firstName.trim(),
					lastName: traveler.lastName.trim(),
					nationality: traveler.nationality.trim(),
					passportNumber: traveler.passportNumber.trim(),
					gender: traveler.gender,
				});
		});
		if (!agreed) nextErrors.policy = 'Please agree before proceeding.';
		if (travelers.length !== peopleCount) nextErrors.count = 'Traveler count does not match your selection.';
		setErrors(nextErrors);
		setSubmitError('');
		if (Object.keys(nextErrors).length) {
			setSubmitError('Please check the highlighted fields.');
			return;
		}
		submitLock.current = true;
		try {
			const result = await createBooking({
				variables: {
					input: {
						packageId: draft.packageId,
						scheduleId: draft.scheduleId,
						adultCount: draft.adultCount,
						childCount: draft.childCount,
						infantCount: draft.infantCount,
						currency: item.currency,
						contactName: contact.contactName.trim(),
						contactPhone: contact.contactPhone.trim(),
						...(contact.contactEmail.trim() ? { contactEmail: contact.contactEmail.trim() } : {}),
						...(contact.specialRequest.trim() ? { specialRequest: contact.specialRequest.trim() } : {}),
						...(couponCode.trim() ? { couponCode: couponCode.trim() } : {}),
						travelers: inputs,
					},
				},
			});
			if (!result.data?.createBooking)
				throw new Error('No booking was returned. Please check your bookings before retrying.');
			const booking = result.data.createBooking;
			createdBookingVar(booking);
			bookingDraftVar(null);
			// A navigation failure must never trigger another booking mutation.
			await router.replace(`/booking/payment/${booking._id}`).catch(() => false);
		} catch (error) {
			setSubmitError(error instanceof Error ? error.message : 'Booking could not be created. Please try again.');
			submitLock.current = false;
		}
	}
	return (
		<div className="booking-page">
			<Typography component="h1" variant="h4">
				Traveler Details
			</Typography>
			<Typography color="text.secondary">Enter each traveler’s details exactly as shown on their passport.</Typography>
			<Stepper activeStep={0} className="booking-progress" alternativeLabel>
				{['Traveler Info', 'Payment'].map((label) => (
					<Step key={label}>
						<StepLabel>{label}</StepLabel>
					</Step>
				))}
			</Stepper>
			<form
				className="booking-layout"
				noValidate
				onSubmit={(event) => {
					event.preventDefault();
					void submit();
				}}
			>
				<Box component="fieldset" disabled={submitting} className="booking-form-fields">
					<Stack spacing={3}>
						<Paper className="booking-panel" variant="outlined">
							<Typography component="h2" variant="h6">
								Contact Information
							</Typography>
							<div className="booking-fields">
								{(['contactName', 'contactPhone', 'contactEmail'] as const).map((field) => (
									<TextField
										key={field}
										label={
											{
												contactName: 'Contact name',
												contactPhone: 'Contact phone',
												contactEmail: 'Contact email',
												specialRequest: 'Special request',
											}[field]
										}
										required={field === 'contactName' || field === 'contactPhone'}
										type={field === 'contactEmail' ? 'email' : field === 'contactPhone' ? 'tel' : 'text'}
										error={Boolean(errors[field])}
										helperText={errors[field]}
										value={contact[field]}
										onChange={(event) => setContact({ ...contact, [field]: event.target.value })}
										slotProps={{
											htmlInput: {
												pattern: field === 'contactName' || field === 'contactPhone' ? '.*\\S.*' : undefined,
											},
										}}
									/>
								))}
							</div>
						</Paper>
						<Paper className="booking-panel" variant="outlined">
							<Typography component="h2" variant="h6">
								Traveler Information
							</Typography>
							{travelers.map((traveler, index) => (
								<div className="booking-traveler" key={travelerLabels[index]}>
									<Typography component="h3" variant="subtitle1">
										{travelerLabels[index]}
									</Typography>
									<div className="booking-fields">
										{fields.map(([field, label, type]) => (
											<TextField
												key={field}
												required
												label={label}
												type={type}
												error={Boolean(errors[`${index}.${field}`])}
												helperText={errors[`${index}.${field}`]}
												value={traveler[field]}
												onChange={(event) =>
													setTravelers((previous) =>
														previous.map((entry, i) =>
															i === index ? { ...entry, [field]: event.target.value } : entry,
														),
													)
												}
												slotProps={{
													inputLabel: { shrink: type === 'date' ? true : undefined },
													htmlInput: {
														minLength: field === 'firstName' || field === 'lastName' ? 2 : undefined,
														maxLength: field === 'firstName' || field === 'lastName' ? 50 : undefined,
													},
												}}
											/>
										))}
										<TextField
											required
											select
											label="Gender"
											error={Boolean(errors[`${index}.gender`])}
											helperText={errors[`${index}.gender`]}
											value={traveler.gender}
											onChange={(event) => {
												const gender = Object.values(TravelerGender).find((value) => value === event.target.value);
												if (gender)
													setTravelers((previous) =>
														previous.map((entry, i) => (i === index ? { ...entry, gender } : entry)),
													);
											}}
										>
											{Object.values(TravelerGender).map((gender) => (
												<MenuItem key={gender} value={gender}>
													{gender}
												</MenuItem>
											))}
										</TextField>
									</div>
								</div>
							))}
						</Paper>
						<Paper className="booking-panel" variant="outlined">
							<Typography component="h2" variant="h6">
								Special Requests
							</Typography>
							<TextField
								fullWidth
								multiline
								minRows={3}
								label="Special requests (optional)"
								value={contact.specialRequest}
								onChange={(event) => setContact({ ...contact, specialRequest: event.target.value })}
							/>
						</Paper>
						<Paper className="booking-panel" variant="outlined">
							<Typography component="h2" variant="h6">
								Booking &amp; Cancellation Policy
							</Typography>
							<PackagePolicy packageId={item._id} />
							<FormControlLabel
								control={<Checkbox checked={agreed} onChange={(event) => setAgreed(event.target.checked)} />}
								label="I agree to the Booking & Cancellation Policy."
							/>
							{errors.policy && (
								<Typography color="error" variant="body2">
									{errors.policy}
								</Typography>
							)}
						</Paper>
					</Stack>
				</Box>
				<Paper className="booking-panel booking-summary" variant="outlined">
					<Stack spacing={2}>
						<Typography component="h2" variant="h6">
							Booking Summary
						</Typography>
						<div className="booking-summary-image">
							<PackageImage path={item.packageImages[0]} alt={item.packageTitle} />
						</div>
						<Paper className="booking-panel" variant="outlined">
							<Typography component="h2" variant="h6">
								{item.packageTitle}
							</Typography>
							<p>
								{item.destinationCity}, {item.destinationCountry}
							</p>
							<p>{money(item.packagePrice)} per traveler</p>
							<Divider />
							<Typography component="h3" variant="subtitle1">
								Selected Schedule
							</Typography>
							<p>
								{formatScheduleDate(schedule.startDate)} → {formatScheduleDate(schedule.endDate)}
							</p>
							<p>
								{schedule.availableSeats} seats available · {peopleCount} travelers
							</p>
						</Paper>
						<Paper className="booking-panel" variant="outlined">
							<Typography component="h2" variant="h6">
								Coupon
							</Typography>
							{user.memberType === MemberType.USER ? (
								<Stack spacing={2}>
									<TextField
										label="Coupon code"
										value={couponCode}
										disabled={applying || submitting}
										onChange={(event) => {
											setCouponCode(event.target.value);
											setCoupon(null);
											setCouponError('');
										}}
									/>
									<Button
										disabled={!couponCode.trim() || applying || submitting}
										onClick={() => {
											void applyCoupon();
										}}
									>
										{applying ? 'Checking…' : 'Apply'}
									</Button>
									{couponError && <Alert severity="error">{couponError}</Alert>}
									{activeCoupon && <Alert severity="success">{activeCoupon.message}</Alert>}
								</Stack>
							) : (
								<Typography variant="body2">Coupon validation is available to customer accounts only.</Typography>
							)}
						</Paper>
						<Typography variant="body2">
							{draft.adultCount} adults · {draft.childCount} children · {draft.infantCount} infants
						</Typography>
						<p>Subtotal: {money(subtotal)}</p>
						<p>Discount: {money(activeCoupon?.discountAmount ?? 0)}</p>
						<Divider />
						<Typography variant="h6">Final Total: {money(activeCoupon?.finalPrice ?? subtotal)}</Typography>
						<Typography variant="caption">
							Informational estimate. The backend calculates the final price when a booking is created.
						</Typography>
						{submitError && <Alert severity="error">{submitError}</Alert>}
						<Button type="submit" variant="contained" disabled={submitting || applying} loading={submitting}>
							NEXT: PAYMENT
						</Button>
						<Typography variant="caption" color="text.secondary">
							Your traveler information stays in memory until you submit. Refreshing this page clears the form.
						</Typography>
					</Stack>
				</Paper>
			</form>
		</div>
	);
}
