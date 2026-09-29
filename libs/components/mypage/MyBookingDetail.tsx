import { currentUserVar } from '@/apollo/store';
import { CANCEL_BOOKING } from '@/apollo/user/mutation';
import { GET_MY_BOOKING, GET_MY_PAYMENTS, GET_MY_TRAVELERS_BY_BOOKING } from '@/apollo/user/query';
import { BookingStatus } from '@/libs/enums/booking.enum';
import { MemberType } from '@/libs/enums/member.enum';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import ArrowBack from '@mui/icons-material/ArrowBack';
import DownloadOutlined from '@mui/icons-material/DownloadOutlined';
import EmailOutlined from '@mui/icons-material/EmailOutlined';
import LocationOnOutlined from '@mui/icons-material/LocationOnOutlined';
import PeopleAltOutlined from '@mui/icons-material/PeopleAltOutlined';
import PersonOutlined from '@mui/icons-material/PersonOutlined';
import PhoneOutlined from '@mui/icons-material/PhoneOutlined';
import PrintOutlined from '@mui/icons-material/PrintOutlined';
import {
	Alert,
	Avatar,
	Breadcrumbs,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	Divider,
	IconButton,
	Paper,
	Skeleton,
	Stack,
	Typography,
} from '@mui/material';
import Link from 'next/link';
import { useRef, useState } from 'react';
import PackageImage, { packageImageUrl } from '../package/PackageImage';
import { formatScheduleDate } from '../package/PackageSchedules';
import ProfileSidebar from './ProfileSidebar';

