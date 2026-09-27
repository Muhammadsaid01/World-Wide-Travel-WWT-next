import Head from 'next/head';
import withLayout from '@/libs/components/layout/withLayout';
import SavedPackages from '@/libs/components/mypage/SavedPackages';
function SavedPage() {
	return (
		<>
			<Head>
				<title>Saved Packages | WWT</title>
			</Head>
			<SavedPackages />
		</>
	);
}
export default withLayout(SavedPage);
