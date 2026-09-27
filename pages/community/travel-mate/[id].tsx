import { useRouter } from 'next/router';
import withLayout from '@/libs/components/layout/withLayout';
import TravelMateDetail from '@/libs/components/community/TravelMateDetail';
function TravelMatePage() {
	const router = useRouter();
	const id = typeof router.query.id === 'string' ? router.query.id : '';
	return <TravelMateDetail key={id} id={id} ready={router.isReady} />;
}
export default withLayout(TravelMatePage);
