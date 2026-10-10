import Head from 'next/head';
import AdminReports from '@/libs/components/admin/AdminReports';
import withAdminLayout from '@/libs/components/layout/withAdminLayout';

function AdminReportsPage() {
	return (
		<>
			<Head>
				<title>Reports | WWT Admin</title>
			</Head>
			<AdminReports />
		</>
	);
}

export default withAdminLayout(AdminReportsPage);
