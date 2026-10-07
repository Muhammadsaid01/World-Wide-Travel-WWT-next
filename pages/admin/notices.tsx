import AdminNotices from '@/libs/components/admin/AdminNotices';
import withAdminLayout from '@/libs/components/layout/withAdminLayout';
import Head from 'next/head';

function AdminNoticesPage() {
	return (
		<>
			<Head>
				<title>Notices | WWT Admin</title>
			</Head>
			<AdminNotices />
		</>
	);
}

export default withAdminLayout(AdminNoticesPage);
