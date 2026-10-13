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
import PackageImage, { packageImageUrl } from '../../package/PackageImage';
import { formatScheduleDate } from '../../package/PackageSchedules';
import CommentSection from '../article/CommentSection';
import { memberName } from '../communityState';
import ReportForm from '../../cs/ReportForm';
import { ReportTargetType } from '@/libs/enums/system.enum';
import { useTranslation } from 'react-i18next';

function isNotFoundError(message?: string) {
	return message?.toLowerCase().includes('no data found') ?? false;
}

function LoadingState() {
	const { t } = useTranslation('community');
	return (
		<article className="travel-story-article" aria-label={t('stories.loading')}>
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
	const { t } = useTranslation('community');
	return (
		<div className="travel-story-detail-empty">
			<Typography component="h1">{t('stories.notFound')}</Typography>
			<Button component={Link} href="/community/stories">
				{t('stories.back')}
			</Button>
		</div>
	);
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
	const { t } = useTranslation(['community', 'common']);
	return (
		<Alert severity="error" action={<Button onClick={onRetry}>{t('actions.retry', { ns: 'common' })}</Button>}>
			{t('stories.error')}
		</Alert>
	);
}

function ArticleContent({ article }: { article: CommunityArticleDetail }) {
	const { t } = useTranslation('community');
	const paragraphs = article.articleContent
		.split(/\r?\n+/)
		.map((paragraph) => paragraph.trim())
		.filter(Boolean);

	return paragraphs.length ? (
		paragraphs.map((paragraph, index) => <Typography key={`${article._id}-paragraph-${index}`}>{paragraph}</Typography>)
	) : (
		<Typography>{t('stories.emptyContent')}</Typography>
	);
}

export default function TravelStoryDetail({ id, ready }: { id: string; ready: boolean }) {
	const { t, i18n } = useTranslation(['community', 'common']);
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
	const author = article?.memberData ? memberName(article.memberData) : t('article.unknownAuthor');
	const authorRole = t(`article.roles.${article?.memberData?.memberType ?? 'UNKNOWN'}`);
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
			if (typeof nextCount !== 'number') throw new Error(t('stories.likeError'));
			setLikeOverride({ articleId: article._id, liked: !isLiked, count: nextCount });
		} catch (failure: unknown) {
			setLikeError(failure instanceof Error ? failure.message : t('stories.likeError'));
		} finally {
			likeLock.current = false;
			setLikeBusy(false);
		}
	}

	return (
		<div className="travel-story-detail">
			<Head>
				<title>{article?.articleTitle || t('stories.title')} | WWT</title>
			</Head>
			<div className="travel-stories-container">
				<Breadcrumbs separator="›" aria-label={t('stories.breadcrumb')}>
					<Link href="/"><HomeOutlined fontSize="small" /> {t('navigation.home', { ns: 'common' })}</Link>
					<Link href="/community">{t('navigation.community', { ns: 'common' })}</Link>
					<Link href="/community/stories">{t('stories.title')}</Link>
					<span aria-current="page">{article?.articleTitle || t('stories.title')}</span>
				</Breadcrumbs>
				<Button component={Link} href="/community/stories" startIcon={<ArrowBack />} className="travel-story-detail-back">
					{t('stories.back')}
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
								<Chip label={t(`categories.${article.articleCategory}`)} size="small" />
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
									<time dateTime={article.createdAt}>{formatScheduleDate(article.createdAt, i18n.language)}</time>
									{user?._id !== article.memberData?._id ? (
										<ReportForm
											targetId={article._id}
											targetType={ReportTargetType.ARTICLE}
											targetLabel={article.articleTitle}
											className="travel-story-report-action"
										/>
									) : null}
								</div>
								<div className="travel-story-detail-stats" aria-label={t('stories.engagement')}>
									<span className="travel-story-like-stat">
										<button
											type="button"
											className={`travel-story-like-control${isLiked ? ' is-liked' : ''}`}
											disabled={likeBusy}
											aria-label={t(isLiked ? 'stories.unlike' : 'stories.like')}
											aria-pressed={isLiked}
											onClick={() => void handleLike()}
										>
											{isLiked ? <Favorite /> : <FavoriteBorder />}
											{t('stories.likes', { count: likeCount })}
										</button>
									</span>
									<span><ChatBubbleOutline /> {t('stories.comments', { count: commentCount })}</span>
									<span><VisibilityOutlined /> {t('stories.views', { count: article.articleViewCount })}</span>
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
