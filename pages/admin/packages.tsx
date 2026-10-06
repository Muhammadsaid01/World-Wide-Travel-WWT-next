import AdminPackages from '@/libs/components/admin/AdminPackages';
import withAdminLayout from '@/libs/components/layout/withAdminLayout';
import Head from 'next/head';

function AdminPackagesPage() {
	return (
		<>
			<Head>
				<title>Packages | WWT Admin</title>
			</Head>
			<AdminPackages />
		</>
	);
}

export default withAdminLayout(AdminPackagesPage);
