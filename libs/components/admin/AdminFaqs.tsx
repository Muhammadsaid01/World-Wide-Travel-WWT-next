import { CREATE_FAQ, DELETE_FAQ, UPDATE_FAQ } from '@/apollo/admin/mutation';
import { GET_ADMIN_FAQS, type AdminFaqRow, type AdminFaqsInput } from '@/apollo/admin/query';
import {
	EMPTY_FAQ_FORM,
	FAQ_CATEGORY_OPTIONS,
	faqCategoryLabel,
	faqFormInput,
	type FaqFormErrors,
	type FaqFormValues,
	validateFaqForm,
} from '@/libs/components/cs/faqState';
import { formatScheduleDate } from '@/libs/components/package/PackageSchedules';
import { FaqCategory, FaqStatus } from '@/libs/enums/system.enum';
import { useMutation, useQuery } from '@apollo/client';
import AddOutlined from '@mui/icons-material/AddOutlined';
import DeleteOutlineOutlined from '@mui/icons-material/DeleteOutlineOutlined';
import EditOutlined from '@mui/icons-material/EditOutlined';
import PublishOutlined from '@mui/icons-material/PublishOutlined';
import UnpublishedOutlined from '@mui/icons-material/UnpublishedOutlined';
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
	Skeleton,
	TextField,
	Typography,
} from '@mui/material';
import { type ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import AdminFaqForm from './AdminFaqForm';

const PAGE_SIZE = 10;
const SEARCH_DELAY = 350;

function FaqSkeleton() {
	return (
		<div className="admin-faq-skeleton" aria-label="Loading FAQs">
			{Array.from({ length: 6 }, (_, index) => (
				<Skeleton key={index} variant="rounded" height={86} />
			))}
		</div>
	);
}

function statusLabel(status: FaqStatus) {
	return status === FaqStatus.PUBLISHED ? 'Published' : 'Draft';
}

function rowToForm(faq: AdminFaqRow): FaqFormValues {
	return {
		faqCategory: faq.faqCategory,
		faqStatus: faq.faqStatus,
		faqQuestion: faq.faqQuestion,
		faqAnswer: faq.faqAnswer,
		faqOrder: String(faq.faqOrder),
	};
}

export default function AdminFaqs() {
	const mutationLock = useRef(false);
	const resultsRef = useRef<HTMLDivElement>(null);
	const [page, setPage] = useState(1);
	const [searchText, setSearchText] = useState('');
	const [debouncedSearch, setDebouncedSearch] = useState('');
	const [category, setCategory] = useState<'ALL' | FaqCategory>('ALL');
	const [status, setStatus] = useState<'ALL' | FaqStatus>('ALL');
	const [sort, setSort] = useState<'order' | 'newest' | 'oldest'>('order');
	const [formOpen, setFormOpen] = useState(false);
	const [editingFaq, setEditingFaq] = useState<AdminFaqRow | null>(null);
	const [form, setForm] = useState<FaqFormValues>(EMPTY_FAQ_FORM);
	const [formErrors, setFormErrors] = useState<FaqFormErrors>({});
	const [deleteTarget, setDeleteTarget] = useState<AdminFaqRow | null>(null);
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

	const variables = useMemo<{ input: AdminFaqsInput }>(
		() => ({
			input: {
				page,
				limit: PAGE_SIZE,
				sort: sort === 'order' ? 'faqOrder' : 'createdAt',
				direction: sort === 'oldest' || sort === 'order' ? 'ASC' : 'DESC',
				search: {
					text: debouncedSearch || undefined,
					faqCategory: category === 'ALL' ? undefined : category,
					faqStatus: status === 'ALL' ? undefined : status,
				},
			},
		}),
		[category, debouncedSearch, page, sort, status],
	);

	const { data, loading, error, refetch } = useQuery(GET_ADMIN_FAQS, {
		variables,
		fetchPolicy: 'no-cache',
		notifyOnNetworkStatusChange: true,
	});
	const [createFaq] = useMutation(CREATE_FAQ);
	const [updateFaq] = useMutation(UPDATE_FAQ);
	const [deleteFaq] = useMutation(DELETE_FAQ);

	const faqs = data?.getAllFaqsByAdmin.list ?? [];
	const total = data?.getAllFaqsByAdmin.metaCounter?.[0]?.total ?? 0;
	const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
	const filtered = Boolean(debouncedSearch) || category !== 'ALL' || status !== 'ALL';

	function changePage(_: ChangeEvent<unknown>, nextPage: number) {
		setPage(nextPage);
		resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}

	function clearFilters() {
		setSearchText('');
		setDebouncedSearch('');
		setCategory('ALL');
		setStatus('ALL');
		setSort('order');
		setPage(1);
	}

	function openCreate() {
		setEditingFaq(null);
		setForm(EMPTY_FAQ_FORM);
		setFormErrors({});
		setActionError('');
		setFormOpen(true);
	}

	function openEdit(faq: AdminFaqRow) {
		setEditingFaq(faq);
		setForm(rowToForm(faq));
		setFormErrors({});
		setActionError('');
		setFormOpen(true);
	}

	function openDelete(faq: AdminFaqRow) {
		setActionError('');
		setDeleteTarget(faq);
	}

	async function synchronize(targetPage = page) {
		try {
			const refreshed = await refetch({ input: { ...variables.input, page: targetPage } });
			const freshTotal = refreshed.data.getAllFaqsByAdmin.metaCounter?.[0]?.total ?? 0;
			const lastPage = Math.max(1, Math.ceil(freshTotal / PAGE_SIZE));
			if (page > lastPage) setPage(lastPage);
		} catch {
			setActionError('The action succeeded, but the FAQ list could not be refreshed. Retry to synchronize it.');
		}
	}

	async function submitFaq() {
		if (mutationLock.current) return;
		const errors = validateFaqForm(form);
		setFormErrors(errors);
		if (Object.keys(errors).length) return;

		mutationLock.current = true;
		setBusyId(editingFaq?._id ?? 'create');
		setActionError('');
		setFeedback('');
		try {
			const input = faqFormInput(form);
			const saved = editingFaq
				? (await updateFaq({ variables: { input: { _id: editingFaq._id, ...input } } })).data?.updateFaq
				: (await createFaq({ variables: { input } })).data?.createFaq;
			if (!saved) throw new Error('The server did not confirm the FAQ change.');
			setFeedback(`“${saved.faqQuestion}” was ${editingFaq ? 'updated' : 'created'}.`);
			setFormOpen(false);
			setEditingFaq(null);
			setForm(EMPTY_FAQ_FORM);
			setFormErrors({});
			if (!editingFaq) setPage(1);
			await synchronize(editingFaq ? page : 1);
		} catch (failure) {
			setActionError(failure instanceof Error ? failure.message : 'The FAQ could not be saved.');
		} finally {
			mutationLock.current = false;
			setBusyId('');
		}
	}

	async function toggleStatus(faq: AdminFaqRow) {
		if (mutationLock.current) return;
		mutationLock.current = true;
		setBusyId(faq._id);
		setActionError('');
		setFeedback('');
		const nextStatus = faq.faqStatus === FaqStatus.PUBLISHED ? FaqStatus.DRAFT : FaqStatus.PUBLISHED;
		try {
			const response = await updateFaq({ variables: { input: { _id: faq._id, faqStatus: nextStatus } } });
			const updated = response.data?.updateFaq;
			if (!updated) throw new Error('The server did not confirm the status change.');
			setFeedback(`“${updated.faqQuestion}” is now ${statusLabel(updated.faqStatus).toLowerCase()}.`);
			await synchronize();
		} catch (failure) {
			setActionError(failure instanceof Error ? failure.message : 'The FAQ status could not be changed.');
		} finally {
			mutationLock.current = false;
			setBusyId('');
		}
	}

	async function confirmDelete() {
		if (!deleteTarget || mutationLock.current) return;
		mutationLock.current = true;
		setBusyId(deleteTarget._id);
		setActionError('');
		setFeedback('');
		try {
			const response = await deleteFaq({ variables: { faqId: deleteTarget._id } });
			const deleted = response.data?.deleteFaq;
			if (!deleted) throw new Error('The server did not confirm FAQ deletion.');
			setFeedback(`“${deleted.faqQuestion}” was permanently deleted.`);
			setDeleteTarget(null);
			await synchronize();
		} catch (failure) {
			setActionError(failure instanceof Error ? failure.message : 'The FAQ could not be deleted.');
		} finally {
			mutationLock.current = false;
			setBusyId('');
		}
	}

	return (
		<div className="admin-faqs-page">
			<header className="admin-page-header">
				<div>
					<Typography component="h1">FAQs</Typography>
					<Typography>Manage Help Center questions, publishing, and display order.</Typography>
				</div>
				<Button variant="contained" startIcon={<AddOutlined />} onClick={openCreate}>
					Add FAQ
				</Button>
			</header>

			{feedback ? (
				<Alert severity="success" onClose={() => setFeedback('')}>
					{feedback}
				</Alert>
			) : null}
			{actionError && !formOpen && !deleteTarget ? (
				<Alert severity="error" onClose={() => setActionError('')}>
					{actionError}
				</Alert>
			) : null}

			<section className="admin-faq-filters" aria-label="FAQ filters">
				<TextField
					label="Search FAQs"
					value={searchText}
					onChange={(event) => setSearchText(event.target.value)}
					slotProps={{ htmlInput: { maxLength: 200 } }}
				/>
				<TextField
					select
					label="Category"
					value={category}
					onChange={(event) => {
						setCategory(event.target.value as 'ALL' | FaqCategory);
						setPage(1);
					}}
				>
					<MenuItem value="ALL">All categories</MenuItem>
					{FAQ_CATEGORY_OPTIONS.map((option) => (
						<MenuItem key={option.value} value={option.value}>
							{option.label}
						</MenuItem>
					))}
				</TextField>
				<TextField
					select
					label="Status"
					value={status}
					onChange={(event) => {
						setStatus(event.target.value as 'ALL' | FaqStatus);
						setPage(1);
					}}
				>
					<MenuItem value="ALL">All statuses</MenuItem>
					<MenuItem value={FaqStatus.PUBLISHED}>Published</MenuItem>
					<MenuItem value={FaqStatus.DRAFT}>Draft</MenuItem>
				</TextField>
				<TextField
					select
					label="Sort"
					value={sort}
					onChange={(event) => {
						setSort(event.target.value as typeof sort);
						setPage(1);
					}}
				>
					<MenuItem value="order">Display order</MenuItem>
					<MenuItem value="newest">Newest</MenuItem>
					<MenuItem value="oldest">Oldest</MenuItem>
				</TextField>
			</section>

			<div ref={resultsRef} className="admin-faq-results" tabIndex={-1}>
				<div className="admin-faq-results-head">
					<Typography component="h2">
						{total.toLocaleString()} {total === 1 ? 'FAQ' : 'FAQs'}
					</Typography>
					{filtered ? (
						<Button size="small" onClick={clearFilters}>
							Clear filters
						</Button>
					) : null}
				</div>

				{loading && !data ? <FaqSkeleton /> : null}
				{error && !data ? (
					<Alert
						severity="error"
						action={
							<Button color="inherit" onClick={() => void refetch()}>
								Retry
							</Button>
						}
					>
						FAQs could not be loaded.
					</Alert>
				) : null}
				{!loading && !error && faqs.length === 0 ? (
					<div className="admin-empty-state">
						<Typography component="h2">No FAQs found</Typography>
						<Typography>
							{filtered ? 'Try changing or clearing the filters.' : 'Create the first Help Center FAQ.'}
						</Typography>
						<Button variant="contained" onClick={filtered ? clearFilters : openCreate}>
							{filtered ? 'Clear filters' : 'Add FAQ'}
						</Button>
					</div>
				) : null}

				{faqs.length ? (
					<div className="admin-faq-table" aria-busy={loading}>
						<div className="admin-faq-table-head" aria-hidden="true">
							<span>Question</span>
							<span>Category</span>
							<span>Status</span>
							<span>Order</span>
							<span>Updated</span>
							<span>Actions</span>
						</div>
						{faqs.map((faq) => {
							const busy = busyId === faq._id;
							return (
								<article key={faq._id} className="admin-faq-row">
									<div className="admin-faq-question" data-label="Question">
										<strong>{faq.faqQuestion}</strong>
										<p>{faq.faqAnswer}</p>
									</div>
									<div data-label="Category">{faqCategoryLabel(faq.faqCategory)}</div>
									<div data-label="Status">
										<Chip
											size="small"
											color={faq.faqStatus === FaqStatus.PUBLISHED ? 'success' : 'default'}
											label={statusLabel(faq.faqStatus)}
										/>
									</div>
									<div data-label="Order">{faq.faqOrder}</div>
									<div data-label="Updated">
										<time dateTime={faq.updatedAt}>{formatScheduleDate(faq.updatedAt)}</time>
									</div>
									<div className="admin-faq-actions" data-label="Actions">
										<Button size="small" startIcon={<EditOutlined />} disabled={busy} onClick={() => openEdit(faq)}>
											Edit
										</Button>
										<Button
											size="small"
											startIcon={faq.faqStatus === FaqStatus.PUBLISHED ? <UnpublishedOutlined /> : <PublishOutlined />}
											disabled={busy}
											onClick={() => void toggleStatus(faq)}
										>
											{faq.faqStatus === FaqStatus.PUBLISHED ? 'Unpublish' : 'Publish'}
										</Button>
										<Button
											color="error"
											size="small"
											startIcon={<DeleteOutlineOutlined />}
											disabled={busy}
										onClick={() => openDelete(faq)}
										>
											Delete
										</Button>
									</div>
								</article>
							);
						})}
					</div>
				) : null}
			</div>

			{total > PAGE_SIZE ? <Pagination page={page} count={pageCount} onChange={changePage} color="primary" /> : null}

			<Dialog className="admin-faq-dialog" open={formOpen} onClose={busyId ? undefined : () => setFormOpen(false)} fullWidth maxWidth="sm">
				<DialogTitle>{editingFaq ? 'Edit FAQ' : 'Add FAQ'}</DialogTitle>
				<DialogContent>
					{actionError ? (
						<Alert severity="error" onClose={() => setActionError('')}>
							{actionError}
						</Alert>
					) : null}
					<AdminFaqForm values={form} errors={formErrors} disabled={Boolean(busyId)} onChange={setForm} />
				</DialogContent>
				<DialogActions>
					<Button disabled={Boolean(busyId)} onClick={() => setFormOpen(false)}>
						Cancel
					</Button>
					<Button variant="contained" disabled={Boolean(busyId)} onClick={() => void submitFaq()}>
						{editingFaq ? 'Save Changes' : 'Create FAQ'}
					</Button>
				</DialogActions>
			</Dialog>

			<Dialog
				className="admin-faq-dialog"
				open={Boolean(deleteTarget)}
				onClose={busyId ? undefined : () => setDeleteTarget(null)}
				fullWidth
				maxWidth="xs"
			>
				<DialogTitle>Delete FAQ?</DialogTitle>
				<DialogContent>
					{actionError ? (
						<Alert severity="error" onClose={() => setActionError('')}>
							{actionError}
						</Alert>
					) : null}
					<Typography>This permanently deletes “{deleteTarget?.faqQuestion}”. This action cannot be undone.</Typography>
				</DialogContent>
				<DialogActions>
					<Button disabled={Boolean(busyId)} onClick={() => setDeleteTarget(null)}>
						Cancel
					</Button>
					<Button color="error" variant="contained" disabled={Boolean(busyId)} onClick={() => void confirmDelete()}>
						Delete
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
}
