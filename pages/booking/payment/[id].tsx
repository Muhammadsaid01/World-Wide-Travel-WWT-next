import { CREATE_PAYMENT } from '@/apollo/user/mutation';
import PaymentForm, { PaymentFormHandle } from '@/libs/components/booking/PaymentForm';
import BookingConfirmation from '@/libs/components/booking/BookingConfirmation';
import { currentUserVar } from '@/apollo/store';
import { GET_MY_BOOKING, GET_MY_PAYMENTS } from '@/apollo/user/query';
import withLayout from '@/libs/components/layout/withLayout';
import PackageImage from '@/libs/components/package/PackageImage';
import { formatScheduleDate } from '@/libs/components/package/PackageSchedules';
import { BookingStatus, PaymentMethod, PaymentStatus } from '@/libs/enums/booking.enum';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import AccountBalanceOutlined from '@mui/icons-material/AccountBalanceOutlined';
import Apple from '@mui/icons-material/Apple';
import ArrowBack from '@mui/icons-material/ArrowBack';
import CheckCircle from '@mui/icons-material/CheckCircle';
import CreditCardOutlined from '@mui/icons-material/CreditCardOutlined';
import Google from '@mui/icons-material/Google';
import { Alert, Button, Divider, Paper, Skeleton, Stack, Step, StepLabel, Stepper, Typography } from '@mui/material';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useRef, useState } from 'react';

const methodLabels: Record<PaymentMethod, string> = {
	[PaymentMethod.CARD]: 'Card',
	[PaymentMethod.KAKAOPAY]: 'KakaoPay',
	[PaymentMethod.TOSSPAY]: 'TossPay',
	[PaymentMethod.PAYPAL]: 'PayPal',
	[PaymentMethod.NAVERPAY]: 'Naver Pay',
	[PaymentMethod.APPLEPAY]: 'Apple Pay',
	[PaymentMethod.GOOGLEPAY]: 'Google Pay',
	[PaymentMethod.ALIPAY]: 'Alipay',
	[PaymentMethod.WECHATPAY]: 'WeChat Pay',
	[PaymentMethod.BANK_TRANSFER]: 'Bank Transfer',
};

function MethodMark({ method }: { method: PaymentMethod }) {
	if (method === PaymentMethod.CARD) return <CreditCardOutlined />;
	if (method === PaymentMethod.BANK_TRANSFER) return <AccountBalanceOutlined />;
	if (method === PaymentMethod.APPLEPAY) return <Apple />;
	if (method === PaymentMethod.GOOGLEPAY) return <Google />;
	return <span className={`payment-brand payment-brand--${method.toLowerCase()}`}>{methodLabels[method]}</span>;
}

