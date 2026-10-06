import Head from 'next/head';
import AdminAgentRequests from '@/libs/components/admin/AdminAgentRequests';
import withAdminLayout from '@/libs/components/layout/withAdminLayout';

function AdminAgentRequestsPage() {
	return (
		<>
			<Head>
				<title>Agent Requests | WWT Admin</title>
			</Head>
			<AdminAgentRequests />
		</>
	);
}

export default withAdminLayout(AdminAgentRequestsPage);
