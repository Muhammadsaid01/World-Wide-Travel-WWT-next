import AdminCoupons from '@/libs/components/admin/AdminCoupons';
import withAdminLayout from '@/libs/components/layout/withAdminLayout';
import Head from 'next/head';

function AdminCouponsPage() {
	return (
		<>
			<Head>
				<title>Coupons | WWT Admin</title>
			</Head>
			<AdminCoupons />
		</>
	);
}

export default withAdminLayout(AdminCouponsPage);
