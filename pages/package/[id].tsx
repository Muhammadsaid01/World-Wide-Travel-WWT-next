import { useRouter } from 'next/router';
import PackageDetail from '@/libs/components/package/PackageDetail';
import withLayout from '@/libs/components/layout/withLayout';

function PackageDetailPage() {
	const router = useRouter();
	const id = typeof router.query.id === 'string' ? router.query.id : '';
	return <PackageDetail key={id} id={id} ready={router.isReady} />;
}
export default withLayout(PackageDetailPage);
