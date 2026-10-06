import Head from 'next/head';
import AdminHome from '@/libs/components/admin/AdminHome';
import withAdminLayout from '@/libs/components/layout/withAdminLayout';

function AdminDashboardPage() {
	return (
		<>
			<Head>
				<title>Dashboard | WWT Admin</title>
			</Head>
			<AdminHome />
		</>
	);
}

export default withAdminLayout(AdminDashboardPage);
