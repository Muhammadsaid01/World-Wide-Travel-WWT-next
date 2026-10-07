import { type ChangeEvent, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import {
	Alert,
	Avatar,
	Button,
	Chip,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	MenuItem,
	Pagination,
	Paper,
	Skeleton,
	TextField,
	Typography,
} from '@mui/material';
import { UPDATE_BOARD_ARTICLE_BY_ADMIN } from '@/apollo/admin/mutation';
import {
	GET_ADMIN_ARTICLES,
	type AdminArticleRow,
	type AdminArticlesInput,
} from '@/apollo/admin/query';
import { ArticleCategory, ArticleStatus } from '@/libs/enums/community.enum';
import { packageImageUrl } from '../package/PackageImage';
import { formatScheduleDate } from '../package/PackageSchedules';

const PAGE_SIZE = 10;
const manageableStatuses = [
	ArticleStatus.ACTIVE,
	ArticleStatus.DRAFT,
	ArticleStatus.HIDDEN,
	ArticleStatus.BLOCKED,
] as const;

const statusOptions: Array<{ value: ArticleStatus | 'ALL'; label: string }> = [
	{ value: 'ALL', label: 'All statuses' },
	...Object.values(ArticleStatus).map((value) => ({ value, label: enumLabel(value) })),
];

const categoryOptions: Array<{ value: ArticleCategory | 'ALL'; label: string }> = [
	{ value: 'ALL', label: 'All categories' },
	...Object.values(ArticleCategory).map((value) => ({ value, label: enumLabel(value) })),
];

function enumLabel(value: string) {
	return value
		.toLowerCase()
		.split('_')
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(' ');
}

function ArticleRow({
	article,
	busy,
	onModerate,
}: {
	article: AdminArticleRow;
	busy: boolean;
	onModerate: (article: AdminArticleRow) => void;
}) {
	const author = article.memberData;
	const authorName = author?.memberFullName?.trim() || author?.memberNick?.trim() || 'Member unavailable';
	const initial = authorName.charAt(0).toUpperCase();
	const manageable = article.articleStatus !== ArticleStatus.DELETED && !article.articleDeletedAt;

	return (
		<article className="admin-article-row">
			<div className="admin-article-summary" data-label="Article">
				<strong>{article.articleTitle}</strong>
				<Typography>{article.articleContent}</Typography>
				<small>{article._id}</small>
			</div>

			<div className="admin-article-author" data-label="Author">
				<Avatar src={packageImageUrl(author?.memberImage)} alt={authorName}>
					{initial}
				</Avatar>
				<div>
					<strong>{authorName}</strong>
					<span>{author ? enumLabel(author.memberType) : `Member ${article.memberId}`}</span>
				</div>
			</div>

			<div className="admin-article-cell" data-label="Category">
				<strong>{enumLabel(article.articleCategory)}</strong>
			</div>

			<div className="admin-article-cell" data-label="Status">
				<Chip
					label={enumLabel(article.articleStatus)}
					className={`admin-article-status is-${article.articleStatus.toLowerCase()}`}
					size="small"
				/>
			</div>

			<div className="admin-article-cell" data-label="Engagement">
				<strong>{article.articleViewCount.toLocaleString()} views</strong>
				<span>
					{article.articleLikeCount.toLocaleString()} likes · {article.articleCommentCount.toLocaleString()} comments
				</span>
			</div>

			<div className="admin-article-cell" data-label="Dates">
				<strong>Created {formatScheduleDate(article.createdAt)}</strong>
				<span>Updated {formatScheduleDate(article.updatedAt)}</span>
			</div>

			<div className="admin-article-action" data-label="Action">
				{manageable ? (
					<Button variant="outlined" size="small" disabled={busy} onClick={() => onModerate(article)}>
						Change status
					</Button>
				) : (
					<span>No actions</span>
				)}
			</div>
		</article>
	);
}

function ArticleSkeleton() {
	return (
		<div className="admin-members-skeleton" aria-label="Loading Community articles">
			{Array.from({ length: 5 }, (_, index) => (
				<Skeleton key={index} variant="rounded" height={96} />
			))}
		</div>
	);
}

export default function AdminArticles() {
	const actionLock = useRef(false);
	const resultsRef = useRef<HTMLDivElement>(null);
	const [page, setPage] = useState(1);
	const [status, setStatus] = useState<ArticleStatus | 'ALL'>('ALL');
	const [category, setCategory] = useState<ArticleCategory | 'ALL'>('ALL');
	const [sort, setSort] = useState<'newest' | 'oldest'>('newest');
	const [selectedArticle, setSelectedArticle] = useState<AdminArticleRow | null>(null);
	const [nextStatus, setNextStatus] = useState<ArticleStatus | ''>('');
	const [busyId, setBusyId] = useState('');
	const [actionError, setActionError] = useState('');
	const [notice, setNotice] = useState('');

	const variables = useMemo<{ input: AdminArticlesInput }>(
		() => ({
			input: {
				page,
				limit: PAGE_SIZE,
				sort: 'createdAt',
				direction: sort === 'newest' ? 'DESC' : 'ASC',
				search: {
					articleStatus: status === 'ALL' ? undefined : status,
					articleCategory: category === 'ALL' ? undefined : category,
				},
			},
		}),
		[category, page, sort, status],
	);

	const { data, loading, error, refetch } = useQuery(GET_ADMIN_ARTICLES, {
		variables,
		fetchPolicy: 'no-cache',
		notifyOnNetworkStatusChange: true,
	});
	const [updateArticle] = useMutation(UPDATE_BOARD_ARTICLE_BY_ADMIN);

	const articles = data?.getAllBoardArticlesByAdmin.list ?? [];
	const total = data?.getAllBoardArticlesByAdmin.metaCounter?.[0]?.total ?? 0;
	const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
	const filtered = status !== 'ALL' || category !== 'ALL';

	function changePage(_: ChangeEvent<unknown>, nextPage: number) {
		setPage(nextPage);
		resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}

	function clearFilters() {
		setStatus('ALL');
		setCategory('ALL');
		setSort('newest');
		setPage(1);
	}

	async function synchronize() {
		try {
			const refreshed = await refetch();
			const freshTotal = refreshed.data.getAllBoardArticlesByAdmin.metaCounter?.[0]?.total ?? 0;
			const lastPage = Math.max(1, Math.ceil(freshTotal / PAGE_SIZE));
			if (page > lastPage) setPage(lastPage);
		} catch {
			setActionError('The article was updated, but the list could not be refreshed. Retry to synchronize it.');
		}
	}

	async function confirmStatusChange() {
		if (!selectedArticle || !nextStatus || actionLock.current) return;
		if (!manageableStatuses.includes(nextStatus as (typeof manageableStatuses)[number])) {
			setActionError('That article status is not available for Admin moderation.');
			return;
		}
		if (nextStatus === selectedArticle.articleStatus) {
			setActionError('Choose a different status.');
			return;
		}

		actionLock.current = true;
		setBusyId(selectedArticle._id);
		setActionError('');
		setNotice('');
		try {
			const response = await updateArticle({
				variables: { input: { _id: selectedArticle._id, articleStatus: nextStatus } },
			});
			const updated = response.data?.updateBoardArticleByAdmin;
			if (!updated) throw new Error('The server did not confirm the article status change.');
			setNotice(`${updated.articleTitle} was changed to ${enumLabel(updated.articleStatus)}.`);
			setSelectedArticle(null);
			setNextStatus('');
			await synchronize();
		} catch (failure) {
			setActionError(failure instanceof Error ? failure.message : 'The article status could not be changed.');
		} finally {
			actionLock.current = false;
			setBusyId('');
		}
	}

	return (
		<div className="admin-community-page">
			<header className="admin-page-header">
				<div>
					<Typography className="admin-page-kicker">Community management</Typography>
					<Typography component="h1">Community</Typography>
					<Typography>Review Travel Stories and manage their supported publication status.</Typography>
				</div>
				<span className={`admin-total-count${error && !data ? ' is-unavailable' : ''}`}>
					{error && !data ? 'Total unavailable' : loading && !data ? 'Loading total' : `${total} articles`}
				</span>
			</header>

			<section className="admin-community-toolbar" aria-label="Community article filters">
				<TextField
					select
					size="small"
					label="Status"
					value={status}
					onChange={(event) => {
						setStatus(event.target.value as ArticleStatus | 'ALL');
						setPage(1);
					}}
				>
					{statusOptions.map((option) => (
						<MenuItem key={option.value} value={option.value}>
							{option.label}
						</MenuItem>
					))}
				</TextField>
				<TextField
					select
					size="small"
					label="Category"
					value={category}
					onChange={(event) => {
						setCategory(event.target.value as ArticleCategory | 'ALL');
						setPage(1);
					}}
				>
					{categoryOptions.map((option) => (
						<MenuItem key={option.value} value={option.value}>
							{option.label}
						</MenuItem>
					))}
				</TextField>
				<TextField
					select
					size="small"
					label="Sort"
					value={sort}
					onChange={(event) => {
						setSort(event.target.value as 'newest' | 'oldest');
						setPage(1);
					}}
				>
					<MenuItem value="newest">Newest first</MenuItem>
					<MenuItem value="oldest">Oldest first</MenuItem>
				</TextField>
			</section>

			<div className="admin-members-feedback">
				{notice ? <Alert severity="success">{notice}</Alert> : null}
				{actionError && !selectedArticle ? (
					<Alert severity="error" action={<Button onClick={() => void refetch()}>Refresh list</Button>}>
						{actionError}
					</Alert>
				) : null}
				{error && data ? (
					<Alert severity="warning" action={<Button onClick={() => void refetch()}>Retry</Button>}>
						The latest Community data could not be refreshed.
					</Alert>
				) : null}
			</div>

			<div ref={resultsRef} className="admin-members-results" aria-busy={loading}>
				{loading && !data ? (
					<ArticleSkeleton />
				) : error && !data ? (
					<Alert severity="error" action={<Button onClick={() => void refetch()}>Retry</Button>}>
						Community articles could not be loaded. Your filters have been preserved.
					</Alert>
				) : articles.length === 0 ? (
					<Paper className="admin-members-empty" elevation={0}>
						<Typography component="h2">{filtered ? 'No matching articles' : 'No Community articles yet'}</Typography>
						<Typography>
							{filtered
								? 'Try another status or category filter.'
								: 'Travel Stories will appear here when members publish them.'}
						</Typography>
						{filtered ? <Button onClick={clearFilters}>Clear filters</Button> : null}
					</Paper>
				) : (
					<Paper className="admin-members-table admin-community-table" elevation={0}>
						<div className="admin-community-table-header" aria-hidden="true">
							<span>Article</span>
							<span>Author</span>
							<span>Category</span>
							<span>Status</span>
							<span>Engagement</span>
							<span>Dates</span>
							<span>Action</span>
						</div>
						<div className="admin-members-list">
							{articles.map((article) => (
								<ArticleRow
									key={article._id}
									article={article}
									busy={Boolean(busyId)}
									onModerate={(selected) => {
										setActionError('');
										setSelectedArticle(selected);
										setNextStatus(selected.articleStatus);
									}}
								/>
							))}
						</div>
					</Paper>
				)}
			</div>

			{!loading && !error && total > PAGE_SIZE ? (
				<div className="admin-members-pagination">
					<Pagination count={pageCount} page={Math.min(page, pageCount)} onChange={changePage} color="primary" />
				</div>
			) : null}

			<Dialog
				className="admin-request-dialog admin-community-dialog"
				open={Boolean(selectedArticle)}
				onClose={() => {
					if (!busyId) setSelectedArticle(null);
				}}
				fullWidth
				maxWidth="sm"
			>
				<DialogTitle>Change article status?</DialogTitle>
				<DialogContent>
					<Typography>
						Choose the moderation status for <strong>{selectedArticle?.articleTitle}</strong>. The article owner will see
						the backend-confirmed status.
					</Typography>
					<TextField
						select
						fullWidth
						label="Article status"
						value={nextStatus}
						onChange={(event) => {
							setNextStatus(event.target.value as ArticleStatus);
							setActionError('');
						}}
						disabled={Boolean(busyId)}
					>
						{manageableStatuses.map((option) => (
							<MenuItem key={option} value={option}>
								{enumLabel(option)}
							</MenuItem>
						))}
					</TextField>
					{actionError ? <Alert severity="error">{actionError}</Alert> : null}
				</DialogContent>
				<DialogActions>
					<Button disabled={Boolean(busyId)} onClick={() => setSelectedArticle(null)}>
						Cancel
					</Button>
					<Button
						variant="contained"
						disabled={Boolean(busyId) || !nextStatus || nextStatus === selectedArticle?.articleStatus}
						onClick={() => void confirmStatusChange()}
					>
						{busyId ? 'Updating...' : 'Confirm Status'}
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
}
