import { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import BlockOutlined from '@mui/icons-material/BlockOutlined';
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutlineOutlined';
import SearchOutlined from '@mui/icons-material/SearchOutlined';
import {
	Alert,
	Avatar,
	Button,
	Chip,
	CircularProgress,
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
import { UPDATE_MEMBER_BY_ADMIN } from '@/apollo/admin/mutation';
import { GET_ADMIN_MEMBERS, type AdminMemberRow, type AdminMembersInput } from '@/apollo/admin/query';
import { MemberStatus, MemberType } from '@/libs/enums/member.enum';
import { packageImageUrl } from '../package/PackageImage';
import { formatScheduleDate } from '../package/PackageSchedules';

const PAGE_SIZE = 10;
const SEARCH_DELAY = 300;

type StatusChange = {
	member: AdminMemberRow;
	nextStatus: MemberStatus.ACTIVE | MemberStatus.BLOCKED;
};

const typeOptions: Array<{ value: MemberType | 'ALL'; label: string }> = [
	{ value: 'ALL', label: 'All roles' },
	{ value: MemberType.USER, label: 'User' },
	{ value: MemberType.AGENT, label: 'Agent' },
	{ value: MemberType.ADMIN, label: 'Admin' },
];

const statusOptions: Array<{ value: MemberStatus | 'ALL'; label: string }> = [
	{ value: 'ALL', label: 'All statuses' },
	{ value: MemberStatus.ACTIVE, label: 'Active' },
	{ value: MemberStatus.BLOCKED, label: 'Blocked' },
	{ value: MemberStatus.DELETED, label: 'Deleted' },
];

function enumLabel(value: string) {
	return value
		.toLowerCase()
		.split('_')
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(' ');
}

function MemberSkeletons() {
	return (
		<div className="admin-members-skeleton" aria-label="Loading members">
			{Array.from({ length: 6 }, (_, index) => (
				<Skeleton key={index} variant="rounded" height={82} />
			))}
		</div>
	);
}

function MemberRow({
	member,
	busy,
	onChangeStatus,
}: {
	member: AdminMemberRow;
	busy: boolean;
	onChangeStatus: (change: StatusChange) => void;
}) {
	const name = member.memberFullName?.trim() || member.memberNick;
	const contact = member.memberEmail?.trim() || member.memberPhone?.trim() || 'No contact details';
	const secondaryContact = member.memberEmail?.trim() && member.memberPhone?.trim() ? member.memberPhone : '';
	const location = [member.memberCity, member.memberCountry].filter(Boolean).join(', ');
	const manageable = member.memberType !== MemberType.ADMIN && member.memberStatus !== MemberStatus.DELETED;
	const nextStatus = member.memberStatus === MemberStatus.ACTIVE ? MemberStatus.BLOCKED : MemberStatus.ACTIVE;

	return (
		<article className="admin-member-row">
			<div className="admin-member-identity" data-label="Member">
				<Avatar src={packageImageUrl(member.memberImage)} alt={name}>
					{name.charAt(0).toUpperCase()}
				</Avatar>
				<div>
					<strong>{name}</strong>
					<span>@{member.memberNick}</span>
					<small>{member._id}</small>
				</div>
			</div>

			<div className="admin-member-cell admin-member-contact" data-label="Contact">
				<strong>{contact}</strong>
				{secondaryContact ? <span>{secondaryContact}</span> : null}
				{location ? <span>{location}</span> : null}
			</div>

			<div className="admin-member-cell" data-label="Role">
				<Chip
					label={enumLabel(member.memberType)}
					className={`admin-member-role is-${member.memberType.toLowerCase()}`}
					size="small"
				/>
			</div>

			<div className="admin-member-cell" data-label="Status">
				<Chip
					label={enumLabel(member.memberStatus)}
					className={`admin-member-status is-${member.memberStatus.toLowerCase()}`}
					size="small"
				/>
			</div>

			<div className="admin-member-cell" data-label="Joined">
				<strong>{formatScheduleDate(member.createdAt)}</strong>
				<span>{enumLabel(member.memberAuthType)}</span>
			</div>

			<div className="admin-member-action" data-label="Action">
				{manageable ? (
					<Button
						variant="outlined"
						color={nextStatus === MemberStatus.BLOCKED ? 'error' : 'primary'}
						startIcon={
							busy ? (
								<CircularProgress size={15} color="inherit" />
							) : nextStatus === MemberStatus.BLOCKED ? (
								<BlockOutlined />
							) : (
								<CheckCircleOutline />
							)
						}
						disabled={busy}
						onClick={() => onChangeStatus({ member, nextStatus })}
					>
						{nextStatus === MemberStatus.BLOCKED ? 'Block' : 'Reactivate'}
					</Button>
				) : (
					<Typography component="span">No actions</Typography>
				)}
			</div>
		</article>
	);
}

export default function AdminMembers() {
	const actionLock = useRef(false);
	const resultsRef = useRef<HTMLDivElement>(null);
	const [page, setPage] = useState(1);
	const [searchDraft, setSearchDraft] = useState('');
	const [search, setSearch] = useState('');
	const [memberType, setMemberType] = useState<MemberType | 'ALL'>('ALL');
	const [memberStatus, setMemberStatus] = useState<MemberStatus | 'ALL'>('ALL');
	const [sort, setSort] = useState<'newest' | 'oldest'>('newest');
	const [statusChange, setStatusChange] = useState<StatusChange | null>(null);
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

	const variables = useMemo<{ input: AdminMembersInput }>(
		() => ({
			input: {
				page,
				limit: PAGE_SIZE,
				sort: 'createdAt',
				direction: sort === 'newest' ? 'DESC' : 'ASC',
				search: {
					text: search || undefined,
					memberType: memberType === 'ALL' ? undefined : memberType,
					memberStatus: memberStatus === 'ALL' ? undefined : memberStatus,
				},
			},
		}),
		[memberStatus, memberType, page, search, sort],
	);

	const { data, loading, error, refetch } = useQuery(GET_ADMIN_MEMBERS, {
		variables,
		fetchPolicy: 'no-cache',
		notifyOnNetworkStatusChange: true,
	});
	const [updateMember] = useMutation(UPDATE_MEMBER_BY_ADMIN);
	const result = data?.getAllMembersByAdmin;
	const members = result?.list ?? [];
	const total = result?.metaCounter?.[0]?.total ?? 0;
	const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
	const filtered = Boolean(search || memberType !== 'ALL' || memberStatus !== 'ALL');

	function clearFilters() {
		setSearchDraft('');
		setSearch('');
		setMemberType('ALL');
		setMemberStatus('ALL');
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

	async function confirmStatusChange() {
		if (!statusChange || actionLock.current) return;
		actionLock.current = true;
		setBusyId(statusChange.member._id);
		setDialogError('');
		setActionError('');
		setNotice('');

		try {
			const response = await updateMember({
				variables: {
					input: {
						memberId: statusChange.member._id,
						memberStatus: statusChange.nextStatus,
					},
				},
			});
			const updated = response.data?.updateMemberByAdmin;
			if (!updated) throw new Error('The server did not return the updated member.');

			const updatedName = updated.memberFullName?.trim() || updated.memberNick;
			setNotice(`${updatedName} is now ${enumLabel(updated.memberStatus).toLowerCase()}.`);
			setStatusChange(null);

			try {
				const refreshed = await refetch();
				const freshTotal = refreshed.data.getAllMembersByAdmin.metaCounter?.[0]?.total ?? 0;
				const lastPage = Math.max(1, Math.ceil(freshTotal / PAGE_SIZE));
				if (page > lastPage) setPage(lastPage);
			} catch {
				setActionError('The member was updated, but the list could not be refreshed. Retry to synchronize it.');
			}
		} catch (failure) {
			setDialogError(failure instanceof Error ? failure.message : 'The member status could not be updated.');
		} finally {
			actionLock.current = false;
			setBusyId('');
		}
	}

	function changePage(_: React.ChangeEvent<unknown>, value: number) {
		setPage(value);
		resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}

	return (
		<div className="admin-members-page">
			<header className="admin-page-header">
				<div>
					<Typography className="admin-page-kicker">Member Management</Typography>
					<Typography component="h1">Members</Typography>
					<Typography>Search member accounts, review their access state, and manage supported statuses.</Typography>
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

			<div className="admin-members-toolbar">
				<TextField
					value={searchDraft}
					onChange={(event) => setSearchDraft(event.target.value)}
					placeholder="Search name, nickname, email, or phone"
					aria-label="Search members"
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
					label="Role"
					value={memberType}
					onChange={(event) => {
						setMemberType(event.target.value as MemberType | 'ALL');
						setPage(1);
					}}
				>
					{typeOptions.map((option) => (
						<MenuItem key={option.value} value={option.value}>
							{option.label}
						</MenuItem>
					))}
				</TextField>
				<TextField
					select
					label="Status"
					value={memberStatus}
					onChange={(event) => {
						setMemberStatus(event.target.value as MemberStatus | 'ALL');
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
						The member list could not be refreshed. The last loaded results remain visible.
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
					<MemberSkeletons />
				) : error && !result ? (
					<Alert severity="error" action={<Button onClick={() => void retryList()}>Retry</Button>}>
						Members could not be loaded. Your search and filters have been preserved.
					</Alert>
				) : members.length === 0 ? (
					<Paper className="admin-members-empty" elevation={0}>
						<Typography component="h2">{filtered ? 'No matching members' : 'No members yet'}</Typography>
						<Typography>
							{filtered
								? 'Try another search or clear the current filters.'
								: 'Member accounts will appear here when they become available.'}
						</Typography>
						{filtered ? (
							<Button variant="outlined" onClick={clearFilters}>
								Clear Filters
							</Button>
						) : null}
					</Paper>
				) : (
					<Paper className="admin-members-table" elevation={0}>
						<div className="admin-members-table-header" aria-hidden="true">
							<span>Member</span>
							<span>Contact</span>
							<span>Role</span>
							<span>Status</span>
							<span>Joined</span>
							<span>Action</span>
						</div>
						<div className="admin-members-list">
							{members.map((member) => (
								<MemberRow
									key={member._id}
									member={member}
									busy={busyId === member._id}
									onChangeStatus={(change) => {
										setDialogError('');
										setStatusChange(change);
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
				open={Boolean(statusChange)}
				onClose={() => {
					if (!busyId) {
						setStatusChange(null);
						setDialogError('');
					}
				}}
				fullWidth
				maxWidth="xs"
				className="admin-member-status-dialog"
			>
				<DialogTitle>
					{statusChange?.nextStatus === MemberStatus.BLOCKED ? 'Block member?' : 'Reactivate member?'}
				</DialogTitle>
				<DialogContent>
					<Typography>
						Change {statusChange?.member.memberFullName || statusChange?.member.memberNick}&apos;s status from{' '}
						<strong>{statusChange ? enumLabel(statusChange.member.memberStatus) : ''}</strong> to{' '}
						<strong>{statusChange ? enumLabel(statusChange.nextStatus) : ''}</strong>?
					</Typography>
					{dialogError ? <Alert severity="error">{dialogError}</Alert> : null}
				</DialogContent>
				<DialogActions>
					<Button
						disabled={Boolean(busyId)}
						onClick={() => {
							setStatusChange(null);
							setDialogError('');
						}}
					>
						Cancel
					</Button>
					<Button
						variant="contained"
						color={statusChange?.nextStatus === MemberStatus.BLOCKED ? 'error' : 'primary'}
						disabled={Boolean(busyId)}
						onClick={() => void confirmStatusChange()}
					>
						{busyId ? 'Updating…' : 'Confirm Change'}
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
}
