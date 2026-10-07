import AdminArticles from '@/libs/components/admin/AdminArticles';
import withAdminLayout from '@/libs/components/layout/withAdminLayout';
import Head from 'next/head';

function AdminCommunityPage() {
	return (
		<>
			<Head>
				<title>Community | WWT Admin</title>
			</Head>
			<AdminArticles />
		</>
	);
}

export default withAdminLayout(AdminCommunityPage);
