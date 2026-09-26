import { useState } from 'react';
import CreditCardOutlined from '@mui/icons-material/CreditCardOutlined';
import ArrowBack from '@mui/icons-material/ArrowBack';
import AccountBalanceOutlined from '@mui/icons-material/AccountBalanceOutlined';
import { PaymentMethod, BookingStatus } from '@/libs/enums/booking.enum';
import PackageImage from '@/libs/components/package/PackageImage';
import { formatScheduleDate } from '@/libs/components/package/PackageSchedules';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useQuery, useReactiveVar } from '@apollo/client';
import {
	Alert,
	Button,
	Divider,
	Paper,
	Skeleton,
	Snackbar,
	Stack,
	Step,
	StepLabel,
	Stepper,
	Typography,
} from '@mui/material';
import { currentUserVar } from '@/apollo/store';
import { GET_MY_BOOKING } from '@/apollo/user/query';
import withLayout from '@/libs/components/layout/withLayout';

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

function PaymentPage() {
	const [selectedMethod, setSelectedMethod] = useState<PaymentMethod.CARD | null>(PaymentMethod.CARD);
	const [notice, setNotice] = useState<{ message: string; key: number } | null>(null);
	function showNotice(message: string) {
		setNotice((previous) => ({ message, key: (previous?.key ?? 0) + 1 }));
	}
	function selectMethod(method: PaymentMethod) {
		if (method === PaymentMethod.CARD) {
			setSelectedMethod(PaymentMethod.CARD);
			setNotice(null);
		} else showNotice('This payment method is currently unavailable.');
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
	const booking = data?.getMyBooking;
	const money = (amount: number) =>
		`${booking?.currency ?? ''} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
	return (
		<div className="booking-page">
			<Head>
				<title>Payment | WWT</title>
			</Head>
			<Button
				component={Link}
				href={booking?.packageData ? `/package/${booking.packageData._id}` : '/package'}
				startIcon={<ArrowBack />}
			>
				Back to Package
			</Button>
			<Stepper activeStep={1} alternativeLabel className="booking-progress">
				{['Traveler Info', 'Payment', 'Confirmation'].map((label) => (
					<Step key={label}>
						<StepLabel>{label}</StepLabel>
					</Step>
				))}
			</Stepper>
			<Typography component="h1" variant="h4">
				Payment
			</Typography>
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
			) : (
				<div className="booking-layout payment-layout">
					<Stack spacing={3} className="payment-content">
						<Paper variant="outlined" className="booking-panel">
							<Typography component="h2" variant="h6">
								Choose a payment method
							</Typography>
							<Typography color="text.secondary" variant="body2">
								Select how you would like to pay.
							</Typography>
							<div className="payment-methods" role="group" aria-label="Payment methods">
								{Object.values(PaymentMethod).map((method) => (
									<Button
										key={method}
										type="button"
										variant="outlined"
										className={`payment-method${selectedMethod === method ? ' is-selected' : ''}`}
										aria-pressed={selectedMethod === method}
										onClick={() => selectMethod(method)}
										startIcon={
											method === PaymentMethod.CARD ? (
												<CreditCardOutlined />
											) : method === PaymentMethod.BANK_TRANSFER ? (
												<AccountBalanceOutlined />
											) : undefined
										}
									>
										{methodLabels[method]}
									</Button>
								))}
							</div>
						</Paper>
						{selectedMethod === PaymentMethod.CARD && (
							<Paper variant="outlined" className="booking-panel">
								<Typography component="h2" variant="h6">
									Card payment
								</Typography>
								{/* Replace this non-interactive placeholder with provider-hosted fields.
       Never introduce raw card credentials into WWT state or GraphQL. */}
								<div className="payment-card-placeholder">
									<CreditCardOutlined color="primary" fontSize="large" />
									<Typography variant="subtitle1">Card details will be collected by our payment provider</Typography>
									<Typography variant="body2" color="text.secondary">
										Card entry is not available yet. There is nothing to enter or submit here.
									</Typography>
								</div>
							</Paper>
						)}
						{booking.bookingStatus !== BookingStatus.PENDING && (
							<Alert severity="info">
								This booking is {booking.bookingStatus.toLowerCase()} and is not eligible for a new payment.
							</Alert>
						)}
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
							<Button
								type="button"
								variant="contained"
								size="large"
								disabled={booking.bookingStatus !== BookingStatus.PENDING}
								onClick={() => showNotice('Card payment is not available yet.')}
							>
								Pay {money(booking.finalPrice)}
							</Button>
						</Stack>
					</Paper>
				</div>
			)}
			<Snackbar
				key={notice?.key}
				open={Boolean(notice)}
				autoHideDuration={4500}
				onClose={(_, reason) => {
					if (reason !== 'clickaway') setNotice(null);
				}}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
			>
				<Alert severity="info" variant="filled" onClose={() => setNotice(null)}>
					{notice?.message}
				</Alert>
			</Snackbar>
		</div>
	);
}
export default withLayout(PaymentPage);
