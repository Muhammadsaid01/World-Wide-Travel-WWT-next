import Head from 'next/head';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import { currentUserVar } from '@/apollo/store';
import withLayout from '@/libs/components/layout/withLayout';
import MyBookingDetail from '@/libs/components/mypage/MyBookingDetail';

function BookingDetailPage() {
	const router = useRouter();
	const user = useReactiveVar(currentUserVar);
	const id = typeof router.query.id === 'string' ? router.query.id : '';
	return (
		<>
			<Head>
				<title>Booking Detail | WWT</title>
			</Head>
			<MyBookingDetail key={`${user?._id ?? 'guest'}:${id}`} id={id} ready={router.isReady} />
		</>
	);
}
export default withLayout(BookingDetailPage);
