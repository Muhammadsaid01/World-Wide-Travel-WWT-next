import { type ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import AddOutlined from '@mui/icons-material/AddOutlined';
import DeleteOutlineOutlined from '@mui/icons-material/DeleteOutlineOutlined';
import PushPinOutlined from '@mui/icons-material/PushPinOutlined';
import {
	Alert,
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
import { CREATE_NOTICE, DELETE_NOTICE } from '@/apollo/admin/mutation';
import { GET_ADMIN_NOTICES, type AdminNoticeRow, type AdminNoticesInput } from '@/apollo/admin/query';
import { formatScheduleDate } from '../package/PackageSchedules';
import AdminNoticeForm, { type AdminNoticeFormValues } from './AdminNoticeForm';

const PAGE_SIZE = 10;
const SEARCH_DELAY = 350;
const EMPTY_FORM: AdminNoticeFormValues = { noticeTitle: '', noticeContent: '', noticePinned: false };

function NoticeSkeleton() {
	return (
		<div className="admin-members-skeleton" aria-label="Loading notices">
			{Array.from({ length: 5 }, (_, index) => (
				<Skeleton key={index} variant="rounded" height={96} />
			))}
		</div>
	);
}

function NoticeRow({ notice, busy, onDelete }: { notice: AdminNoticeRow; busy: boolean; onDelete: () => void }) {
	return (
		<article className="admin-notice-row">
			<div className="admin-notice-summary" data-label="Notice">
				<div>
					<strong>{notice.noticeTitle}</strong>
					{notice.noticePinned ? <Chip size="small" icon={<PushPinOutlined />} label="Pinned" /> : null}
				</div>
				<Typography>{notice.noticeContent}</Typography>
				<small>{notice._id}</small>
			</div>
			<div className="admin-notice-cell" data-label="Views">
				<strong>{notice.noticeViewCount.toLocaleString()}</strong>
				<span>views</span>
			</div>
			<div className="admin-notice-cell" data-label="Created">
				<strong>{formatScheduleDate(notice.createdAt)}</strong>
				<span>Updated {formatScheduleDate(notice.updatedAt)}</span>
			</div>
			<div className="admin-notice-cell" data-label="Expires">
				<strong>{formatScheduleDate(notice.expireAt)}</strong>
				<span>Backend managed</span>
			</div>
			<div className="admin-notice-action" data-label="Action">
				<Button color="error" size="small" startIcon={<DeleteOutlineOutlined />} disabled={busy} onClick={onDelete}>
					Delete
				</Button>
			</div>
		</article>
	);
}

function validateForm(values: AdminNoticeFormValues) {
	const errors: Partial<Record<'noticeTitle' | 'noticeContent', string>> = {};
	const titleLength = values.noticeTitle.trim().length;
	const contentLength = values.noticeContent.trim().length;
	if (titleLength < 3 || titleLength > 300) errors.noticeTitle = 'Title must be between 3 and 300 characters.';
	if (contentLength < 10 || contentLength > 10000) {
		errors.noticeContent = 'Content must be between 10 and 10,000 characters.';
	}
	return errors;
}

export default function AdminNotices() {
	const mutationLock = useRef(false);
	const resultsRef = useRef<HTMLDivElement>(null);
	const [page, setPage] = useState(1);
	const [searchText, setSearchText] = useState('');
	const [debouncedSearch, setDebouncedSearch] = useState('');
	const [pinned, setPinned] = useState<'ALL' | 'PINNED' | 'REGULAR'>('ALL');
	const [sort, setSort] = useState<'newest' | 'oldest'>('newest');
	const [createOpen, setCreateOpen] = useState(false);
	const [form, setForm] = useState<AdminNoticeFormValues>(EMPTY_FORM);
	const [formErrors, setFormErrors] = useState<Partial<Record<'noticeTitle' | 'noticeContent', string>>>({});
	const [selectedNotice, setSelectedNotice] = useState<AdminNoticeRow | null>(null);
	const [busyId, setBusyId] = useState('');
	const [actionError, setActionError] = useState('');
	const [feedback, setFeedback] = useState('');

	useEffect(() => {
		const timer = window.setTimeout(() => {
			setDebouncedSearch(searchText.trim());
			setPage(1);
		}, SEARCH_DELAY);
		return () => window.clearTimeout(timer);
	}, [searchText]);

	const variables = useMemo<{ input: AdminNoticesInput }>(
		() => ({
			input: {
				page,
				limit: PAGE_SIZE,
				sort: 'createdAt',
				direction: sort === 'newest' ? 'DESC' : 'ASC',
				search: {
					text: debouncedSearch || undefined,
					noticePinned: pinned === 'ALL' ? undefined : pinned === 'PINNED',
				},
			},
		}),
		[debouncedSearch, page, pinned, sort],
	);

	const { data, loading, error, refetch } = useQuery(GET_ADMIN_NOTICES, {
		variables,
		fetchPolicy: 'no-cache',
		notifyOnNetworkStatusChange: true,
	});
	const [createNotice] = useMutation(CREATE_NOTICE);
	const [deleteNotice] = useMutation(DELETE_NOTICE);

	const notices = data?.getNotices.list ?? [];
	const total = data?.getNotices.metaCounter?.[0]?.total ?? 0;
	const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
	const filtered = Boolean(debouncedSearch) || pinned !== 'ALL';

	function changePage(_: ChangeEvent<unknown>, nextPage: number) {
		setPage(nextPage);
		resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}

	function clearFilters() {
		setSearchText('');
		setDebouncedSearch('');
		setPinned('ALL');
		setSort('newest');
		setPage(1);
	}

	async function synchronize(targetPage = page) {
		try {
			const refreshed = await refetch({ input: { ...variables.input, page: targetPage } });
			const freshTotal = refreshed.data.getNotices.metaCounter?.[0]?.total ?? 0;
			const lastPage = Math.max(1, Math.ceil(freshTotal / PAGE_SIZE));
			if (page > lastPage) setPage(lastPage);
		} catch {
			setActionError('The action succeeded, but the notice list could not be refreshed. Retry to synchronize it.');
		}
	}

	async function submitNotice() {
		if (mutationLock.current) return;
		const errors = validateForm(form);
		setFormErrors(errors);
		if (Object.keys(errors).length) return;

		mutationLock.current = true;
		setBusyId('create');
		setActionError('');
		setFeedback('');
		try {
			const response = await createNotice({
				variables: {
					input: {
						noticeTitle: form.noticeTitle.trim(),
						noticeContent: form.noticeContent.trim(),
						noticePinned: form.noticePinned,
					},
				},
			});
			const created = response.data?.createNotice;
			if (!created) throw new Error('The server did not confirm notice creation.');
			setFeedback(`${created.noticeTitle} was created.`);
			setCreateOpen(false);
			setForm(EMPTY_FORM);
			setFormErrors({});
			setPage(1);
			await synchronize(1);
		} catch (failure) {
			setActionError(failure instanceof Error ? failure.message : 'The notice could not be created.');
		} finally {
			mutationLock.current = false;
			setBusyId('');
		}
	}

	async function confirmDelete() {
		if (!selectedNotice || mutationLock.current) return;
		mutationLock.current = true;
		setBusyId(selectedNotice._id);
		setActionError('');
		setFeedback('');
		try {
			const response = await deleteNotice({ variables: { noticeId: selectedNotice._id } });
			const deleted = response.data?.deleteNotice;
			if (!deleted) throw new Error('The server did not confirm notice deletion.');
			setFeedback(`${deleted.noticeTitle} was permanently deleted.`);
			setSelectedNotice(null);
			await synchronize();
		} catch (failure) {
			setActionError(failure instanceof Error ? failure.message : 'The notice could not be deleted.');
		} finally {
			mutationLock.current = false;
			setBusyId('');
		}
	}

	return (
		<div className="admin-notices-page">
			<header className="admin-page-header">
				<div>
					<Typography className="admin-page-kicker">Communication management</Typography>
					<Typography component="h1">Notices</Typography>
					<Typography>Create and manage public announcements shown in the Navbar notice panel.</Typography>
				</div>
				<div className="admin-notices-header-actions">
					<span className={`admin-total-count${error && !data ? ' is-unavailable' : ''}`}>
						{error && !data ? 'Total unavailable' : loading && !data ? 'Loading total' : `${total} notices`}
					</span>
					<Button variant="contained" startIcon={<AddOutlined />} onClick={() => setCreateOpen(true)}>
						Create Notice
					</Button>
				</div>
			</header>

			<section className="admin-notices-toolbar" aria-label="Notice filters">
				<TextField
					size="small"
					label="Search notices"
					value={searchText}
					onChange={(event) => setSearchText(event.target.value)}
				/>
				<TextField
					select
					size="small"
					label="Pinned"
					value={pinned}
					onChange={(event) => {
						setPinned(event.target.value as typeof pinned);
						setPage(1);
					}}
				>
					<MenuItem value="ALL">All notices</MenuItem>
					<MenuItem value="PINNED">Pinned only</MenuItem>
					<MenuItem value="REGULAR">Regular only</MenuItem>
				</TextField>
				<TextField
					select
					size="small"
					label="Sort"
					value={sort}
					onChange={(event) => {
						setSort(event.target.value as typeof sort);
						setPage(1);
					}}
				>
					<MenuItem value="newest">Newest first</MenuItem>
					<MenuItem value="oldest">Oldest first</MenuItem>
				</TextField>
			</section>

			<div className="admin-members-feedback">
				{feedback ? <Alert severity="success">{feedback}</Alert> : null}
				{actionError && !createOpen && !selectedNotice ? (
					<Alert severity="error" action={<Button onClick={() => void refetch()}>Refresh list</Button>}>
						{actionError}
					</Alert>
				) : null}
				{error && data ? (
					<Alert severity="warning" action={<Button onClick={() => void refetch()}>Retry</Button>}>
						The latest notice data could not be refreshed.
					</Alert>
				) : null}
			</div>

			<div ref={resultsRef} className="admin-members-results" aria-busy={loading}>
				{loading && !data ? (
					<NoticeSkeleton />
				) : error && !data ? (
					<Alert severity="error" action={<Button onClick={() => void refetch()}>Retry</Button>}>
						Notices could not be loaded. Your filters have been preserved.
					</Alert>
				) : notices.length === 0 ? (
					<Paper className="admin-members-empty" elevation={0}>
						<Typography component="h2">{filtered ? 'No matching notices' : 'No notices yet'}</Typography>
						<Typography>
							{filtered ? 'Try another search or pinned filter.' : 'Create a notice to publish an announcement.'}
						</Typography>
						{filtered ? <Button onClick={clearFilters}>Clear filters</Button> : null}
					</Paper>
				) : (
					<Paper className="admin-members-table admin-notices-table" elevation={0}>
						<div className="admin-notices-table-header" aria-hidden="true">
							<span>Notice</span>
							<span>Views</span>
							<span>Created</span>
							<span>Expires</span>
							<span>Action</span>
						</div>
						<div className="admin-members-list">
							{notices.map((notice) => (
								<NoticeRow
									key={notice._id}
									notice={notice}
									busy={Boolean(busyId)}
									onDelete={() => {
										setActionError('');
										setSelectedNotice(notice);
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
				open={createOpen}
				onClose={() => {
					if (!busyId) setCreateOpen(false);
				}}
				fullWidth
				maxWidth="sm"
				className="admin-notice-dialog"
			>
				<DialogTitle>Create notice</DialogTitle>
				<DialogContent>
					<Typography className="admin-notice-dialog-copy">
						The notice will be visible in the public Navbar panel and expires after seven days.
					</Typography>
					<AdminNoticeForm
						values={form}
						errors={formErrors}
						disabled={busyId === 'create'}
						onChange={(next) => {
							setForm(next);
							setFormErrors({});
							setActionError('');
						}}
					/>
					{actionError ? <Alert severity="error">{actionError}</Alert> : null}
				</DialogContent>
				<DialogActions>
					<Button disabled={Boolean(busyId)} onClick={() => setCreateOpen(false)}>
						Cancel
					</Button>
					<Button variant="contained" disabled={Boolean(busyId)} onClick={() => void submitNotice()}>
						{busyId === 'create' ? 'Creating...' : 'Create Notice'}
					</Button>
				</DialogActions>
			</Dialog>

			<Dialog
				open={Boolean(selectedNotice)}
				onClose={() => {
					if (!busyId) setSelectedNotice(null);
				}}
				fullWidth
				maxWidth="xs"
				className="admin-notice-dialog"
			>
				<DialogTitle>Permanently delete notice?</DialogTitle>
				<DialogContent>
					<Typography>
						<strong>{selectedNotice?.noticeTitle}</strong> will immediately disappear from the Notice panel. This
						hard-delete action cannot be undone.
					</Typography>
					{actionError ? <Alert severity="error">{actionError}</Alert> : null}
				</DialogContent>
				<DialogActions>
					<Button disabled={Boolean(busyId)} onClick={() => setSelectedNotice(null)}>
						Cancel
					</Button>
					<Button color="error" variant="contained" disabled={Boolean(busyId)} onClick={() => void confirmDelete()}>
						{busyId ? 'Deleting...' : 'Delete Permanently'}
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
}
