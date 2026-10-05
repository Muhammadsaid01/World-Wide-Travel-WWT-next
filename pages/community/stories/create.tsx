import Head from 'next/head';
import withLayout from '@/libs/components/layout/withLayout';
import TravelStoryCreate from '@/libs/components/community/stories/TravelStoryCreate';

function TravelStoryCreateRoute() {
	return (
		<>
			<Head>
				<title>Share a Story | WWT</title>
			</Head>
			<TravelStoryCreate />
		</>
	);
}

export default withLayout(TravelStoryCreateRoute);
