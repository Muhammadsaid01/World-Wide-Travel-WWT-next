import { useRef, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery } from '@apollo/client';
import {
	Alert,
	Breadcrumbs,
	Button,
	Chip,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	MenuItem,
	Pagination,
	Paper,
	Skeleton,
	Snackbar,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TextField,
	Typography,
} from '@mui/material';
import { currentUserVar } from '@/apollo/store';
import { GET_AGENT_BOOKINGS, type AgentBooking } from '@/apollo/user/query';
import { UPDATE_BOOKING_STATUS } from '@/apollo/user/mutation';
import { MemberType } from '@/libs/enums/member.enum';
import { BookingStatus } from '@/libs/enums/booking.enum';
import { formatScheduleDate } from '../package/PackageSchedules';
import ProfileSidebar from './ProfileSidebar';
import { agentBookingsInput, agentBookingTransitions, AGENT_BOOKINGS_PAGE_SIZE } from './agentBookingsState';

const actionLabels: Partial<Record<BookingStatus, string>> = {
	[BookingStatus.CONFIRMED]: 'Confirm',
	[BookingStatus.REJECTED]: 'Reject',
	[BookingStatus.COMPLETED]: 'Complete',
};

export default function AgentBookings({ memberId }: { memberId: string }) {
	const [page, setPage] = useState(1);
	const [status, setStatus] = useState<BookingStatus | ''>('');
	const [searchDraft, setSearchDraft] = useState('');
	const [text, setText] = useState('');
	const [direction, setDirection] = useState<'ASC' | 'DESC'>('DESC');
	const [selected, setSelected] = useState<{ booking: AgentBooking; target: BookingStatus } | null>(null);
	const [busy, setBusy] = useState(false);
	const saving = useRef(false);
	const [notice, setNotice] = useState<{ severity: 'success' | 'warning' | 'error'; message: string } | null>(null);
	const input = agentBookingsInput(page, status, text, direction);
	const query = useQuery(GET_AGENT_BOOKINGS, {
		variables: { input },
		fetchPolicy: 'no-cache',
		notifyOnNetworkStatusChange: true,
	});
	const [updateStatus] = useMutation(UPDATE_BOOKING_STATUS);
	const result = query.data?.getBookingsByAgent;
	const total = result?.metaCounter?.[0]?.total ?? 0;
	const lastPage = Math.max(1, Math.ceil(total / AGENT_BOOKINGS_PAGE_SIZE));
	// A status change or concurrent deletion can empty the last page.
	// Adjust only after an authoritative response; never render an invented page count.
	if (!query.loading && !query.error && result && page > lastPage) setPage(lastPage);
	const filtered = Boolean(status || text);
	function clearFilters() {
		setStatus('');
		setSearchDraft('');
		setText('');
		setPage(1);
	}
	async function saveStatus() {
		if (!selected || saving.current || query.loading || query.error) return;
		const user = currentUserVar();
		if (user?._id !== memberId || user.memberType !== MemberType.AGENT) return;
		const current = result?.list.find((booking) => booking._id === selected.booking._id);
		if (
			!current ||
			current.bookingStatus !== selected.booking.bookingStatus ||
			!agentBookingTransitions[current.bookingStatus].includes(selected.target)
		) {
			setSelected(null);
			setNotice({ severity: 'warning', message: 'This booking changed. Refresh the list before updating its status.' });
			return;
		}
		saving.current = true;
		setBusy(true);
		let confirmed = false;
		try {
			const response = await updateStatus({
				variables: { input: { bookingId: current._id, bookingStatus: selected.target } },
			});
			confirmed =
				response.data?.updateBookingStatus._id === current._id &&
				response.data.updateBookingStatus.bookingStatus === selected.target;
		} catch {
			// A notification failure can occur after the backend saves the status. Always reload; never auto-retry.
		}
		try {
			await query.refetch();
			setNotice(
				confirmed
					? { severity: 'success', message: 'Booking status updated.' }
					: {
							severity: 'warning',
							message:
								'The update could not be confirmed. The list has been refreshed; check the current status before trying again.',
						},
			);
		} catch {
			setNotice({
				severity: 'error',
				message: confirmed
					? 'Status updated, but the list could not be refreshed. Retry loading bookings.'
					: 'The update could not be confirmed. Retry loading bookings before making another change.',
			});
		} finally {
			setSelected(null);
			setBusy(false);
			saving.current = false;
		}
	}
	return (
		<div className="my-bookings-page agent-dashboard-page agent-bookings-page">
			<Breadcrumbs separator="/" className="my-bookings-breadcrumb" aria-label="Breadcrumb">
				<Link href="/">Home</Link>
				<Link href="/mypage">My Profile</Link>
				<span aria-current="page">Business Bookings</span>
			</Breadcrumbs>
			<div className="my-bookings-layout">
				<ProfileSidebar active="Bookings" />
				<section className="my-bookings-main" aria-labelledby="agent-bookings-title">
					<header className="my-bookings-header">
						<div>
							<Typography component="h1" id="agent-bookings-title">
								Bookings
							</Typography>
							<Typography color="text.secondary">Manage bookings for your travel packages.</Typography>
						</div>
						{!query.loading && !query.error && result && (
							<span className="my-bookings-count" role="status">
								{total} {filtered ? 'matching bookings' : 'bookings'}
							</span>
						)}
					</header>
					<div className="my-bookings-controls">
						<TextField
							select
							label="Booking status"
							size="small"
							value={status || 'ALL'}
							disabled={busy}
							onChange={(event) => {
								setStatus(event.target.value === 'ALL' ? '' : (event.target.value as BookingStatus));
								setPage(1);
							}}
						>
							<MenuItem value="ALL">All statuses</MenuItem>
							{Object.values(BookingStatus).map((value) => (
								<MenuItem key={value} value={value}>
									{value}
								</MenuItem>
							))}
						</TextField>
						<form
							className="agent-bookings-search"
							onSubmit={(event) => {
								event.preventDefault();
								if (busy) return;
								setText(searchDraft.trim());
								setPage(1);
							}}
						>
							<TextField
								label="Search bookings"
								helperText="Booking reference, contact name, phone or email"
								size="small"
								value={searchDraft}
								disabled={busy}
								onChange={(event) => setSearchDraft(event.target.value)}
							/>
							<Button type="submit" variant="outlined" disabled={busy}>
								Search
							</Button>
						</form>
						<TextField
							select
							label="Sort by"
							size="small"
							value={direction}
							disabled={busy}
							onChange={(event) => {
								setDirection(event.target.value === 'ASC' ? 'ASC' : 'DESC');
								setPage(1);
							}}
						>
							<MenuItem value="DESC">Newest</MenuItem>
							<MenuItem value="ASC">Oldest</MenuItem>
						</TextField>
						{filtered && (
							<Button onClick={clearFilters} disabled={busy}>
								Clear filters
							</Button>
						)}
					</div>
					<div aria-busy={query.loading}>
						{query.loading ? (
							<div aria-label="Loading agent bookings">
								{Array.from({ length: 5 }, (_, index) => (
									<Skeleton key={index} height={72} />
								))}
							</div>
						) : query.error ? (
							<Alert
								severity="error"
								action={<Button onClick={() => void query.refetch().catch(() => undefined)}>Retry</Button>}
							>
								Bookings could not be loaded. Please try again.
							</Alert>
						) : !result?.list.length ? (
							<div className="my-bookings-empty">
								<Typography component="h2">
									{filtered ? 'No bookings match your filters.' : 'No bookings for your packages yet.'}
								</Typography>
								{filtered && <Button onClick={clearFilters}>Clear filters</Button>}
							</div>
						) : (
							<TableContainer
								component={Paper}
								className="agent-dashboard-table"
								tabIndex={0}
								role="region"
								aria-label="Agent bookings; scroll horizontally for all columns"
							>
								<Table size="small" aria-label="Bookings for your packages">
									<TableHead>
										<TableRow>
											{['Package', 'Contact', 'Pax', 'Booked On', 'Status', 'Amount', 'Actions'].map((label) => (
												<TableCell key={label}>{label}</TableCell>
											))}
										</TableRow>
									</TableHead>
									<TableBody>
										{result.list.map((booking) => (
											<TableRow key={booking._id}>
												<TableCell>{booking.packageData?.packageTitle ?? 'Package information unavailable'}</TableCell>
												<TableCell>
													<strong>{booking.contactName}</strong>
													<div>{booking.contactPhone}</div>
													{booking.contactEmail && <div>{booking.contactEmail}</div>}
												</TableCell>
												<TableCell>{booking.peopleCount}</TableCell>
												<TableCell className="agent-bookings-nowrap">{formatScheduleDate(booking.createdAt)}</TableCell>
												<TableCell>
													<Chip size="small" label={booking.bookingStatus} variant="outlined" />
												</TableCell>
												<TableCell className="agent-bookings-nowrap">
													{booking.currency}{' '}
													{booking.finalPrice.toLocaleString('en-US', {
														minimumFractionDigits: 2,
														maximumFractionDigits: 2,
													})}
												</TableCell>
												<TableCell>
													<div className="agent-bookings-actions">
														{agentBookingTransitions[booking.bookingStatus].map((target) => (
															<Button
																key={target}
																size="small"
																color={target === BookingStatus.REJECTED ? 'error' : 'primary'}
																disabled={busy}
																onClick={() => setSelected({ booking, target })}
																aria-label={`${actionLabels[target]} booking for ${booking.contactName}`}
															>
																{actionLabels[target]}
															</Button>
														))}
													</div>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</TableContainer>
						)}
					</div>
					{!query.loading && !query.error && total > AGENT_BOOKINGS_PAGE_SIZE && (
						<Pagination
							className="my-bookings-pagination"
							page={page}
							count={Math.ceil(total / AGENT_BOOKINGS_PAGE_SIZE)}
							onChange={(_, value) => setPage(value)}
							disabled={busy}
							color="primary"
						/>
					)}
				</section>
			</div>
			<Dialog
				open={Boolean(selected)}
				onClose={() => {
					if (!busy) setSelected(null);
				}}
				aria-labelledby="agent-booking-status-title"
			>
				<DialogTitle id="agent-booking-status-title">
					{selected ? actionLabels[selected.target] : 'Update'} booking?
				</DialogTitle>
				<DialogContent>
					<DialogContentText>
						{selected?.booking.contactName} —{' '}
						{selected?.booking.packageData?.packageTitle ?? 'Package information unavailable'}. Change status from{' '}
						{selected?.booking.bookingStatus} to {selected?.target}?
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button disabled={busy} onClick={() => setSelected(null)}>
						Keep current status
					</Button>
					<Button
						variant="contained"
						disabled={busy || query.loading || Boolean(query.error)}
						onClick={() => void saveStatus()}
					>
						{busy ? 'Updating…' : 'Update status'}
					</Button>
				</DialogActions>
			</Dialog>
			<Snackbar open={Boolean(notice)} autoHideDuration={8000} onClose={() => setNotice(null)}>
				{notice ? (
					<Alert severity={notice.severity} onClose={() => setNotice(null)}>
						{notice.message}
					</Alert>
				) : undefined}
			</Snackbar>
		</div>
	);
}
