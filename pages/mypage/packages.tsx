import Head from 'next/head';
import withLayout from '@/libs/components/layout/withLayout';
import MyPackages from '@/libs/components/mypage/MyPackages';
function MyPackagesPage() {
	return (
		<>
			<Head>
				<title>My Packages | WWT</title>
			</Head>
			<MyPackages />
		</>
	);
}
export default withLayout(MyPackagesPage);
