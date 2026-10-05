import { useRouter } from 'next/router';
import withLayout from '@/libs/components/layout/withLayout';
import TravelStoryDetail from '@/libs/components/community/stories/TravelStoryDetail';

function TravelStoryDetailRoute() {
	const router = useRouter();
	const id = typeof router.query.id === 'string' ? router.query.id : '';
	return <TravelStoryDetail key={id} id={id} ready={router.isReady} />;
}

export default withLayout(TravelStoryDetailRoute);
