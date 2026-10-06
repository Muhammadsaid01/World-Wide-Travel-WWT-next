import { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import {
	Alert,
	Button,
	Chip,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	InputAdornment,
	MenuItem,
	Pagination,
	Paper,
	Skeleton,
	TextField,
	Typography,
} from '@mui/material';
import SearchOutlined from '@mui/icons-material/SearchOutlined';
import { GET_ALL_AGENT_REQUESTS_BY_ADMIN, type AdminAgentRequestsInput } from '@/apollo/user/query';
import { APPROVE_AGENT_REQUEST_BY_ADMIN, REJECT_AGENT_REQUEST_BY_ADMIN } from '@/apollo/user/mutation';
import { AgentRequestStatus } from '@/libs/enums/member.enum';
import type { AgentRequest } from '@/libs/types/agent-request/agent-request';
import { formatScheduleDate } from '../package/PackageSchedules';

const PAGE_SIZE = 8;
const SEARCH_DELAY = 300;

const statusOptions: Array<{ value: AgentRequestStatus | 'ALL'; label: string }> = [
	{ value: 'ALL', label: 'All statuses' },
	{ value: AgentRequestStatus.PENDING, label: 'Pending' },
	{ value: AgentRequestStatus.APPROVED, label: 'Approved' },
	{ value: AgentRequestStatus.REJECTED, label: 'Rejected' },
];

function requestStatusLabel(status: AgentRequestStatus) {
	return status.charAt(0) + status.slice(1).toLowerCase();
}

function RequestCard({
	request,
	busy,
	onApprove,
	onReject,
}: {
	request: AgentRequest;
	busy: boolean;
	onApprove: (request: AgentRequest) => void;
	onReject: (request: AgentRequest) => void;
}) {
	const pending = request.requestStatus === AgentRequestStatus.PENDING;

	return (
		<Paper component="article" className="admin-request-card" elevation={0}>
			<div className="admin-request-card-heading">
				<div>
					<Typography component="h2">{request.companyName}</Typography>
					<Typography className="admin-request-id">Applicant ID: {request.memberId}</Typography>
				</div>
				<Chip
					label={requestStatusLabel(request.requestStatus)}
					className={`admin-request-status is-${request.requestStatus.toLowerCase()}`}
				/>
			</div>

			<div className="admin-request-facts">
				<div>
					<span>Business Number</span>
					<strong>{request.businessNumber}</strong>
				</div>
				<div>
					<span>License Number</span>
					<strong>{request.licenseNumber}</strong>
				</div>
				<div>
					<span>Submitted</span>
					<strong>{formatScheduleDate(request.createdAt)}</strong>
				</div>
				{request.reviewedAt ? (
					<div>
						<span>Reviewed</span>
						<strong>{formatScheduleDate(request.reviewedAt)}</strong>
					</div>
				) : null}
			</div>

			<div className="admin-request-description">
				<span>Agency Description</span>
				<Typography>{request.agentDescription}</Typography>
			</div>

			{request.requestStatus === AgentRequestStatus.REJECTED && request.rejectReason?.trim() ? (
				<Alert severity="error" className="admin-request-reason">
					<strong>Rejection reason:</strong> {request.rejectReason}
				</Alert>
			) : null}

			{pending ? (
				<div className="admin-request-actions">
					<Button variant="outlined" color="error" disabled={busy} onClick={() => onReject(request)}>
						Reject
					</Button>
					<Button variant="contained" disabled={busy} onClick={() => onApprove(request)}>
						Approve
					</Button>
				</div>
			) : null}
		</Paper>
	);
}

export default function AdminAgentRequests() {
	const actionLock = useRef(false);
	const listRef = useRef<HTMLDivElement>(null);
	const [page, setPage] = useState(1);
	const [status, setStatus] = useState<AgentRequestStatus | 'ALL'>('ALL');
	const [sort, setSort] = useState<'newest' | 'oldest'>('newest');
	const [searchDraft, setSearchDraft] = useState('');
	const [search, setSearch] = useState('');
	const [approving, setApproving] = useState<AgentRequest | null>(null);
	const [rejecting, setRejecting] = useState<AgentRequest | null>(null);
	const [rejectReason, setRejectReason] = useState('');
	const [rejectError, setRejectError] = useState('');
	const [busyId, setBusyId] = useState('');
	const [actionError, setActionError] = useState('');
	const [notice, setNotice] = useState('');
	const [confirmed, setConfirmed] = useState<Record<string, AgentRequest>>({});

	useEffect(() => {
		const timer = setTimeout(() => {
			setSearch(searchDraft.trim());
			setPage(1);
		}, SEARCH_DELAY);
		return () => clearTimeout(timer);
	}, [searchDraft]);

	const variables = useMemo<{ input: AdminAgentRequestsInput }>(
		() => ({
			input: {
				page,
				limit: PAGE_SIZE,
				sort: 'createdAt',
				direction: sort === 'newest' ? 'DESC' : 'ASC',
				search: {
					requestStatus: status === 'ALL' ? undefined : status,
					text: search || undefined,
				},
			},
		}),
		[page, search, sort, status],
	);

	const { data, loading, error, refetch } = useQuery(GET_ALL_AGENT_REQUESTS_BY_ADMIN, {
		variables,
		fetchPolicy: 'no-cache',
		notifyOnNetworkStatusChange: true,
	});
	const [approveRequest] = useMutation(APPROVE_AGENT_REQUEST_BY_ADMIN);
	const [rejectRequest] = useMutation(REJECT_AGENT_REQUEST_BY_ADMIN);
	const result = data?.getAllAgentRequestsByAdmin;
	const requests = (result?.list ?? []).map((request) => confirmed[request._id] ?? request);
	const total = result?.metaCounter?.[0]?.total ?? 0;
	const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
	const filtered = Boolean(search || status !== 'ALL');

	async function synchronize(requestId: string) {
		try {
			const refreshed = await refetch();
			setConfirmed((current) => {
				const next = { ...current };
				delete next[requestId];
				return next;
			});
			const freshTotal = refreshed.data.getAllAgentRequestsByAdmin.metaCounter?.[0]?.total ?? 0;
			const lastPage = Math.max(1, Math.ceil(freshTotal / PAGE_SIZE));
			if (page > lastPage) setPage(lastPage);
		} catch {
			setActionError('The request was updated, but the list could not be refreshed. Retry the list to synchronize it.');
		}
	}

	async function confirmApproval() {
		if (!approving || approving.requestStatus !== AgentRequestStatus.PENDING || actionLock.current) return;
		actionLock.current = true;
		setBusyId(approving._id);
		setActionError('');
		setNotice('');
		try {
			const response = await approveRequest({ variables: { agentRequestId: approving._id } });
			const approved = response.data?.approveAgentRequestByAdmin;
			if (!approved) throw new Error('The server did not return the approved request.');
			setConfirmed((current) => ({ ...current, [approved._id]: approved }));
			setNotice(`${approved.companyName} was approved as an Agent.`);
			setApproving(null);
			await synchronize(approved._id);
		} catch (failure) {
			setActionError(failure instanceof Error ? failure.message : 'The request could not be approved.');
		} finally {
			actionLock.current = false;
			setBusyId('');
		}
	}

	async function confirmRejection() {
		if (!rejecting || rejecting.requestStatus !== AgentRequestStatus.PENDING || actionLock.current) return;
		const reason = rejectReason.trim();
		if (reason.length < 2) {
			setRejectError('Rejection reason must be at least 2 characters.');
			return;
		}
		if (reason.length > 500) {
			setRejectError('Rejection reason must be 500 characters or fewer.');
			return;
		}

		actionLock.current = true;
		setBusyId(rejecting._id);
		setRejectError('');
		setActionError('');
		setNotice('');
		try {
			const response = await rejectRequest({
				variables: { agentRequestId: rejecting._id, input: { rejectReason: reason } },
			});
			const rejected = response.data?.rejectAgentRequestByAdmin;
			if (!rejected) throw new Error('The server did not return the rejected request.');
			setConfirmed((current) => ({ ...current, [rejected._id]: rejected }));
			setNotice(`${rejected.companyName}'s request was rejected.`);
			setRejecting(null);
			setRejectReason('');
			await synchronize(rejected._id);
		} catch (failure) {
			setActionError(failure instanceof Error ? failure.message : 'The request could not be rejected.');
		} finally {
			actionLock.current = false;
			setBusyId('');
		}
	}

	function clearFilters() {
		setSearchDraft('');
		setSearch('');
		setStatus('ALL');
		setPage(1);
	}

	async function retryList() {
		setActionError('');
		try {
			await refetch();
			setConfirmed({});
		} catch {
			/* Apollo keeps the query error available for the retryable error state. */
		}
	}

	return (
		<div className="admin-agent-requests-page">
			<header className="admin-page-header">
				<div>
					<Typography className="admin-page-kicker">Agent Management</Typography>
					<Typography component="h1">Agent Requests</Typography>
					<Typography>Review agency applications and make the final approval decision.</Typography>
				</div>
				{!loading && !error ? (
					<span className="admin-total-count">
						{total} {total === 1 ? 'Request' : 'Requests'}
					</span>
				) : null}
			</header>

			<section className="admin-request-toolbar" aria-label="Agent request filters">
				<TextField
					className="admin-request-search"
					size="small"
					placeholder="Search company or registration numbers"
					value={searchDraft}
					onChange={(event) => setSearchDraft(event.target.value)}
					slotProps={{
						htmlInput: { 'aria-label': 'Search agent requests' },
						input: {
							startAdornment: (
								<InputAdornment position="start">
									<SearchOutlined />
								</InputAdornment>
							),
						},
					}}
				/>
				<TextField
					select
					size="small"
					label="Status"
					value={status}
					onChange={(event) => {
						setStatus(event.target.value as AgentRequestStatus | 'ALL');
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

			{notice ? (
				<Alert severity="success" role="status" className="admin-request-feedback">
					{notice}
				</Alert>
			) : null}
			{actionError && !approving && !rejecting ? (
				<Alert
					severity="error"
					className="admin-request-feedback"
					action={<Button onClick={() => void retryList()}>Refresh list</Button>}
				>
					{actionError}
				</Alert>
			) : null}

			<div ref={listRef} className="admin-request-results" aria-busy={loading}>
				{loading && !data ? (
					<div className="admin-request-list" aria-label="Loading agent requests">
						{Array.from({ length: 4 }, (_, index) => (
							<Skeleton key={index} variant="rounded" height={310} />
						))}
					</div>
				) : error && !data ? (
					<Alert severity="error" action={<Button onClick={() => void retryList()}>Retry</Button>}>
						Agent requests could not be loaded.
					</Alert>
				) : requests.length ? (
					<>
						{error ? (
							<Alert
								severity="warning"
								className="admin-request-feedback"
								action={<Button onClick={() => void retryList()}>Retry</Button>}
							>
								The latest Agent Request data could not be refreshed.
							</Alert>
						) : null}
						<div className="admin-request-list">
							{requests.map((request) => (
								<RequestCard
									key={request._id}
									request={request}
									busy={Boolean(busyId)}
									onApprove={(selected) => {
										setActionError('');
										setApproving(selected);
									}}
									onReject={(selected) => {
										setActionError('');
										setRejectError('');
										setRejectReason('');
										setRejecting(selected);
									}}
								/>
							))}
						</div>
					</>
				) : (
					<div className="admin-request-empty">
						<Typography component="h2">No agent requests found</Typography>
						<Typography>
							{filtered
								? 'Try another search or status filter.'
								: 'No members have submitted an Agent application yet.'}
						</Typography>
						{filtered ? <Button onClick={clearFilters}>Clear filters</Button> : null}
					</div>
				)}
			</div>

			{!loading && !error && total > PAGE_SIZE ? (
				<Pagination
					className="admin-request-pagination"
					page={page}
					count={pageCount}
					color="primary"
					onChange={(_, nextPage) => {
						setPage(nextPage);
						requestAnimationFrame(() => listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
					}}
					aria-label="Agent request pages"
				/>
			) : null}

			<Dialog
				className="admin-request-dialog"
				open={Boolean(approving)}
				onClose={() => {
					if (!busyId) setApproving(null);
				}}
				fullWidth
				maxWidth="sm"
			>
				<DialogTitle>Approve Agent Request?</DialogTitle>
				<DialogContent>
					<Typography>
						Approving <strong>{approving?.companyName}</strong> grants the member Agent access and creates their agency
						profile.
					</Typography>
					{actionError ? <Alert severity="error">{actionError}</Alert> : null}
				</DialogContent>
				<DialogActions>
					<Button disabled={Boolean(busyId)} onClick={() => setApproving(null)}>
						Cancel
					</Button>
					<Button variant="contained" disabled={Boolean(busyId)} onClick={() => void confirmApproval()}>
						{busyId ? 'Approving...' : 'Approve Request'}
					</Button>
				</DialogActions>
			</Dialog>

			<Dialog
				className="admin-request-dialog"
				open={Boolean(rejecting)}
				onClose={() => {
					if (!busyId) setRejecting(null);
				}}
				fullWidth
				maxWidth="sm"
			>
				<DialogTitle>Reject Agent Request</DialogTitle>
				<DialogContent>
					<Typography className="admin-reject-help">
						Explain why <strong>{rejecting?.companyName}</strong> cannot be approved. The applicant can use this reason
						when applying again.
					</Typography>
					{actionError ? <Alert severity="error">{actionError}</Alert> : null}
					<TextField
						label="Rejection Reason"
						value={rejectReason}
						onChange={(event) => {
							setRejectReason(event.target.value);
							setRejectError('');
							setActionError('');
						}}
						error={Boolean(rejectError)}
						helperText={rejectError || `${rejectReason.length} / 500`}
						disabled={Boolean(busyId)}
						multiline
						minRows={4}
						fullWidth
						autoFocus
						required
						slotProps={{ htmlInput: { maxLength: 500 } }}
					/>
				</DialogContent>
				<DialogActions>
					<Button disabled={Boolean(busyId)} onClick={() => setRejecting(null)}>
						Cancel
					</Button>
					<Button color="error" variant="contained" disabled={Boolean(busyId)} onClick={() => void confirmRejection()}>
						{busyId ? 'Rejecting...' : 'Reject Request'}
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
}