export default function MyBookingDetail({ id, ready }: { id: string; ready: boolean }) {
	const [cancelOpen, setCancelOpen] = useState(false);
	const [cancelBusy, setCancelBusy] = useState(false);
	const [cancelError, setCancelError] = useState('');
	const [cancelFeedback, setCancelFeedback] = useState('');
	const cancelLock = useRef(false);
	const [cancelBooking] = useMutation(CANCEL_BOOKING);

	const user = useReactiveVar(currentUserVar);
	const allowed = user?.memberType === MemberType.USER || user?.memberType === MemberType.AGENT;
	const validId = /^[a-f\d]{24}$/i.test(id);
	const query = useQuery(GET_MY_BOOKING, {
		variables: { bookingId: id },
		skip: !ready || !validId || !allowed,
		fetchPolicy: 'no-cache',
	});
	const booking = query.data?.getMyBooking;
	const travelers = useQuery(GET_MY_TRAVELERS_BY_BOOKING, {
		variables: { bookingId: id },
		skip: !allowed || !booking,
		fetchPolicy: 'no-cache',
	});
	const payments = useQuery(GET_MY_PAYMENTS, { skip: !allowed || !booking, fetchPolicy: 'no-cache' });
	const attempts = payments.data?.getMyPayments.filter((payment) => payment.bookingId === id) ?? [];
	const money = (value: number) =>
		`${booking?.currency} ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
	const packageHref = booking ? `/package/${booking.packageId}` : '/package';
	const missing = !validId || query.error?.message.includes('No data found');
	const canCancel = Boolean(
		allowed &&
		booking &&
		booking.memberId === user?._id &&
		[BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.REJECTED].includes(booking.bookingStatus),
	);
	async function confirmCancellation() {
		if (!canCancel || !booking || cancelLock.current) return;
		cancelLock.current = true;
		setCancelBusy(true);
		setCancelError('');
		setCancelFeedback('');
		try {
			const response = await cancelBooking({ variables: { input: { _id: booking._id } } });
			const updated = response.data?.cancelBooking;
			if (!updated || updated._id !== booking._id)
				throw new Error('Cancellation response was unavailable. Please reload the booking.');
			// Apply only the actual mutation response, including when a subsequent refresh fails.
			query.updateQuery((previous) => ({ ...previous, getMyBooking: { ...previous.getMyBooking, ...updated } }));
			setCancelOpen(false);
			setCancelFeedback(
				updated.bookingStatus === BookingStatus.CANCELLED
					? 'Your booking has been cancelled.'
					: `Booking status: ${updated.bookingStatus}.`,
			);
			// The list uses no-cache and fetches fresh data on return. No persistent local state is needed.
			const refreshed = await Promise.allSettled([query.refetch(), payments.refetch()]);
			if (refreshed.some((result) => result.status === 'rejected')) {
				setCancelFeedback(
					`Booking status: ${updated.bookingStatus}. Some details could not be refreshed; please reload the page.`,
				);
			}
		} catch (error: unknown) {
			setCancelError(error instanceof Error ? error.message : 'Cancellation could not be completed. Please try again.');
		} finally {
			cancelLock.current = false;
			setCancelBusy(false);
		}
	}

	return (
		<div className="my-bookings-page booking-detail-page">
			<Dialog
				open={cancelOpen}
				onClose={() => {
					if (!cancelLock.current) setCancelOpen(false);
				}}
				aria-labelledby="cancel-booking-title"
				aria-describedby="cancel-booking-description"
				fullWidth
				maxWidth="xs"
			>
				<DialogTitle id="cancel-booking-title">Cancel booking?</DialogTitle>
				<DialogContent>
					<DialogContentText id="cancel-booking-description">
						Are you sure you want to cancel this booking? This action may not be reversible.
					</DialogContentText>
					{cancelError && <Alert severity="error">{cancelError}</Alert>}
				</DialogContent>
				<DialogActions>
					<Button autoFocus disabled={cancelBusy} onClick={() => setCancelOpen(false)}>
						Keep Booking
					</Button>
					<Button
						color="error"
						variant="contained"
						disabled={!canCancel || cancelBusy}
						onClick={() => {
							void confirmCancellation();
						}}
					>
						{cancelBusy ? 'Cancelling…' : 'Cancel Booking'}
					</Button>
				</DialogActions>
			</Dialog>
			<div className="my-bookings-layout">
				<ProfileSidebar />
				<div className="booking-detail-content">
					<Breadcrumbs separator="/" className="my-bookings-breadcrumb">
						<Link href="/">Home</Link>
						<span>My Profile</span>
						<Link href="/mypage/my-bookings">My Bookings</Link>
						<span aria-current="page">Booking Detail</span>
					</Breadcrumbs>
					<Button component={Link} href="/mypage/my-bookings" startIcon={<ArrowBack />} className="booking-detail-back">
						Back to My Bookings
					</Button>
					{cancelFeedback && (
						<Alert severity="info" role="status">
							{cancelFeedback}
						</Alert>
					)}
					{!ready ? (
						<Skeleton height={160} />
					) : !user ? (
						<Alert
							severity="info"
							action={
								<Button component={Link} href="/account/login">
									Login
								</Button>
							}
						>
							Log in to view your booking.
						</Alert>
					) : !allowed ? (
						<Alert severity="info">Booking details are available to user accounts.</Alert>
					) : missing ? (
						<Alert severity="info">Booking not found or unavailable to your account.</Alert>
					) : query.loading ? (
						<Stack spacing={3} aria-label="Loading booking">
							<Skeleton height={70} />
							<Skeleton variant="rounded" height={230} />
							<div className="booking-detail-grid">
								<Skeleton variant="rounded" height={300} />
								<Skeleton variant="rounded" height={300} />
							</div>
						</Stack>
					) : query.error ? (
						<Alert
							severity="error"
							action={
								<Button
									onClick={() => {
										void query.refetch().catch(() => undefined);
									}}
								>
									Retry
								</Button>
							}
						>
							Unable to load booking. {query.error.message}
						</Alert>
					) : !booking ? (
						<Alert severity="info">Booking not found.</Alert>
					) : (
						<>
							<header className="booking-detail-header">
								<div>
									<div className="booking-detail-title">
										<Typography component="h1">Booking {booking.bookingCode}</Typography>
										<span className="booking-detail-status">{booking.bookingStatus}</span>
									</div>
									<Typography color="text.secondary">Booked on {formatScheduleDate(booking.createdAt)}</Typography>
								</div>
								<div className="booking-detail-tools">
									<IconButton aria-label="Print booking" onClick={() => window.print()}>
										<PrintOutlined />
									</IconButton>
									<IconButton disabled aria-label="Download unavailable">
										<DownloadOutlined />
									</IconButton>
								</div>
							</header>
							<Paper className="booking-detail-package" variant="outlined">
								<div className="booking-detail-image">
									<PackageImage
										path={booking.packageData?.packageImages[0]}
										alt={booking.packageData?.packageTitle ?? 'Travel package'}
									/>
								</div>
								<div className="booking-detail-package-info">
									{booking.packageData && (
										<Typography className="booking-detail-location">
											<LocationOnOutlined />
											{[booking.packageData.destinationCity, booking.packageData.destinationCountry]
												.filter(Boolean)
												.join(', ')}
										</Typography>
									)}
									<Typography component="h2">
										{booking.packageData?.packageTitle ?? 'Package information unavailable'}
									</Typography>
									<div className="booking-detail-meta">
										{booking.scheduleData && (
											<span>
												{formatScheduleDate(booking.scheduleData.startDate)} –{' '}
												{formatScheduleDate(booking.scheduleData.endDate)}
											</span>
										)}
										{booking.packageData && (
											<span>
												{booking.packageData.packageDays} days / {booking.packageData.packageNights} nights
											</span>
										)}
										<span>{booking.peopleCount} travelers</span>
									</div>
									<div className="booking-detail-agent">
										{(booking.memberData || booking.agentData) && (
											<>
												<Avatar src={packageImageUrl(booking.memberData?.memberImage)}>
													{(booking.memberData?.memberNick || booking.agentData?.companyName)?.slice(0, 1)}
												</Avatar>
												<div>
													<Typography variant="caption">LOCAL AGENT</Typography>
													{booking.memberData && <Typography>{booking.memberData.memberNick}</Typography>}
													{booking.agentData && (
														<Typography variant="body2" color="text.secondary">
															{booking.agentData.companyName}
														</Typography>
													)}
												</div>
											</>
										)}
										<Button component={Link} href={packageHref}>
											View Package →
										</Button>
									</div>
								</div>
							</Paper>
							<div className="booking-detail-grid">
								<div className="booking-detail-sections">
									<section>
										<Typography component="h2">
											<PeopleAltOutlined />
											Travelers
										</Typography>
										{travelers.loading ? (
											<Skeleton height={100} />
										) : travelers.error ? (
											<Alert
												severity="error"
												action={
													<Button
														onClick={() => {
															void travelers.refetch().catch(() => undefined);
														}}
													>
														Retry
													</Button>
												}
											>
												Traveler information could not be loaded.
											</Alert>
										) : (
											<div className="booking-detail-travelers">
												{travelers.data?.getMyTravelersByBooking.length ? (
													travelers.data.getMyTravelersByBooking.map((traveler, index) => (
														<div className="booking-detail-traveler" key={traveler._id}>
															<Avatar>
																<PersonOutlined />
															</Avatar>
															<div>
																<Typography variant="caption">Traveler {index + 1}</Typography>
																<Typography>
																	{traveler.firstName} {traveler.lastName}
																</Typography>
															</div>
														</div>
													))
												) : (
													<Typography>
														{booking.peopleCount} travelers. Individual traveler information is unavailable.
													</Typography>
												)}
											</div>
										)}
									</section>
									<section>
										<Typography component="h2">Contact</Typography>
										<Stack spacing={2} className="booking-detail-contact">
											<Typography>
												<PersonOutlined />
												{booking.contactName}
											</Typography>
											{booking.contactEmail && (
												<Typography>
													<EmailOutlined />
													{booking.contactEmail}
												</Typography>
											)}
											<Typography>
												<PhoneOutlined />
												{booking.contactPhone}
											</Typography>
										</Stack>
									</section>
									<section>
										<Typography component="h2">Requests</Typography>
										<Paper elevation={0} className="booking-detail-request">
											{booking.specialRequest?.trim() || 'No special requests.'}
										</Paper>
									</section>
									<section>
										<Typography component="h2">Timeline</Typography>
										<ol className="booking-detail-timeline">
											<li>
												<Typography>Booking Created</Typography>
												<Typography variant="body2" color="text.secondary">
													{formatScheduleDate(booking.createdAt)}
												</Typography>
											</li>
											{booking.cancelledAt && (
												<li>
													<Typography>Booking Cancelled</Typography>
													<Typography variant="body2" color="text.secondary">
														{formatScheduleDate(booking.cancelledAt)}
													</Typography>
												</li>
											)}
										</ol>
									</section>
								</div>
								<aside className="booking-detail-summary">
									<Paper variant="outlined" className="booking-detail-summary-card">
										<Typography component="h2">Booking Summary</Typography>
										<div className="booking-detail-price">
											<span>Subtotal</span>
											<span>{money(booking.totalPrice)}</span>
										</div>
										<div className="booking-detail-price">
											<span>Discount</span>
											<span>{money(booking.discountAmount)}</span>
										</div>
										<Divider />
										<div className="booking-detail-total">
											<Typography variant="caption">BOOKING TOTAL</Typography>
											<Typography>{money(booking.finalPrice)}</Typography>
										</div>
										<div className="booking-detail-payment">
											<Typography component="h3">Payment information</Typography>
											{payments.loading ? (
												<Skeleton height={90} />
											) : payments.error ? (
												<Alert
													severity="error"
													action={
														<Button
															onClick={() => {
																void payments.refetch().catch(() => undefined);
															}}
														>
															Retry
														</Button>
													}
												>
													Payments could not be loaded.
												</Alert>
											) : attempts.length ? (
												attempts.map((payment, index) => (
													<div className="booking-detail-payment-record" key={payment._id}>
														<Typography variant="caption">
															{index === 0 ? 'LATEST PAYMENT RECORD' : 'EARLIER PAYMENT RECORD'}
														</Typography>
														<Typography>Status: {payment.paymentStatus}</Typography>
														<Typography>Method: {payment.paymentMethod.replace(/_/g, ' ')}</Typography>
													</div>
												))
											) : (
												<Typography>No payment record available.</Typography>
											)}
											<Button disabled variant="outlined">
												View Receipt
											</Button>
										</div>
									</Paper>
								</aside>
							</div>
							<div className="booking-detail-actions">
								<Button component={Link} href={packageHref} variant="contained">
									View Package
								</Button>
								<Button disabled variant="outlined">
									Message Agent
								</Button>
								<Button
									disabled={!canCancel || cancelBusy}
									color="error"
									onClick={() => {
										setCancelError('');
										setCancelOpen(true);
									}}
								>
									Cancel Booking
								</Button>
							</div>
						</>
					)}
				</div>
			</div>
		</div>
	);
}
