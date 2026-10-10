import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { Alert, Avatar, Breadcrumbs, Button, Chip, Skeleton, Typography } from '@mui/material';
import ArrowBack from '@mui/icons-material/ArrowBack';
import Favorite from '@mui/icons-material/Favorite';
import FavoriteBorder from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutline from '@mui/icons-material/ChatBubbleOutlined';
import VisibilityOutlined from '@mui/icons-material/VisibilityOutlined';
import HomeOutlined from '@mui/icons-material/HomeOutlined';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCallback, useRef, useState } from 'react';
import { currentUserVar } from '@/apollo/store';
import { LIKE_TARGET_BOARD_ARTICLE } from '@/apollo/user/mutation';
import { GET_COMMUNITY_ARTICLE_DETAIL, type CommunityArticleDetail } from '@/apollo/user/query';
import { ArticleCategory } from '@/libs/enums/community.enum';
import PackageImage, { packageImageUrl } from '../../package/PackageImage';
import { formatScheduleDate } from '../../package/PackageSchedules';
import CommentSection from '../article/CommentSection';
import { memberName, memberRole } from '../communityState';
import ReportForm from '../../cs/ReportForm';
import { ReportTargetType } from '@/libs/enums/system.enum';

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
		<article className="travel-story-article" aria-label="Loading travel story">
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
	const router = useRouter();
	const user = useReactiveVar(currentUserVar);
	const valid = /^[a-f\d]{24}$/i.test(id);
	const { data, loading, error, refetch } = useQuery(GET_COMMUNITY_ARTICLE_DETAIL, {
		variables: { articleId: id },
		skip: !ready || !valid,
		fetchPolicy: 'network-only',
	});
	const [likeArticle] = useMutation(LIKE_TARGET_BOARD_ARTICLE);
	const [likeOverride, setLikeOverride] = useState<{ articleId: string; liked: boolean; count: number } | null>(null);
	const [likeBusy, setLikeBusy] = useState(false);
	const [likeError, setLikeError] = useState('');
	const likeLock = useRef(false);
	const [commentCountOverride, setCommentCountOverride] = useState<{ articleId: string; count: number } | null>(null);
	const article = data?.getBoardArticle;
	const notFound =
		ready &&
		(!valid ||
			error?.graphQLErrors.some((item) => isNotFoundError(item.message)) ||
			(!loading && !error && !article));
	const author = article?.memberData ? memberName(article.memberData) : 'Member unavailable';
	const authorRole = memberRole(article?.memberData);
	const currentLikeOverride = likeOverride?.articleId === article?._id ? likeOverride : null;
	const isLiked = currentLikeOverride?.liked ?? Boolean(article?.meLiked?.[0]?.meLiked);
	const likeCount = currentLikeOverride?.count ?? article?.articleLikeCount ?? 0;
	const currentCommentCountOverride = commentCountOverride?.articleId === article?._id ? commentCountOverride : null;
	const commentCount = currentCommentCountOverride?.count ?? article?.articleCommentCount ?? 0;
	const handleCommentTotalChange = useCallback((count: number) => {
		if (article?._id) setCommentCountOverride({ articleId: article._id, count });
	}, [article]);

	async function handleLike() {
		if (!currentUserVar()?._id) {
			await router.push('/account/login');
			return;
		}
		if (!article || likeLock.current) return;

		likeLock.current = true;
		setLikeBusy(true);
		setLikeError('');
		try {
			const response = await likeArticle({ variables: { articleId: article._id } });
			const nextCount = response.data?.likeTargetBoardArticle.articleLikeCount;
			if (typeof nextCount !== 'number') throw new Error('The like count was not returned.');
			setLikeOverride({ articleId: article._id, liked: !isLiked, count: nextCount });
		} catch (failure: unknown) {
			setLikeError(failure instanceof Error ? failure.message : 'Unable to update the like. Please try again.');
		} finally {
			likeLock.current = false;
			setLikeBusy(false);
		}
	}

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
					<>
						<article className="travel-story-article">
							<div className="travel-story-detail-cover">
								<PackageImage path={article.articleImages[0]} alt={article.articleTitle} />
							</div>
							<div className="travel-story-detail-body">
								<Chip label={categoryLabels[article.articleCategory]} size="small" />
								<Typography component="h1">{article.articleTitle}</Typography>
								<div className="travel-story-detail-meta">
									<div className="travel-story-detail-author">
										<Avatar src={packageImageUrl(article.memberData?.memberImage)} alt={author}>
											{author.charAt(0).toUpperCase()}
										</Avatar>
										<span>
											<strong>{author}</strong>
											<small>{authorRole}</small>
										</span>
									</div>
									<time dateTime={article.createdAt}>{formatScheduleDate(article.createdAt)}</time>
									{user?._id !== article.memberData?._id ? (
										<ReportForm
											targetId={article._id}
											targetType={ReportTargetType.ARTICLE}
											targetLabel={article.articleTitle}
											className="travel-story-report-action"
										/>
									) : null}
								</div>
								<div className="travel-story-detail-stats" aria-label="Story engagement">
									<span className="travel-story-like-stat">
										<button
											type="button"
											className={`travel-story-like-control${isLiked ? ' is-liked' : ''}`}
											disabled={likeBusy}
											aria-label={`${isLiked ? 'Unlike' : 'Like'} this travel story (${likeCount} likes)`}
											aria-pressed={isLiked}
											onClick={() => void handleLike()}
										>
											{isLiked ? <Favorite /> : <FavoriteBorder />}
											{likeCount} likes
										</button>
									</span>
									<span><ChatBubbleOutline /> {commentCount} comments</span>
									<span><VisibilityOutlined /> {article.articleViewCount} views</span>
								</div>
								{likeError && <Alert severity="error" className="travel-story-like-error">{likeError}</Alert>}
								<div className="travel-story-detail-content">
									<ArticleContent article={article} />
								</div>
							</div>
						</article>
						<CommentSection articleId={article._id} onTotalChange={handleCommentTotalChange} />
					</>
				) : null}
			</div>
		</div>
	);
}
