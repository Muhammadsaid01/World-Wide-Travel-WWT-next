import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import DeleteOutlineOutlined from '@mui/icons-material/DeleteOutlineOutlined';
import Favorite from '@mui/icons-material/Favorite';
import FavoriteBorder from '@mui/icons-material/FavoriteBorder';
import {
	Alert,
	Avatar,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	IconButton,
	Skeleton,
	TextField,
	Typography,
} from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { currentUserVar } from '@/apollo/store';
import { CREATE_COMMENT, DELETE_COMMENT, LIKE_TARGET_COMMENT } from '@/apollo/user/mutation';
import {
	GET_COMMENTS_BY_ARTICLE,
	type CommunityCommentItem,
	type CommunityCommentsInput,
} from '@/apollo/user/query';
import { restoreUserFromToken } from '@/libs/auth';
import { packageImageUrl } from '../../package/PackageImage';
import { formatScheduleDate } from '../../package/PackageSchedules';
import { memberName } from '../communityState';
import ReportForm from '../../cs/ReportForm';
import { ReportTargetType } from '@/libs/enums/system.enum';
import { useTranslation } from 'react-i18next';

const COMMENT_LIMIT = 5;

type CommentLikeState = {
	liked: boolean;
	count: number;
};

export interface CommentSectionProps {
	articleId: string;
	onTotalChange?: (total: number) => void;
}

function commentInput(articleId: string, page = 1): CommunityCommentsInput {
	return {
		page,
		limit: COMMENT_LIMIT,
		sort: 'createdAt',
		direction: 'DESC',
		search: { articleId },
	};
}

function commentTotal(result?: { metaCounter?: { total?: number | null }[] | null }) {
	return result?.metaCounter?.[0]?.total ?? 0;
}

