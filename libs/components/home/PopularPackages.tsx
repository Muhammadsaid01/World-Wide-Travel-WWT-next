import { GET_TRAVEL_PACKAGES } from '@/apollo/user/query';
import PackageCard from '@/libs/components/package/PackageCard';
import { useQuery } from '@apollo/client';
import { Alert, Button, Skeleton } from '@mui/material';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

export default function PopularPackages() {
	const { t } = useTranslation(['home', 'common']);
	const query = useQuery(GET_TRAVEL_PACKAGES, { variables: { input: { page: 1, limit: 4, sort: 'packageRating', direction: 'DESC' } } });
	const packages = query.data?.getTravelPackages.list ?? [];
	return (
		<section className="home-section home-packages" aria-labelledby="home-packages-title">
			<div className="home-section-heading"><div><span className="home-section-kicker">{t('packages.eyebrow')}</span><h2 id="home-packages-title">{t('packages.title')}</h2></div>
				<Link href="/package">{t('packages.all')}</Link></div>
			{query.loading ? <div className="home-grid-four">{Array.from({ length: 4 }, (_, index) => <Skeleton key={index} variant="rounded" height={410} />)}</div>
				: query.error ? <Alert severity="info" action={<Button onClick={() => void query.refetch()}>{t('actions.retry', { ns: 'common' })}</Button>}>{t('packages.error')}</Alert>
				: packages.length === 0 ? <div className="home-empty-state">{t('packages.empty')}</div>
				: <div className="home-grid-four">{packages.map((item) => <PackageCard key={item._id} item={item} />)}</div>}
		</section>
	);
}
