import type { ReactNode } from 'react';
import { Alert, Button, Pagination, Skeleton, Typography } from '@mui/material';
import type { QueryResult } from '@apollo/client';
import Link from 'next/link';
import type { CommunityArticleItem, CommunityArticlesInput } from '@/apollo/user/query';
import ArticleCard from './ArticleCard';
import { useTranslation } from 'react-i18next';

type ArticleResult = { getBoardArticles: { list: CommunityArticleItem[]; metaCounter?: { total: number }[] | null } };

export default function ArticleList({
	query,
	filtered,
	toolbar,
	page,
	pageSize,
	onPageChange,
}: {
	query: Pick<QueryResult<ArticleResult, { input: CommunityArticlesInput }>, 'data' | 'loading' | 'error' | 'refetch'>;
	filtered: boolean;
	toolbar?: ReactNode;
	page: number;
	pageSize: number;
	onPageChange: (page: number) => void;
}) {
	const { t } = useTranslation(['community', 'common']);
	const articles = query.data?.getBoardArticles.list ?? [];
	const total = query.data?.getBoardArticles.metaCounter?.[0]?.total ?? 0;
	const pageCount = Math.ceil(total / pageSize);
	return (
		<section className="community-section" id="community-stories" aria-labelledby="community-stories-title">
			<header className="community-section-heading">
				<div>
					<Typography variant="overline">{t('home.storiesEyebrow')}</Typography>
					<Typography component="h2" id="community-stories-title">
						{t('home.storiesTitle')}
					</Typography>
				</div>
				<Button className="community-view-all" component={Link} href="/community/stories">
					{t('home.allArticles')}
				</Button>
			</header>
			{toolbar}
			{query.loading ? (
				<div className="community-story-grid" aria-label={t('stories.loading')}>
					{Array.from({ length: 3 }, (_, index) => (
						<Skeleton key={index} variant="rounded" height={380} />
					))}
				</div>
			) : query.error ? (
				<Alert
					severity="error"
					action={<Button onClick={() => void query.refetch().catch(() => undefined)}>{t('actions.retry', { ns: 'common' })}</Button>}
				>
					{t('stories.error')}
				</Alert>
			) : !articles.length ? (
				<div className="community-empty">
					<Typography component="h3">
						{t(filtered ? 'stories.empty' : 'stories.emptyPublished')}
					</Typography>
				</div>
			) : (
				<div className="community-story-grid">
					{articles.map((article) => (
						<ArticleCard key={article._id} article={article} href={`/community/stories/${article._id}`} />
					))}
				</div>
			)}
			{!query.loading && !query.error && pageCount > 1 && (
				<Pagination
					className="community-pagination"
					count={pageCount}
					page={page}
					onChange={(_, nextPage) => onPageChange(nextPage)}
					shape="circular"
					showFirstButton={false}
					showLastButton={false}
					aria-label="Travel story pages"
				/>
			)}
		</section>
	);
}
