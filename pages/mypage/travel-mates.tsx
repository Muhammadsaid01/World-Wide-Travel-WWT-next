import Head from 'next/head';
import withLayout from '@/libs/components/layout/withLayout';
import MyTravelMates from '@/libs/components/mypage/MyTravelMates';
function TravelMatesPage() {
	return (
		<>
			<Head>
				<title>My Travel Mates | WWT</title>
			</Head>
			<MyTravelMates />
		</>
	);
}
export default withLayout(TravelMatesPage);
