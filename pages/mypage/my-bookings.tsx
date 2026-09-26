import Head from 'next/head';
import MyBookings from '@/libs/components/mypage/MyBookings';
import withLayout from '@/libs/components/layout/withLayout';

function MyBookingsPage() {
	return (
		<>
			<Head>
				<title>My Bookings | WWT</title>
			</Head>
			<MyBookings />
		</>
	);
}
export default withLayout(MyBookingsPage);