export default function CommentSection({ articleId, onTotalChange }: CommentSectionProps) {
	const { t, i18n } = useTranslation(['community', 'common']);
	const router = useRouter();
	const user = useReactiveVar(currentUserVar);
	const [comments, setComments] = useState<CommunityCommentItem[]>([]);
	const [total, setTotal] = useState(0);
	const [page, setPage] = useState(1);
	const [draft, setDraft] = useState('');
	const [createError, setCreateError] = useState('');
	const [createBusy, setCreateBusy] = useState(false);
	const [loadMoreBusy, setLoadMoreBusy] = useState(false);
	const [loadMoreError, setLoadMoreError] = useState('');
	const [likeOverrides, setLikeOverrides] = useState<Record<string, CommentLikeState>>({});
	const [likeBusyIds, setLikeBusyIds] = useState<Set<string>>(new Set());
	const [likeErrors, setLikeErrors] = useState<Record<string, string>>({});
	const [deleting, setDeleting] = useState<CommunityCommentItem | null>(null);
	const [deleteBusy, setDeleteBusy] = useState(false);
	const [deleteError, setDeleteError] = useState('');
	const createLock = useRef(false);
	const likeLocks = useRef(new Set<string>());
	const deleteLock = useRef(false);

	const commentsQuery = useQuery(GET_COMMENTS_BY_ARTICLE, {
		variables: { input: commentInput(articleId) },
		fetchPolicy: 'network-only',
		notifyOnNetworkStatusChange: true,
	});
	const [createComment] = useMutation(CREATE_COMMENT);
	const [likeComment] = useMutation(LIKE_TARGET_COMMENT);
	const [deleteComment] = useMutation(DELETE_COMMENT);
	const result = commentsQuery.data?.getCommentsByArticle;

	useEffect(() => {
		if (!result) return;
		const nextTotal = commentTotal(result);
		setComments(result.list);
		setPage(1);
		setTotal(nextTotal);
		onTotalChange?.(nextTotal);
	}, [result, onTotalChange]);

	function updateTotal(nextTotal: number) {
		setTotal(nextTotal);
		onTotalChange?.(nextTotal);
	}

	function getLikeState(comment: CommunityCommentItem): CommentLikeState {
		return (
			likeOverrides[comment._id] ?? {
				liked: Boolean(comment.meLiked?.[0]?.meLiked),
				count: comment.commentLikeCount,
			}
		);
	}

	async function requireMember() {
		const current = currentUserVar() ?? restoreUserFromToken();
		if (current?._id) return true;
		await router.push('/account/login');
		return false;
	}

	async function refreshFirstPage() {
		const response = await commentsQuery.refetch({ input: commentInput(articleId) });
		const nextResult = response.data?.getCommentsByArticle;
		if (!nextResult) return;
		const nextTotal = commentTotal(nextResult);
		setComments(nextResult.list);
		setPage(1);
		updateTotal(nextTotal);
	}

	async function submitComment(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (createLock.current) return;
		if (!(await requireMember())) return;

		const content = draft.trim();
		if (!content || content.length > 2000) {
			setCreateError(t(content ? 'comments.tooLong' : 'comments.required'));
			return;
		}

		createLock.current = true;
		setCreateBusy(true);
		setCreateError('');
		try {
			await createComment({ variables: { input: { articleId, commentContent: content } } });
			setDraft('');
			try {
				await refreshFirstPage();
			} catch {
				setCreateError(t('comments.postedRefreshError'));
			}
		} catch (failure: unknown) {
			setCreateError(failure instanceof Error ? failure.message : t('comments.postError'));
		} finally {
			createLock.current = false;
			setCreateBusy(false);
		}
	}

	async function loadMore() {
		if (loadMoreBusy || comments.length >= total) return;
		const nextPage = page + 1;
		setLoadMoreBusy(true);
		setLoadMoreError('');
		try {
			const response = await commentsQuery.fetchMore({ variables: { input: commentInput(articleId, nextPage) } });
			const nextResult = response.data?.getCommentsByArticle;
			if (!nextResult) throw new Error(t('comments.noResponse'));
			setComments((previous) => {
				const existingIds = new Set(previous.map((comment) => comment._id));
				return [...previous, ...nextResult.list.filter((comment) => !existingIds.has(comment._id))];
			});
			setPage(nextPage);
			const nextTotal = commentTotal(nextResult);
			if (nextTotal !== total) updateTotal(nextTotal);
		} catch (failure: unknown) {
			setLoadMoreError(failure instanceof Error ? failure.message : t('comments.loadMoreError'));
		} finally {
			setLoadMoreBusy(false);
		}
	}

	async function toggleLike(comment: CommunityCommentItem) {
		if (!(await requireMember())) return;
		if (likeLocks.current.has(comment._id)) return;

		const current = getLikeState(comment);
		likeLocks.current.add(comment._id);
		setLikeBusyIds((previous) => new Set(previous).add(comment._id));
		setLikeErrors((previous) => {
			const next = { ...previous };
			delete next[comment._id];
			return next;
		});
		try {
			const response = await likeComment({ variables: { commentId: comment._id } });
			const nextCount = response.data?.likeTargetComment.commentLikeCount;
			if (typeof nextCount !== 'number') throw new Error(t('comments.likeCountError'));
			setLikeOverrides((previous) => ({
				...previous,
				[comment._id]: { liked: !current.liked, count: nextCount },
			}));
		} catch (failure: unknown) {
			setLikeErrors((previous) => ({
				...previous,
				[comment._id]: failure instanceof Error ? failure.message : t('comments.likeError'),
			}));
		} finally {
			likeLocks.current.delete(comment._id);
			setLikeBusyIds((previous) => {
				const next = new Set(previous);
				next.delete(comment._id);
				return next;
			});
		}
	}

	async function confirmDelete() {
		if (!deleting || deleteLock.current) return;
		deleteLock.current = true;
		setDeleteBusy(true);
		setDeleteError('');
		try {
			await deleteComment({ variables: { commentId: deleting._id } });
			setComments((previous) => previous.filter((comment) => comment._id !== deleting._id));
			updateTotal(Math.max(0, total - 1));
			setDeleting(null);
		} catch (failure: unknown) {
			setDeleteError(failure instanceof Error ? failure.message : t('comments.deleteError'));
		} finally {
			deleteLock.current = false;
			setDeleteBusy(false);
		}
	}

	const initialLoading = commentsQuery.loading && comments.length === 0;
	const queryError = commentsQuery.error && comments.length === 0;

	return (
		<section className="travel-story-comments" aria-labelledby="travel-story-comments-title">
			<header className="travel-story-comments-header">
				<div>
					<Typography component="h2" id="travel-story-comments-title">{t('comments.title')}</Typography>
					<Typography color="text.secondary">{t('comments.description')}</Typography>
				</div>
				<Typography className="travel-story-comments-count" aria-label={t('comments.count', { count: total })}>{total}</Typography>
			</header>

			{initialLoading ? (
				<div className="travel-story-comments-loading" aria-label={t('comments.loading')}>
					{Array.from({ length: 3 }, (_, index) => <Skeleton key={index} variant="rounded" height={112} />)}
				</div>
			) : queryError ? (
				<Alert
					severity="error"
					action={<Button onClick={() => void commentsQuery.refetch().catch(() => undefined)}>{t('actions.retry', { ns: 'common' })}</Button>}
				>
					{t('comments.error')}
				</Alert>
			) : comments.length === 0 ? (
				<Alert severity="info">{t('comments.empty')}</Alert>
			) : (
				<div className="travel-story-comments-list">
					{comments.map((comment) => {
						const author = comment.memberData ? memberName(comment.memberData) : t('comments.memberUnavailable');
						const state = getLikeState(comment);
						const isOwner = user?._id === comment.memberId;
						return (
							<article className="travel-story-comment" key={comment._id}>
								<div className="travel-story-comment-header">
									<div className="travel-story-comment-author">
										<Avatar src={packageImageUrl(comment.memberData?.memberImage)} alt={author}>
											{author.charAt(0).toUpperCase()}
										</Avatar>
										<div>
											<strong>{author}</strong>
											<small>
												{t(`article.roles.${comment.memberData?.memberType ?? 'UNKNOWN'}`)} ·{' '}
												<time dateTime={comment.createdAt}>{formatScheduleDate(comment.createdAt, i18n.language)}</time>
											</small>
										</div>
									</div>
									{isOwner ? (
										<Button
											size="small"
											color="inherit"
											startIcon={<DeleteOutlineOutlined />}
										aria-label={t('comments.deleteLabel')}
											onClick={() => {
												setDeleteError('');
												setDeleting(comment);
											}}
										>
										{t('comments.delete')}
										</Button>
									) : (
										<ReportForm
											targetId={comment._id}
											targetType={ReportTargetType.COMMENT}
										targetLabel={t('comments.reportLabel', { name: author })}
										/>
									)}
								</div>
								<Typography component="p" className="travel-story-comment-content">{comment.commentContent}</Typography>
								<div className="travel-story-comment-actions">
									<IconButton
										size="small"
										className={state.liked ? 'is-liked' : ''}
										disabled={likeBusyIds.has(comment._id)}
									aria-label={t('comments.likeLabel', {
										action: t(state.liked ? 'comments.unlike' : 'comments.like'),
										count: state.count,
									})}
										aria-pressed={state.liked}
										onClick={() => void toggleLike(comment)}
									>
										{state.liked ? <Favorite fontSize="small" /> : <FavoriteBorder fontSize="small" />}
									</IconButton>
								<span>{t('comments.likes', { count: state.count })}</span>
									{likeErrors[comment._id] && <Typography color="error" variant="caption">{likeErrors[comment._id]}</Typography>}
								</div>
							</article>
						);
					})}
				</div>
			)}

			{loadMoreError && <Alert severity="error" action={<Button onClick={() => void loadMore()}>{t('actions.retry', { ns: 'common' })}</Button>}>{loadMoreError}</Alert>}
			{!queryError && comments.length > 0 && comments.length < total && (
				<Button className="travel-story-comments-load-more" variant="outlined" onClick={() => void loadMore()} disabled={loadMoreBusy}>
					{loadMoreBusy ? t('states.loading', { ns: 'common' }) : t('comments.loadMore')}
				</Button>
			)}

			<form className="travel-story-comment-form" onSubmit={(event) => void submitComment(event)}>
				<TextField
					fullWidth
					multiline
					minRows={3}
					maxRows={8}
					label={t('comments.label')}
					placeholder={t('comments.placeholder')}
					value={draft}
					disabled={createBusy}
					onChange={(event) => {
						setDraft(event.target.value);
						if (createError) setCreateError('');
					}}
					helperText={`${draft.length}/2000`}
					error={draft.length > 2000}
				/>
				<div className="travel-story-comment-form-actions">
					{createError && <Typography color="error" variant="body2">{createError}</Typography>}
					<Button type="submit" variant="contained" disabled={createBusy || draft.trim().length === 0}>
						{createBusy ? t('comments.posting') : user ? t('comments.post') : t('comments.login')}
					</Button>
				</div>
				{!user && (
					<Typography variant="caption" color="text.secondary">
						{t('comments.loginPrompt')} <Link href="/account/login">{t('account.login', { ns: 'common' })}</Link>{' '}
						{t('comments.loginSuffix')}
					</Typography>
				)}
			</form>

			<Dialog open={Boolean(deleting)} onClose={() => { if (!deleteBusy) setDeleting(null); }} aria-labelledby="delete-comment-title">
				<DialogTitle id="delete-comment-title">{t('comments.deleteTitle')}</DialogTitle>
				<DialogContent>
					<DialogContentText>{t('comments.deletePrompt')}</DialogContentText>
					{deleteError && <Alert severity="error" sx={{ mt: 2 }}>{deleteError}</Alert>}
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setDeleting(null)} disabled={deleteBusy}>{t('actions.cancel', { ns: 'common' })}</Button>
					<Button color="error" variant="contained" onClick={() => void confirmDelete()} disabled={deleteBusy}>
						{deleteBusy ? t('comments.deleting') : t('comments.delete')}
					</Button>
				</DialogActions>
			</Dialog>
		</section>
	);
}
