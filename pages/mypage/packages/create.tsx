import Head from 'next/head';
import withLayout from '@/libs/components/layout/withLayout';
import CreatePackage from '@/libs/components/mypage/CreatePackage';
function CreatePackagePage() {
	return (
		<>
			<Head>
				<title>Create New Package | WWT</title>
			</Head>
			<CreatePackage />
		</>
	);
}
export default withLayout(CreatePackagePage);
