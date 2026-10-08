import AdminFaqs from '@/libs/components/admin/AdminFaqs';
import withAdminLayout from '@/libs/components/layout/withAdminLayout';
import Head from 'next/head';

function AdminFaqsPage() {
	return (
		<>
			<Head>
				<title>FAQs | WWT Admin</title>
			</Head>
			<AdminFaqs />
		</>
	);
}

export default withAdminLayout(AdminFaqsPage);
