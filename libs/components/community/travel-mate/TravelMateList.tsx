import { Alert, Button, Skeleton, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import Link from 'next/link';
import type { QueryResult } from '@apollo/client';
import type { CommunityTravelMateItem, MyTravelMatesInput } from '@/apollo/user/query';
import TravelMateCard from './TravelMateCard';
import { useTranslation } from 'react-i18next';

type MateResult = { getTravelMatePosts: { list: CommunityTravelMateItem[]; metaCounter?: { total: number }[] | null } };

export default function TravelMateList({
	query,
	filtered,
	toolbar,
}: {
	query: Pick<QueryResult<MateResult, { input: MyTravelMatesInput }>, 'data' | 'loading' | 'error' | 'refetch'>;
	filtered: boolean;
	toolbar?: ReactNode;
}) {
	const { t } = useTranslation(['community', 'common']);
	const posts = query.data?.getTravelMatePosts.list ?? [];
	return (
		<section className="community-section community-mates" id="community-mates" aria-labelledby="community-mates-title">
			<header className="community-section-heading">
				<div>
					<Typography variant="overline">{t('home.matesEyebrow')}</Typography>
					<Typography component="h2" id="community-mates-title">
						{t('home.matesTitle')}
					</Typography>
				</div>
				<Button component={Link} href="/community/travel-mate" className="community-view-all">
					{t('actions.viewAll', { ns: 'common' })}
				</Button>
			</header>
			{toolbar}
			{query.loading ? (
				<div className="community-mate-grid" aria-label={t('mates.loading')}>
					{Array.from({ length: 3 }, (_, index) => (
						<Skeleton key={index} variant="rounded" height={330} />
					))}
				</div>
			) : query.error ? (
				<Alert
					severity="error"
					action={<Button onClick={() => void query.refetch().catch(() => undefined)}>{t('actions.retry', { ns: 'common' })}</Button>}
				>
					{t('mates.error')}
				</Alert>
			) : !posts.length ? (
				<div className="community-empty">
					<Typography component="h3">
						{t(filtered ? 'mates.empty' : 'mates.emptyOpen')}
					</Typography>
				</div>
			) : (
				<div className="community-mate-grid">
					{posts.map((post) => (
						<TravelMateCard key={post._id} post={post} />
					))}
				</div>
			)}
		</section>
	);
}
