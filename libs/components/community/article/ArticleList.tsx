import type { ReactNode } from 'react';
import { Alert, Button, Pagination, Skeleton, Typography } from '@mui/material';
import type { QueryResult } from '@apollo/client';
import Link from 'next/link';
import type { CommunityArticleItem, CommunityArticlesInput } from '@/apollo/user/query';
import ArticleCard from './ArticleCard';

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
	const articles = query.data?.getBoardArticles.list ?? [];
	const total = query.data?.getBoardArticles.metaCounter?.[0]?.total ?? 0;
	const pageCount = Math.ceil(total / pageSize);
	return (
		<section className="community-section" id="community-stories" aria-labelledby="community-stories-title">
			<header className="community-section-heading">
				<div>
					<Typography variant="overline">Stories from our community</Typography>
					<Typography component="h2" id="community-stories-title">
						Latest Travel Stories
					</Typography>
				</div>
				<Button className="community-view-all" component={Link} href="/community/stories">
					View All Articles →
				</Button>
			</header>
			{toolbar}
			{query.loading ? (
				<div className="community-story-grid" aria-label="Loading travel stories">
					{Array.from({ length: 3 }, (_, index) => (
						<Skeleton key={index} variant="rounded" height={380} />
					))}
				</div>
			) : query.error ? (
				<Alert
					severity="error"
					action={<Button onClick={() => void query.refetch().catch(() => undefined)}>Retry</Button>}
				>
					Travel stories could not be loaded.
				</Alert>
			) : !articles.length ? (
				<div className="community-empty">
					<Typography component="h3">
						{filtered ? 'No travel stories match your search.' : 'No travel stories have been published yet.'}
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
