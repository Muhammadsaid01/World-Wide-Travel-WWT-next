import AdminAgents from '@/libs/components/admin/AdminAgents';
import withAdminLayout from '@/libs/components/layout/withAdminLayout';
import Head from 'next/head';

function AdminAgentsPage() {
	return (
		<>
			<Head>
				<title>Agents | WWT Admin</title>
			</Head>
			<AdminAgents />
		</>
	);
}

export default withAdminLayout(AdminAgentsPage);
