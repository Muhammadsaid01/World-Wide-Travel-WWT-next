import Head from 'next/head';
import withLayout from '@/libs/components/layout/withLayout';
import MyProfile from '@/libs/components/mypage/MyProfile';
function ProfilePage() {
	return (
		<>
			<Head>
				<title>My Profile | WWT</title>
			</Head>
			<MyProfile />
		</>
	);
}
export default withLayout(ProfilePage);
