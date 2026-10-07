import AdminPayments from '@/libs/components/admin/AdminPayments';
import withAdminLayout from '@/libs/components/layout/withAdminLayout';
import Head from 'next/head';

function AdminPaymentsPage() {
	return (
		<>
			<Head>
				<title>Payments | WWT Admin</title>
			</Head>
			<AdminPayments />
		</>
	);
}

export default withAdminLayout(AdminPaymentsPage);
