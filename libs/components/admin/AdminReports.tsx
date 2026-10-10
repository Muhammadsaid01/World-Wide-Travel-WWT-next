import { DELETE_REPORT_BY_ADMIN } from '@/apollo/admin/mutation';
import { GET_ADMIN_REPORTS, type AdminReportsInput } from '@/apollo/admin/query';
import { formatScheduleDate } from '@/libs/components/package/PackageSchedules';
import {
	REPORT_STATUS_OPTIONS,
	REPORT_TARGET_OPTIONS,
	reportReasonLabel,
	reportStatusClass,
	reportStatusLabel,
	reportTargetLabel,
} from '@/libs/components/cs/reportState';
import { ReportStatus, ReportTargetType } from '@/libs/enums/system.enum';
import type { ReportEntity } from '@/libs/types/system/report';
import { useMutation, useQuery } from '@apollo/client';
import DeleteOutlineOutlined from '@mui/icons-material/DeleteOutlineOutlined';
import VisibilityOutlined from '@mui/icons-material/VisibilityOutlined';
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
import { type ChangeEvent, useMemo, useRef, useState } from 'react';
import AdminReportDetail from './AdminReportDetail';

const PAGE_SIZE = 10;

export default function AdminReports() {
	const mutationLock = useRef(false);
	const resultsRef = useRef<HTMLDivElement>(null);
	const [page, setPage] = useState(1);
	const [status, setStatus] = useState<'ALL' | ReportStatus>('ALL');
	const [targetType, setTargetType] = useState<'ALL' | ReportTargetType>('ALL');
	const [direction, setDirection] = useState<'DESC' | 'ASC'>('DESC');
	const [selectedId, setSelectedId] = useState('');
	const [deleteTarget, setDeleteTarget] = useState<ReportEntity | null>(null);
	const [deleteBusy, setDeleteBusy] = useState(false);
	const [feedback, setFeedback] = useState('');
	const [actionError, setActionError] = useState('');
	const variables = useMemo<{ input: AdminReportsInput }>(
		() => ({
			input: {
				page,
				limit: PAGE_SIZE,
				sort: 'createdAt',
				direction,
				search: {
					reportStatus: status === 'ALL' ? undefined : status,
					targetType: targetType === 'ALL' ? undefined : targetType,
				},
			},
		}),
		[direction, page, status, targetType],
	);
	const { data, loading, error, refetch } = useQuery(GET_ADMIN_REPORTS, {
		variables,
		fetchPolicy: 'no-cache',
		notifyOnNetworkStatusChange: true,
	});
	const [deleteReport] = useMutation(DELETE_REPORT_BY_ADMIN);
	const reports = data?.getReports.list ?? [];
	const total = data?.getReports.metaCounter?.[0]?.total ?? 0;
	const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
	const filtered = status !== 'ALL' || targetType !== 'ALL';

	function changePage(_: ChangeEvent<unknown>, nextPage: number) {
		setPage(nextPage);
		resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}

	function clearFilters() {
		setStatus('ALL');
		setTargetType('ALL');
		setDirection('DESC');
		setPage(1);
	}

	async function synchronize(targetPage = page) {
		try {
			const refreshed = await refetch({ input: { ...variables.input, page: targetPage } });
			const freshTotal = refreshed.data.getReports.metaCounter?.[0]?.total ?? 0;
			const lastPage = Math.max(1, Math.ceil(freshTotal / PAGE_SIZE));
			if (targetPage > lastPage) setPage(lastPage);
		} catch {
			setActionError('The action succeeded, but the report list could not be refreshed. Retry to synchronize it.');
		}
	}

	async function confirmDelete() {
		if (!deleteTarget || mutationLock.current) return;
		mutationLock.current = true;
		setDeleteBusy(true);
		setActionError('');
		setFeedback('');
		try {
			const response = await deleteReport({ variables: { reportId: deleteTarget._id } });
			if (!response.data?.deleteReportByAdmin?._id) throw new Error('The server did not confirm report deletion.');
			const lastPage = Math.max(1, Math.ceil(Math.max(0, total - 1) / PAGE_SIZE));
			const nextPage = Math.min(page, lastPage);
			setFeedback(`Report ${deleteTarget._id} was permanently deleted.`);
			setDeleteTarget(null);
			if (nextPage !== page) setPage(nextPage);
			else await synchronize(nextPage);
		} catch (failure) {
			setActionError(failure instanceof Error ? failure.message : 'The report could not be deleted.');
		} finally {
			mutationLock.current = false;
			setDeleteBusy(false);
		}
	}

	return (
		<div className="admin-reports-page">
			<header className="admin-page-header">
				<div>
					<Typography className="admin-page-kicker">Trust and safety</Typography>
					<Typography component="h1">Reports</Typography>
					<Typography>Review member submissions and manage the supported report lifecycle.</Typography>
				</div>
				<span className={`admin-total-count${error && !data ? ' is-unavailable' : ''}`}>
					{error && !data
						? 'Total unavailable'
						: loading && !data
							? 'Loading total'
							: `${total} ${total === 1 ? 'report' : 'reports'}`}
				</span>
			</header>

			{feedback ? (
				<Alert severity="success" onClose={() => setFeedback('')}>
					{feedback}
				</Alert>
			) : null}
			{actionError && !deleteTarget ? (
				<Alert severity="error" onClose={() => setActionError('')}>
					{actionError}
				</Alert>
			) : null}

			<section className="admin-reports-toolbar" aria-label="Report filters">
				<TextField
					select
					size="small"
					label="Status"
					value={status}
					onChange={(event) => {
						setStatus(event.target.value as typeof status);
						setPage(1);
					}}
				>
					<MenuItem value="ALL">All statuses</MenuItem>
					{REPORT_STATUS_OPTIONS.map((option) => (
						<MenuItem key={option.value} value={option.value}>
							{option.label}
						</MenuItem>
					))}
				</TextField>
				<TextField
					select
					size="small"
					label="Target type"
					value={targetType}
					onChange={(event) => {
						setTargetType(event.target.value as typeof targetType);
						setPage(1);
					}}
				>
					<MenuItem value="ALL">All target types</MenuItem>
					{REPORT_TARGET_OPTIONS.map((option) => (
						<MenuItem key={option.value} value={option.value}>
							{option.label}
						</MenuItem>
					))}
				</TextField>
				<TextField
					select
					size="small"
					label="Sort"
					value={direction}
					onChange={(event) => {
						setDirection(event.target.value as typeof direction);
						setPage(1);
					}}
				>
					<MenuItem value="DESC">Newest first</MenuItem>
					<MenuItem value="ASC">Oldest first</MenuItem>
				</TextField>
				{filtered ? (
					<Button size="small" onClick={clearFilters}>
						Clear filters
					</Button>
				) : null}
			</section>

			<div ref={resultsRef} className="admin-reports-results" tabIndex={-1} aria-busy={loading}>
				{loading ? (
					<div className="admin-reports-skeleton" aria-label="Loading reports">
						{Array.from({ length: 6 }, (_, index) => (
							<Skeleton key={index} variant="rounded" height={92} />
						))}
					</div>
				) : error ? (
					<Alert severity="error" action={<Button onClick={() => void refetch().catch(() => undefined)}>Retry</Button>}>
						Reports could not be loaded. {error.message}
					</Alert>
				) : reports.length === 0 ? (
					<div className="admin-reports-empty">
						<Typography component="h2">
							{filtered ? 'No reports match these filters.' : 'No reports have been submitted.'}
						</Typography>
						{filtered ? <Button onClick={clearFilters}>Clear filters</Button> : null}
					</div>
				) : (
					<div className="admin-reports-table">
						<div className="admin-reports-table-head" aria-hidden="true">
							<span>Reported target</span>
							<span>Type</span>
							<span>Reason</span>
							<span>Reporter</span>
							<span>Status</span>
							<span>Created</span>
							<span>Actions</span>
						</div>
						{reports.map((report) => (
							<article className="admin-report-row" key={report._id}>
								<div data-label="Reported target">
									<code>{report.targetId}</code>
								</div>
								<div data-label="Type">{reportTargetLabel(report.targetType)}</div>
								<div data-label="Reason">
									<strong>{reportReasonLabel(report.reportType)}</strong>
								</div>
								<div data-label="Reporter">
									<code>{report.reporterId}</code>
								</div>
								<div data-label="Status">
									<Chip
										size="small"
										className={reportStatusClass(report.reportStatus)}
										label={reportStatusLabel(report.reportStatus)}
									/>
								</div>
								<div data-label="Created">
									<time dateTime={report.createdAt}>{formatScheduleDate(report.createdAt)}</time>
								</div>
								<div className="admin-report-row-actions" data-label="Actions">
									<Button size="small" startIcon={<VisibilityOutlined />} onClick={() => setSelectedId(report._id)}>
										View
									</Button>
									<Button
										size="small"
										color="error"
										startIcon={<DeleteOutlineOutlined />}
										onClick={() => {
											setActionError('');
											setDeleteTarget(report);
										}}
									>
										Delete
									</Button>
								</div>
							</article>
						))}
					</div>
				)}
			</div>

			{!loading && !error && total > PAGE_SIZE ? (
				<Pagination page={page} count={pageCount} onChange={changePage} color="primary" />
			) : null}

			<AdminReportDetail
				key={selectedId || 'closed'}
				open={Boolean(selectedId)}
				reportId={selectedId}
				onClose={() => setSelectedId('')}
				onUpdated={async () => {
					await synchronize();
				}}
			/>
			<Dialog
				open={Boolean(deleteTarget)}
				onClose={deleteBusy ? undefined : () => setDeleteTarget(null)}
				aria-labelledby="delete-report-title"
			>
				<DialogTitle id="delete-report-title">Permanently delete report?</DialogTitle>
				<DialogContent>
					<Typography>
						This permanently removes report <code>{deleteTarget?._id}</code>. This action cannot be undone.
					</Typography>
					{actionError ? <Alert severity="error">{actionError}</Alert> : null}
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setDeleteTarget(null)} disabled={deleteBusy}>
						Cancel
					</Button>
					<Button color="error" variant="contained" onClick={() => void confirmDelete()} disabled={deleteBusy}>
						{deleteBusy ? 'Deleting…' : 'Delete Permanently'}
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
}
