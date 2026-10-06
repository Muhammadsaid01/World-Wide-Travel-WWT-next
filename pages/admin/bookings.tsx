import AdminBookings from '@/libs/components/admin/AdminBookings';
import withAdminLayout from '@/libs/components/layout/withAdminLayout';
import Head from 'next/head';

function AdminBookingsPage() {
	return (
		<>
			<Head>
				<title>Bookings | WWT Admin</title>
			</Head>
			<AdminBookings />
		</>
	);
}

export default withAdminLayout(AdminBookingsPage);
