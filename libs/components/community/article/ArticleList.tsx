import { Alert, Button, Skeleton, Typography } from '@mui/material';
import type { QueryResult } from '@apollo/client';
import type { CommunityArticleItem, CommunityArticlesInput } from '@/apollo/user/query';
import ArticleCard from './ArticleCard';

type ArticleResult = { getBoardArticles: { list: CommunityArticleItem[]; metaCounter?: { total: number }[] | null } };

export default function ArticleList({
	query,
	filtered,
	onViewAll,
}: {
	query: Pick<QueryResult<ArticleResult, { input: CommunityArticlesInput }>, 'data' | 'loading' | 'error' | 'refetch'>;
	filtered: boolean;
	onViewAll: () => void;
}) {
	const articles = query.data?.getBoardArticles.list ?? [];
	return (
		<section className="community-section" id="community-stories" aria-labelledby="community-stories-title">
			<header className="community-section-heading">
				<div>
					<Typography variant="overline">Stories from our community</Typography>
					<Typography component="h2" id="community-stories-title">
						Latest Travel Stories
					</Typography>
				</div>
				<Button className="community-view-all" onClick={onViewAll}>
					View All Articles →
				</Button>
			</header>
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
						<ArticleCard key={article._id} article={article} />
					))}
				</div>
			)}
		</section>
	);
}