function PaymentPage() {
	const [chosenMethod, setChosenMethod] = useState(PaymentMethod.CARD);
	const [unavailableMethod, setUnavailableMethod] = useState<PaymentMethod | null>(null);
	const [submitError, setSubmitError] = useState('');
	const [submitting, setSubmitting] = useState(false);
	const submissionLock = useRef(false);
	const cardForm = useRef<PaymentFormHandle>(null);
	const [createPayment, created] = useMutation(CREATE_PAYMENT);
	function selectMethod(method: PaymentMethod) {
		if (method !== PaymentMethod.CARD && method !== PaymentMethod.BANK_TRANSFER) {
			setUnavailableMethod(method);
			return;
		}
		setUnavailableMethod(null);
		if (currentPayment || submitting) return;
		cardForm.current?.clear();
		setChosenMethod(method);
	}

	const router = useRouter();
	const user = useReactiveVar(currentUserVar);
	const id = typeof router.query.id === 'string' ? router.query.id : '';
	const { data, loading, error, refetch } = useQuery(GET_MY_BOOKING, {
		variables: { bookingId: id },
		skip: !router.isReady || !id || !user,
		fetchPolicy: 'no-cache',
		notifyOnNetworkStatusChange: true,
	});
	const payments = useQuery(GET_MY_PAYMENTS, {
		skip: !user || !router.isReady || !id,
		fetchPolicy: 'network-only',
		notifyOnNetworkStatusChange: true,
	});
	const attempts = payments.data?.getMyPayments.filter((payment) => payment.bookingId === id) ?? [];
	const existing = attempts.find(
		(payment) =>
			payment.paymentStatus === PaymentStatus.PENDING ||
			payment.paymentStatus === PaymentStatus.PAID ||
			payment.paymentStatus === PaymentStatus.REFUNDED,
	);
	const currentPayment =
		existing ?? (created.data?.createPayment.bookingId === id ? created.data.createPayment : undefined);
	const selectedMethod = currentPayment?.paymentMethod ?? chosenMethod;
	const confirmation =
		router.query.step === 'confirmation' && Boolean(currentPayment) && !payments.loading && !payments.error;
	const booking = data?.getMyBooking;

	const money = (amount: number) =>
		`${booking?.currency ?? ''} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
	async function continueToConfirmation() {
		if (!booking || submissionLock.current || payments.loading || payments.error) return;
		if (!currentPayment && booking.bookingStatus !== BookingStatus.PENDING) return;
		if (!currentPayment && selectedMethod === PaymentMethod.CARD && !cardForm.current?.validate()) return;
		submissionLock.current = true;
		setSubmitting(true);
		setSubmitError('');
		try {
			if (!currentPayment) {
				// Only identifiers/method leave the page. Amount/status are set by the backend.
				await createPayment({ variables: { input: { bookingId: booking._id, paymentMethod: selectedMethod } } });
			}
			cardForm.current?.clear();
			await Promise.all([payments.refetch(), refetch()]);
			await router.push({ pathname: router.pathname, query: { id, step: 'confirmation' } });
		} catch {
			setSubmitError('Unable to continue. Please retry; existing payment records will be reused.');
			await payments.refetch().catch(() => undefined);
		} finally {
			submissionLock.current = false;
			setSubmitting(false);
		}
	}
	return (
		<div className={`booking-page payment-page${confirmation ? ' is-confirmation' : ''}`}>
			<Head>
				<title>{confirmation ? 'Confirmation' : 'Payment'} | WWT</title>
			</Head>
			{!confirmation && (
				<>
					<Button
						component={Link}
						href={booking?.packageData ? `/package/${booking.packageData._id}` : '/package'}
						startIcon={<ArrowBack />}
					>
						Back to Package
					</Button>

					<Typography component="h1" variant="h4">
						{confirmation ? 'Confirmation' : 'Payment'}
					</Typography>
				</>
			)}
			{!router.isReady || loading ? (
				<Skeleton variant="rounded" height={220} />
			) : !user ? (
				<Stack spacing={2}>
					<Alert severity="info">Log in to view this booking.</Alert>
					<Button component={Link} href="/account/login">
						Login
					</Button>
				</Stack>
			) : error ? (
				<Alert
					severity="error"
					action={
						<Button
							color="inherit"
							onClick={() => {
								void refetch().catch(() => undefined);
							}}
						>
							Retry
						</Button>
					}
				>
					This booking could not be loaded. {error.message}
				</Alert>
			) : !booking ? (
				<Alert severity="info">Booking information is unavailable.</Alert>
			) : confirmation && currentPayment ? (
				<BookingConfirmation payment={currentPayment} booking={booking} />
			) : (
				<div className="booking-layout payment-layout">
					<Stack spacing={3} className="payment-content">
						<Stepper activeStep={1} alternativeLabel className="booking-progress">
							{['Traveler Info', 'Payment', 'Confirmation'].map((label) => (
								<Step key={label}>
									<StepLabel>{label}</StepLabel>
								</Step>
							))}
						</Stepper>
						<>
							<Paper variant="outlined" className="booking-panel">
								<Typography component="h2" variant="h6">
									Payment method
								</Typography>
								<Typography color="text.secondary" variant="body2">
									{currentPayment
										? 'The existing payment method is retained. Continue to view its current status.'
										: 'Choose how you would like to pay.'}
								</Typography>
								<div className="payment-methods" role="group" aria-label="Payment methods">
									{Object.values(PaymentMethod).map((method) => (
										<div key={method} className="payment-method-option">
											<Button
												fullWidth
												type="button"
												variant="outlined"
												className={`payment-method${method === selectedMethod ? ' is-selected' : ''}`}
												aria-pressed={method === selectedMethod}
												aria-describedby={unavailableMethod === method ? `unavailable-${method}` : undefined}
												onClick={() => selectMethod(method)}
											>
												<span className="payment-method-mark" aria-hidden="true">
													<MethodMark method={method} />
												</span>
												<span>{methodLabels[method]}</span>
												{method === selectedMethod && (
													<CheckCircle className="payment-selection-mark" aria-label="Selected" />
												)}
											</Button>
											{unavailableMethod === method && (
												<p id={`unavailable-${method}`} className="payment-unavailable" role="status">
													This payment method is currently unavailable.
												</p>
											)}
										</div>
									))}
								</div>
							</Paper>
							{!currentPayment && (
								<Paper variant="outlined" className="booking-panel">
									{selectedMethod === PaymentMethod.CARD ? (
										<>
											<Typography component="h2" variant="h6">
												Card Information
											</Typography>
											<Typography variant="body2" color="text.secondary">
												For UI testing only. Use test details. No card will be charged.
											</Typography>
											<PaymentForm key={id} ref={cardForm} />
										</>
									) : (
										<Stack spacing={2}>
											<Typography component="h2" variant="h6">
												Bank Transfer Information
											</Typography>
											<Typography>Bank: Toss Bank</Typography>
											<Typography>Account Holder: WWT</Typography>
											<Typography>Account Number: 100171613083</Typography>
											<Typography>Transfer Amount: {money(booking.finalPrice)}</Typography>
											<Typography>Booking Reference: {booking.bookingCode}</Typography>
											<Typography>Please include your booking reference when making the transfer.</Typography>
										</Stack>
									)}
								</Paper>
							)}

							{payments.loading ? (
								<Skeleton height={70} />
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
									Existing payments could not be loaded.
								</Alert>
							) : null}
							{currentPayment && (
								<Paper variant="outlined" className="booking-panel">
									<Typography component="h2" variant="h6">
										Payment record
									</Typography>
									<Typography>Reference: {currentPayment._id}</Typography>
									<Typography>Method: {methodLabels[currentPayment.paymentMethod]}</Typography>
									<Typography>Status: {currentPayment.paymentStatus}</Typography>
									<Typography>
										Amount: {currentPayment.currency}{' '}
										{currentPayment.paymentAmount.toLocaleString('en-US', {
											minimumFractionDigits: 2,
											maximumFractionDigits: 2,
										})}
									</Typography>
									<Typography color="text.secondary">
										This is the backend record status, not a gateway payment receipt.
									</Typography>
								</Paper>
							)}
							{!currentPayment && attempts.length > 0 && (
								<Typography color="text.secondary">
									Last payment attempt: {attempts[0].paymentStatus}. A new pending attempt can be created.
								</Typography>
							)}

							{booking.bookingStatus !== BookingStatus.PENDING && (
								<Alert severity="info">
									This booking is {booking.bookingStatus.toLowerCase()} and is not eligible for a new payment.
								</Alert>
							)}
						</>
					</Stack>
					<Paper variant="outlined" className="booking-panel booking-summary">
						<Stack spacing={2}>
							<Typography component="h2" variant="h6">
								Booking Summary
							</Typography>
							{booking.packageData && (
								<>
									<div className="booking-summary-image">
										<PackageImage path={booking.packageData.packageImages[0]} alt={booking.packageData.packageTitle} />
									</div>
									<Typography component="h3" variant="h6">
										{booking.packageData.packageTitle}
									</Typography>
									<Typography color="text.secondary" variant="body2">
										{booking.packageData.destinationCity}, {booking.packageData.destinationCountry}
									</Typography>
								</>
							)}
							<Typography variant="body2">Booking {booking.bookingCode}</Typography>
							<Typography variant="body2">Status: {booking.bookingStatus}</Typography>
							{booking.scheduleData && (
								<Typography variant="body2">
									{formatScheduleDate(booking.scheduleData.startDate)} –{' '}
									{formatScheduleDate(booking.scheduleData.endDate)}
								</Typography>
							)}
							<Typography variant="body2">{booking.peopleCount} travelers</Typography>
							<Divider />
							<div className="payment-price-row">
								<Typography>Subtotal</Typography>
								<Typography>{money(booking.totalPrice)}</Typography>
							</div>
							<div className="payment-price-row">
								<Typography>Discount</Typography>
								<Typography>{money(booking.discountAmount)}</Typography>
							</div>
							<Divider />
							<div className="payment-price-row">
								<Typography variant="h6">Total</Typography>
								<Typography variant="h6">{money(booking.finalPrice)}</Typography>
							</div>
							{!confirmation && (
								<Button
									className="payment-primary-action"
									type="button"
									variant="contained"
									size="large"
									disabled={
										submitting ||
										(!currentPayment && booking.bookingStatus !== BookingStatus.PENDING) ||
										payments.loading ||
										Boolean(payments.error)
									}
									onClick={() => {
										void continueToConfirmation();
									}}
								>
									{submitting
										? 'Continuing…'
										: currentPayment
											? 'View confirmation'
											: selectedMethod === PaymentMethod.BANK_TRANSFER
												? 'Continue with Bank Transfer'
												: `Pay ${money(booking.finalPrice)}`}
								</Button>
							)}
							{submitError && <Alert severity="error">{submitError}</Alert>}
						</Stack>
					</Paper>
				</div>
			)}
		</div>
	);
}
export default withLayout(PaymentPage);
