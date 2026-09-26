import type { PaymentBooking } from '@/apollo/user/query';
import { BookingStatus, PaymentMethod, PaymentStatus } from '@/libs/enums/booking.enum';
import type { Payment } from '@/libs/types/booking/payment';
import PackageImage from '@/libs/components/package/PackageImage';
import { formatScheduleDate } from '@/libs/components/package/PackageSchedules';
import ArrowBack from '@mui/icons-material/ArrowBack';
import TaskAlt from '@mui/icons-material/TaskAlt';
import Schedule from '@mui/icons-material/Schedule';
import { Button, Divider, Paper, Step, StepLabel, Stepper, Typography } from '@mui/material';
import Link from 'next/link';

export default function BookingConfirmation({
	payment,
	booking,
}: {
	payment: Pick<Payment, '_id' | 'paymentMethod' | 'paymentStatus' | 'currency' | 'paymentAmount'>;
	booking: PaymentBooking;
}) {
	const pending = payment.paymentStatus === PaymentStatus.PENDING;
	const pendingLabel =
		payment.paymentMethod === PaymentMethod.BANK_TRANSFER
			? 'Bank transfer verification pending'
			: 'Payment verification pending';
	return (
		<section className="booking-confirmation">
			<div className="confirmation-navigation">
				<Button
					component={Link}
					href={booking.packageData ? `/package/${booking.packageData._id}` : '/package'}
					startIcon={<ArrowBack />}
				>
					Back to Package
				</Button>
				<Stepper
					activeStep={3}
					alternativeLabel
					className="confirmation-progress"
					aria-label="Booking submission steps"
				>
					{['Traveler Info', 'Payment', 'Confirmation'].map((label) => (
						<Step key={label} completed>
							<StepLabel>{label}</StepLabel>
						</Step>
					))}
				</Stepper>
			</div>
			<div className="confirmation-content">
				<header className="confirmation-heading">
					<div className="confirmation-icon" aria-hidden="true">
						<TaskAlt />
					</div>
					<Typography component="h1">
						{booking.bookingStatus === BookingStatus.PENDING ? 'Booking Submitted!' : 'Booking Details'}
					</Typography>
					<Typography className="confirmation-number">
						Booking Number: <strong>{booking.bookingCode}</strong>
					</Typography>
					<Typography color="text.secondary">
						{pending && booking.bookingStatus === BookingStatus.PENDING
							? 'Your booking has been submitted and is awaiting payment verification.'
							: 'Your current booking and payment details are shown below.'}
					</Typography>
				</header>
				<Paper variant="outlined" className="confirmation-summary">
					<div className="confirmation-package">
						<div className="confirmation-image">
							<PackageImage
								path={booking.packageData?.packageImages[0]}
								alt={booking.packageData?.packageTitle ?? 'Travel package'}
							/>
						</div>
						<div className="confirmation-package-info">
							<Typography component="h2">
								{booking.packageData?.packageTitle ?? 'Package information unavailable'}
							</Typography>
							{booking.scheduleData && (
								<Typography variant="body2" color="text.secondary">
									{formatScheduleDate(booking.scheduleData.startDate)} –{' '}
									{formatScheduleDate(booking.scheduleData.endDate)}
								</Typography>
							)}
							{/* Duration/nights are not exposed by the existing booking query. */}
							<div className="confirmation-facts">
								<div>
									<Typography className="confirmation-label">Travelers</Typography>
									<Typography>
										{booking.peopleCount} {booking.peopleCount === 1 ? 'Traveler' : 'Travelers'}
									</Typography>
								</div>
								<div>
									<Typography className="confirmation-label">Payment status</Typography>
									<Typography className="confirmation-status">
										{pending && <Schedule aria-hidden="true" />}
										{payment.paymentStatus}
									</Typography>
									{pending && (
										<Typography variant="body2" color="text.secondary">
											{pendingLabel}
										</Typography>
									)}
								</div>
							</div>
							<Typography variant="body2" color="text.secondary">
								Booking status: {booking.bookingStatus}
							</Typography>
						</div>
					</div>
					<Divider />
					<div className="confirmation-total">
						<Typography>Booking Total</Typography>
						<Typography component="strong">
							{booking.currency}{' '}
							{booking.finalPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
						</Typography>
					</div>
				</Paper>
				<div className="confirmation-actions">
					{/* Connect the My Booking route once it is implemented. */}
					<Button type="button" variant="contained" disabled className="confirmation-view-booking">
						View My Booking
					</Button>
					<Button component={Link} href="/" variant="outlined">
						Back to Home
					</Button>
				</div>
			</div>
		</section>
	);
}
