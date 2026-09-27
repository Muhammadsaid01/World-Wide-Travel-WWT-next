import Head from 'next/head';
import withLayout from '@/libs/components/layout/withLayout';
import EditProfile from '@/libs/components/mypage/EditProfile';
function EditProfilePage() {
	return (
		<>
			<Head>
				<title>Edit Profile | WWT</title>
			</Head>
			<EditProfile />
		</>
	);
}
export default withLayout(EditProfilePage);
