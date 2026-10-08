import FaqList from '@/libs/components/cs/FaqList';
import withLayout from '@/libs/components/layout/withLayout';
import Head from 'next/head';

function FaqPage() {
	return (
		<>
			<Head>
				<title>Help Center | WWT</title>
				<meta
					name="description"
					content="Find answers about WWT travel packages, bookings, payments, accounts and more."
				/>
			</Head>
			<FaqList />
		</>
	);
}

export default withLayout(FaqPage);
