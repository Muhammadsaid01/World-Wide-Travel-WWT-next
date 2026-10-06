import AdminMembers from '@/libs/components/admin/AdminMembers';
import withAdminLayout from '@/libs/components/layout/withAdminLayout';
import Head from 'next/head';

function AdminMembersPage() {
	return (
		<>
			<Head>
				<title>Members | WWT Admin</title>
			</Head>
			<AdminMembers />
		</>
	);
}

export default withAdminLayout(AdminMembersPage);
