import { GET_COMMUNITY_ARTICLES } from '@/apollo/user/query';
import ArticleCard from '@/libs/components/community/article/ArticleCard';
import { useQuery } from '@apollo/client';
import { Alert, Button, Skeleton } from '@mui/material';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

export default function CommunityPreview() {
	const { t } = useTranslation(['home', 'common']);
	const query = useQuery(GET_COMMUNITY_ARTICLES, { variables: { input: { page: 1, limit: 3, sort: 'createdAt', direction: 'DESC' } } });
	const stories = query.data?.getBoardArticles.list ?? [];
	return (
		<section className="home-section home-community" aria-labelledby="home-community-title">
			<div className="home-section-heading"><div><span className="home-section-kicker">{t('stories.eyebrow')}</span><h2 id="home-community-title">{t('stories.title')}</h2>
				<p>{t('stories.description')}</p></div><Link href="/community/stories">{t('stories.all')}</Link></div>
			{query.loading ? <div className="home-grid-three">{Array.from({ length: 3 }, (_, index) => <Skeleton key={index} variant="rounded" height={430} />)}</div>
				: query.error ? <Alert severity="info" action={<Button onClick={() => void query.refetch()}>{t('actions.retry', { ns: 'common' })}</Button>}>{t('stories.error')}</Alert>
				: stories.length === 0 ? <div className="home-empty-state">{t('stories.empty')}</div>
				: <div className="home-grid-three">{stories.map((article) => <ArticleCard key={article._id} article={article} href={`/community/stories/${article._id}`} />)}</div>}
		</section>
	);
}
