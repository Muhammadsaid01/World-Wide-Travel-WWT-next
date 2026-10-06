import { type ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import SearchOutlined from '@mui/icons-material/SearchOutlined';
import {
	Alert,
	Avatar,
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
import { UPDATE_AGENT_BY_ADMIN } from '@/apollo/admin/mutation';
import { GET_ADMIN_AGENTS, type AdminAgentRow, type AdminAgentsInput } from '@/apollo/admin/query';
import { AgentStatus, AgentVerificationStatus } from '@/libs/enums/member.enum';
import { packageImageUrl } from '../package/PackageImage';
import { formatScheduleDate } from '../package/PackageSchedules';

const PAGE_SIZE = 10;
const SEARCH_DELAY = 300;

type AgentChange =
	| {
			agent: AdminAgentRow;
			field: 'agentStatus';
			nextValue: AgentStatus.ACTIVE | AgentStatus.SUSPENDED;
	  }
	| {
			agent: AdminAgentRow;
			field: 'verificationStatus';
			nextValue: AgentVerificationStatus.APPROVED | AgentVerificationStatus.REVOKED;
	  };

const statusOptions: Array<{ value: AgentStatus | 'ALL'; label: string }> = [
	{ value: 'ALL', label: 'All statuses' },
	{ value: AgentStatus.ACTIVE, label: 'Active' },
	{ value: AgentStatus.SUSPENDED, label: 'Suspended' },
	{ value: AgentStatus.DELETED, label: 'Deleted' },
];

function enumLabel(value: string) {
	return value
		.toLowerCase()
		.split('_')
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(' ');
}

function changeLabel(change: AgentChange) {
	if (change.field === 'agentStatus') {
		return change.nextValue === AgentStatus.SUSPENDED ? 'Suspend' : 'Activate';
	}
	return change.nextValue === AgentVerificationStatus.REVOKED ? 'Revoke Verification' : 'Approve Verification';
}

function AgentRow({
	agent,
	busy,
	onChange,
}: {
	agent: AdminAgentRow;
	busy: boolean;
	onChange: (change: AgentChange) => void;
}) {
	const member = agent.memberData;
	const memberName = member?.memberFullName?.trim() || member?.memberNick || 'Member unavailable';
	const memberHandle = member?.memberNick ? `@${member.memberNick}` : `Member ID: ${agent.memberId}`;
	const location = [member?.memberCity, member?.memberCountry].filter(Boolean).join(', ');
	const companyContact = agent.companyEmail?.trim() || agent.companyPhone?.trim() || 'No company contact';
	const statusChange: AgentChange = {
		agent,
		field: 'agentStatus',
		nextValue: agent.agentStatus === AgentStatus.ACTIVE ? AgentStatus.SUSPENDED : AgentStatus.ACTIVE,
	};
	const verificationChange: AgentChange = {
		agent,
		field: 'verificationStatus',
		nextValue:
			agent.verificationStatus === AgentVerificationStatus.APPROVED
				? AgentVerificationStatus.REVOKED
				: AgentVerificationStatus.APPROVED,
	};
	const manageable = agent.agentStatus !== AgentStatus.DELETED;

	return (
		<article className="admin-agent-management-row">
			<div className="admin-member-identity" data-label="Agent">
				<Avatar src={packageImageUrl(member?.memberImage)} alt={memberName}>
					{memberName.charAt(0).toUpperCase()}
				</Avatar>
				<div>
					<strong>{memberName}</strong>
					<span>{memberHandle}</span>
					<small>{agent._id}</small>
				</div>
			</div>

			<div className="admin-agent-company" data-label="Agency">
				<strong>{agent.companyName}</strong>
				<span>{companyContact}</span>
				<span>
					Business {agent.businessNumber} · License {agent.licenseNumber}
				</span>
				{agent.officeAddress || location ? <span>{agent.officeAddress || location}</span> : null}
				{agent.agentDesc?.trim() ? <p>{agent.agentDesc}</p> : null}
			</div>

			<div className="admin-member-cell" data-label="Status">
				<Chip
					label={enumLabel(agent.agentStatus)}
					className={`admin-agent-management-status is-${agent.agentStatus.toLowerCase()}`}
					size="small"
				/>
			</div>

			<div className="admin-member-cell" data-label="Verification">
				<Chip
					label={enumLabel(agent.verificationStatus)}
					className={`admin-agent-verification is-${agent.verificationStatus.toLowerCase()}`}
					size="small"
				/>
			</div>

			<div className="admin-member-cell" data-label="Approved">
				<strong>{formatScheduleDate(agent.agentApprovedAt)}</strong>
				<span>Created {formatScheduleDate(agent.createdAt)}</span>
			</div>

			<div className="admin-agent-actions" data-label="Actions">
				{manageable ? (
					<>
						<Button
							variant="outlined"
							color={statusChange.nextValue === AgentStatus.SUSPENDED ? 'error' : 'primary'}
							disabled={busy}
							onClick={() => onChange(statusChange)}
						>
							{changeLabel(statusChange)}
						</Button>
						<Button variant="text" disabled={busy} onClick={() => onChange(verificationChange)}>
							{changeLabel(verificationChange)}
						</Button>
					</>
				) : (
					<Typography component="span">No actions</Typography>
				)}
			</div>
		</article>
	);
}

export default function AdminAgents() {
	const actionLock = useRef(false);
	const resultsRef = useRef<HTMLDivElement>(null);
	const [page, setPage] = useState(1);
	const [searchDraft, setSearchDraft] = useState('');
	const [search, setSearch] = useState('');
	const [agentStatus, setAgentStatus] = useState<AgentStatus | 'ALL'>('ALL');
	const [sort, setSort] = useState<'newest' | 'oldest'>('newest');
	const [pendingChange, setPendingChange] = useState<AgentChange | null>(null);
	const [busyId, setBusyId] = useState('');
	const [dialogError, setDialogError] = useState('');
	const [actionError, setActionError] = useState('');
	const [notice, setNotice] = useState('');

	useEffect(() => {
		const timer = setTimeout(() => {
			setSearch(searchDraft.trim());
			setPage(1);
		}, SEARCH_DELAY);
		return () => clearTimeout(timer);
	}, [searchDraft]);

	const variables = useMemo<{ input: AdminAgentsInput }>(
		() => ({
			input: {
				page,
				limit: PAGE_SIZE,
				sort: 'createdAt',
				direction: sort === 'newest' ? 'DESC' : 'ASC',
				search: {
					text: search || undefined,
					agentStatus: agentStatus === 'ALL' ? undefined : agentStatus,
				},
			},
		}),
		[agentStatus, page, search, sort],
	);

	const { data, loading, error, refetch } = useQuery(GET_ADMIN_AGENTS, {
		variables,
		fetchPolicy: 'no-cache',
		notifyOnNetworkStatusChange: true,
	});
	const [updateAgent] = useMutation(UPDATE_AGENT_BY_ADMIN);
	const result = data?.getAllAgentsByAdmin;
	const agents = result?.list ?? [];
	const total = result?.metaCounter?.[0]?.total ?? 0;
	const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
	const filtered = Boolean(search || agentStatus !== 'ALL');

	function clearFilters() {
		setSearchDraft('');
		setSearch('');
		setAgentStatus('ALL');
		setSort('newest');
		setPage(1);
	}

	async function retryList() {
		setActionError('');
		try {
			await refetch();
		} catch {
			// Apollo exposes the retry failure through the query error state.
		}
	}

	async function confirmChange() {
		if (!pendingChange || actionLock.current) return;
		actionLock.current = true;
		setBusyId(pendingChange.agent._id);
		setDialogError('');
		setActionError('');
		setNotice('');

		const input =
			pendingChange.field === 'agentStatus'
				? { agentId: pendingChange.agent._id, agentStatus: pendingChange.nextValue }
				: { agentId: pendingChange.agent._id, verificationStatus: pendingChange.nextValue };

		try {
			const response = await updateAgent({ variables: { input } });
			const updated = response.data?.updateAgentByAdmin;
			if (!updated) throw new Error('The server did not return the updated agent.');

			setNotice(`${updated.companyName} was updated successfully.`);
			setPendingChange(null);

			try {
				const refreshed = await refetch();
				const freshTotal = refreshed.data.getAllAgentsByAdmin.metaCounter?.[0]?.total ?? 0;
				const lastPage = Math.max(1, Math.ceil(freshTotal / PAGE_SIZE));
				if (page > lastPage) setPage(lastPage);
			} catch {
				setActionError('The agent was updated, but the list could not be refreshed. Retry to synchronize it.');
			}
		} catch (failure) {
			setDialogError(failure instanceof Error ? failure.message : 'The agent could not be updated.');
		} finally {
			actionLock.current = false;
			setBusyId('');
		}
	}

	function changePage(_: ChangeEvent<unknown>, value: number) {
		setPage(value);
		resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}

	return (
		<div className="admin-agents-page">
			<header className="admin-page-header">
				<div>
					<Typography className="admin-page-kicker">Agent Management</Typography>
					<Typography component="h1">Agents</Typography>
					<Typography>Review agency profiles, member relationships, and supported operational states.</Typography>
				</div>
				{loading && !result ? (
					<Skeleton variant="rounded" width={112} height={38} />
				) : error && !result ? (
					<span className="admin-total-count is-unavailable">Count unavailable</span>
				) : (
					<span className="admin-total-count">
						{total} {filtered ? 'matching' : 'total'}
					</span>
				)}
			</header>

			<div className="admin-agents-toolbar">
				<TextField
					value={searchDraft}
					onChange={(event) => setSearchDraft(event.target.value)}
					placeholder="Search company name or company email"
					aria-label="Search agents"
					slotProps={{
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
					label="Status"
					value={agentStatus}
					onChange={(event) => {
						setAgentStatus(event.target.value as AgentStatus | 'ALL');
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
					label="Sort"
					value={sort}
					onChange={(event) => {
						setSort(event.target.value as 'newest' | 'oldest');
						setPage(1);
					}}
				>
					<MenuItem value="newest">Newest</MenuItem>
					<MenuItem value="oldest">Oldest</MenuItem>
				</TextField>
			</div>

			<div className="admin-members-feedback">
				{error && result ? (
					<Alert severity="error" action={<Button onClick={() => void retryList()}>Retry</Button>}>
						The agent list could not be refreshed. The last loaded results remain visible.
					</Alert>
				) : null}
				{notice ? (
					<Alert severity="success" onClose={() => setNotice('')}>
						{notice}
					</Alert>
				) : null}
				{actionError ? (
					<Alert severity="warning" action={<Button onClick={() => void retryList()}>Retry</Button>}>
						{actionError}
					</Alert>
				) : null}
			</div>

			<div ref={resultsRef} className="admin-members-results">
				{loading && !result ? (
					<div className="admin-members-skeleton" aria-label="Loading agents">
						{Array.from({ length: 6 }, (_, index) => (
							<Skeleton key={index} variant="rounded" height={104} />
						))}
					</div>
				) : error && !result ? (
					<Alert severity="error" action={<Button onClick={() => void retryList()}>Retry</Button>}>
						Agents could not be loaded. Your search and filters have been preserved.
					</Alert>
				) : agents.length === 0 ? (
					<Paper className="admin-members-empty" elevation={0}>
						<Typography component="h2">{filtered ? 'No matching agents' : 'No agents yet'}</Typography>
						<Typography>
							{filtered
								? 'Try another company search or clear the current filters.'
								: 'Agent profiles will appear here when they become available.'}
						</Typography>
						{filtered ? (
							<Button variant="outlined" onClick={clearFilters}>
								Clear Filters
							</Button>
						) : null}
					</Paper>
				) : (
					<Paper className="admin-members-table admin-agents-table" elevation={0}>
						<div className="admin-agents-table-header" aria-hidden="true">
							<span>Agent</span>
							<span>Agency</span>
							<span>Status</span>
							<span>Verification</span>
							<span>Approved</span>
							<span>Actions</span>
						</div>
						<div className="admin-members-list">
							{agents.map((agent) => (
								<AgentRow
									key={agent._id}
									agent={agent}
									busy={busyId === agent._id}
									onChange={(change) => {
										setDialogError('');
										setPendingChange(change);
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
				open={Boolean(pendingChange)}
				onClose={() => {
					if (!busyId) {
						setPendingChange(null);
						setDialogError('');
					}
				}}
				fullWidth
				maxWidth="xs"
				className="admin-agent-change-dialog"
			>
				<DialogTitle>{pendingChange ? `${changeLabel(pendingChange)}?` : 'Update agent?'}</DialogTitle>
				<DialogContent>
					<Typography>
						Apply <strong>{pendingChange ? changeLabel(pendingChange).toLowerCase() : 'this change'}</strong> to{' '}
						<strong>{pendingChange?.agent.companyName}</strong>?
					</Typography>
					{dialogError ? <Alert severity="error">{dialogError}</Alert> : null}
				</DialogContent>
				<DialogActions>
					<Button
						disabled={Boolean(busyId)}
						onClick={() => {
							setPendingChange(null);
							setDialogError('');
						}}
					>
						Cancel
					</Button>
					<Button
						variant="contained"
						color={
							pendingChange?.nextValue === AgentStatus.SUSPENDED ||
							pendingChange?.nextValue === AgentVerificationStatus.REVOKED
								? 'error'
								: 'primary'
						}
						disabled={Boolean(busyId)}
						onClick={() => void confirmChange()}
					>
						{busyId ? 'Updating…' : 'Confirm Change'}
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
}
