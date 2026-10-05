import { useQuery } from '@apollo/client';
import { Alert, Avatar, Breadcrumbs, Button, Chip, Skeleton, Typography } from '@mui/material';
import ArrowBack from '@mui/icons-material/ArrowBack';
import FavoriteBorder from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutline from '@mui/icons-material/ChatBubbleOutlined';
import VisibilityOutlined from '@mui/icons-material/VisibilityOutlined';
import HomeOutlined from '@mui/icons-material/HomeOutlined';
import Head from 'next/head';
import Link from 'next/link';
import { GET_COMMUNITY_ARTICLE_DETAIL, type CommunityArticleDetail } from '@/apollo/user/query';
import { ArticleCategory } from '@/libs/enums/community.enum';
import PackageImage, { packageImageUrl } from '../../package/PackageImage';
import { formatScheduleDate } from '../../package/PackageSchedules';
import { memberName, memberRole } from '../communityState';

const categoryLabels: Record<ArticleCategory, string> = {
	[ArticleCategory.FREE]: 'Free',
	[ArticleCategory.TRAVEL_TIP]: 'Travel Tips',
	[ArticleCategory.TRAVEL_REVIEW]: 'Travel Reviews',
	[ArticleCategory.QUESTION]: 'Questions',
	[ArticleCategory.FIND_COMPANION]: 'Find Companion',
	[ArticleCategory.NOTICE]: 'Notice',
};

function isNotFoundError(message?: string) {
	return message?.toLowerCase().includes('no data found') ?? false;
}

function LoadingState() {
	return (
		<article aria-label="Loading travel story">
			<Skeleton variant="rectangular" height={410} />
			<div className="travel-story-detail-body">
				<Skeleton width={90} />
				<Skeleton height={62} />
				<Skeleton height={58} />
				<Skeleton height={28} />
				<Skeleton height={120} />
			</div>
		</article>
	);
}

function NotFoundState() {
	return (
		<div className="travel-story-detail-empty">
			<Typography component="h1">Story not found</Typography>
			<Typography>This travel story is no longer available.</Typography>
			<Button component={Link} href="/community/stories">
				Back to Travel Stories
			</Button>
		</div>
	);
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
	return (
		<Alert severity="error" action={<Button onClick={onRetry}>Retry</Button>}>
			Travel story could not be loaded.
		</Alert>
	);
}

function ArticleContent({ article }: { article: CommunityArticleDetail }) {
	const paragraphs = article.articleContent
		.split(/\r?\n+/)
		.map((paragraph) => paragraph.trim())
		.filter(Boolean);

	return paragraphs.length ? (
		paragraphs.map((paragraph, index) => <Typography key={`${article._id}-paragraph-${index}`}>{paragraph}</Typography>)
	) : (
		<Typography>This story does not have any content yet.</Typography>
	);
}

export default function TravelStoryDetail({ id, ready }: { id: string; ready: boolean }) {
	const valid = /^[a-f\d]{24}$/i.test(id);
	const { data, loading, error, refetch } = useQuery(GET_COMMUNITY_ARTICLE_DETAIL, {
		variables: { articleId: id },
		skip: !ready || !valid,
		fetchPolicy: 'network-only',
	});
	const article = data?.getBoardArticle;
	const notFound =
		ready &&
		(!valid ||
			error?.graphQLErrors.some((item) => isNotFoundError(item.message)) ||
			(!loading && !error && !article));
	const author = article?.memberData ? memberName(article.memberData) : 'Member unavailable';
	const authorRole = memberRole(article?.memberData);

	return (
		<div className="travel-story-detail">
			<Head>
				<title>{article?.articleTitle || 'Travel Story'} | WWT</title>
			</Head>
			<div className="travel-stories-container">
				<Breadcrumbs separator="›" aria-label="Breadcrumb">
					<Link href="/"><HomeOutlined fontSize="small" /> Home</Link>
					<Link href="/community">Community</Link>
					<Link href="/community/stories">Travel Stories</Link>
					<span aria-current="page">{article?.articleTitle || 'Travel Story'}</span>
				</Breadcrumbs>
				<Button component={Link} href="/community/stories" startIcon={<ArrowBack />} className="travel-story-detail-back">
					Back to Travel Stories
				</Button>
				{!ready || loading ? (
					<LoadingState />
				) : notFound ? (
					<NotFoundState />
				) : error ? (
					<ErrorState onRetry={() => void refetch().catch(() => undefined)} />
				) : article ? (
					<article>
						<div className="travel-story-detail-cover">
							<PackageImage path={article.articleImages[0]} alt={article.articleTitle} />
						</div>
						<div className="travel-story-detail-body">
							<Chip label={categoryLabels[article.articleCategory]} size="small" />
							<Typography component="h1">{article.articleTitle}</Typography>
							<div className="travel-story-detail-meta">
								<div className="travel-story-card-author">
									<Avatar src={packageImageUrl(article.memberData?.memberImage)} alt={author}>
										{author.charAt(0).toUpperCase()}
									</Avatar>
									<span>
										<strong>{author}</strong>
										<small>{authorRole}</small>
									</span>
								</div>
								<time dateTime={article.createdAt}>{formatScheduleDate(article.createdAt)}</time>
							</div>
							<div className="travel-story-detail-stats" aria-label="Story engagement">
								<span><FavoriteBorder /> {article.articleLikeCount} likes</span>
								<span><ChatBubbleOutline /> {article.articleCommentCount} comments</span>
								<span><VisibilityOutlined /> {article.articleViewCount} views</span>
							</div>
							<div className="travel-story-detail-content">
								<ArticleContent article={article} />
							</div>
						</div>
					</article>
				) : null}
			</div>
		</div>
	);
}
