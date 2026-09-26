import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useQuery, useReactiveVar } from '@apollo/client';
import { Alert, Button, Paper, Skeleton, Stack, Typography } from '@mui/material';
import { currentUserVar } from '@/apollo/store';
import { GET_MY_BOOKING } from '@/apollo/user/query';
import withLayout from '@/libs/components/layout/withLayout';

function PaymentPage() {
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
	return (
		<div className="booking-page">
			<Head>
				<title>Payment | WWT</title>
			</Head>
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
				<Paper variant="outlined" className="booking-panel">
					<Stack spacing={2}>
						<Typography variant="h6">Booking {booking.bookingCode}</Typography>
						<Typography>Status: {booking.bookingStatus}</Typography>
						<Typography>{booking.peopleCount} travelers</Typography>
						<Typography>
							Total: {booking.currency} {booking.finalPrice.toLocaleString('en-US', { maximumFractionDigits: 2 })}
						</Typography>
						<Alert severity="info">
							Your booking and traveler details have been saved. Payment is not available yet. No payment has been
							taken.
						</Alert>
					</Stack>
				</Paper>
			)}
		</div>
	);
}
export default withLayout(PaymentPage);
