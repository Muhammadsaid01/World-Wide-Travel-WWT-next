import Head from 'next/head';
import withLayout from '@/libs/components/layout/withLayout';
import TravelStoriesPage from '@/libs/components/community/stories/TravelStoriesPage';

function TravelStoriesRoute() {
	return (
		<>
			<Head>
				<title>Travel Stories | WWT</title>
				<meta name="description" content="Discover inspiring travel stories shared by the WWT community." />
			</Head>
			<TravelStoriesPage />
		</>
	);
}

export default withLayout(TravelStoriesRoute);
