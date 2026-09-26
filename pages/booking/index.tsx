import Head from 'next/head';
import BookingCheckout from '@/libs/components/booking/BookingCheckout';
import withLayout from '@/libs/components/layout/withLayout';

function BookingPage() {
	return (
		<>
			<Head>
				<title>Booking | WWT</title>
			</Head>
			<BookingCheckout />
		</>
	);
}
export default withLayout(BookingPage);
