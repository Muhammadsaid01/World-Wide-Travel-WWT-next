import Head from 'next/head';
import PackageList from '@/libs/components/package/PackageList';
import withLayout from '@/libs/components/layout/withLayout';

function PackagesPage() {
	return (
		<>
			<Head><title>Travel Packages | WWT</title></Head>
			<PackageList />
		</>
	);
}

export default withLayout(PackagesPage);
