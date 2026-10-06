import Head from 'next/head';
import TravelMateBrowsePage from '@/libs/components/community/travel-mate/TravelMateBrowsePage';
import withLayout from '@/libs/components/layout/withLayout';

function TravelMateListPage() {
	return (
		<>
			<Head>
				<title>Find a Travel Mate | WWT</title>
				<meta name="description" content="Find open community trips and meet a travel mate for your next journey." />
			</Head>
			<TravelMateBrowsePage />
		</>
	);
}

export default withLayout(TravelMateListPage);
