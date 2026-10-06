import { type ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@apollo/client';
import SearchOutlined from '@mui/icons-material/SearchOutlined';
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
import {
	GET_ADMIN_BOOKINGS,
	type AdminBookingRow,
	type AdminBookingsInput,
} from '@/apollo/admin/query';
import { BookingStatus } from '@/libs/enums/booking.enum';
import { formatScheduleDate } from '../package/PackageSchedules';

const PAGE_SIZE = 10;
const SEARCH_DELAY = 300;

const statusOptions: Array<{ value: BookingStatus | 'ALL'; label: string }> = [
	{ value: 'ALL', label: 'All statuses' },
	{ value: BookingStatus.PENDING, label: 'Pending' },
	{ value: BookingStatus.CONFIRMED, label: 'Confirmed' },
	{ value: BookingStatus.CANCELLED, label: 'Cancelled' },
	{ value: BookingStatus.COMPLETED, label: 'Completed' },
	{ value: BookingStatus.REJECTED, label: 'Rejected' },
];

function enumLabel(value: string) {
	return value
		.toLowerCase()
		.split('_')
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(' ');
}

function formatMoney(value: number, currency: string) {
	try {
		return new Intl.NumberFormat(undefined, {
			style: 'currency',
			currency: currency.toUpperCase(),
			maximumFractionDigits: 2,
		}).format(value);
	} catch {
		return `${value.toLocaleString()} ${currency}`;
	}
}

function scheduleLabel(booking: AdminBookingRow) {
	if (!booking.scheduleData) return 'Schedule unavailable';
	return `${formatScheduleDate(booking.scheduleData.startDate)} – ${formatScheduleDate(
		booking.scheduleData.endDate,
	)}`;
}

function BookingRow({ booking, onView }: { booking: AdminBookingRow; onView: () => void }) {
	const destination = booking.packageData
		? [booking.packageData.destinationCity, booking.packageData.destinationCountry].filter(Boolean).join(', ')
		: '';
	const contact = booking.contactEmail?.trim() || booking.contactPhone;

	return (
		<article className="admin-booking-row">
			<div className="admin-booking-identity" data-label="Booking">
				<strong>{booking.bookingCode}</strong>
				<span>{booking._id}</span>
			</div>

			<div className="admin-booking-package" data-label="Package & agency">
				<strong>{booking.packageData?.packageTitle || 'Package unavailable'}</strong>
				<span>{destination || 'Destination unavailable'}</span>
				<span>{booking.agentData?.companyName || 'Agency unavailable'}</span>
			</div>

			<div className="admin-booking-cell" data-label="Contact">
				<strong>{booking.contactName}</strong>
				<span>{contact}</span>
			</div>

			<div className="admin-booking-cell" data-label="Status">
				<Chip
					label={enumLabel(booking.bookingStatus)}
					className={`admin-booking-status is-${booking.bookingStatus.toLowerCase()}`}
					size="small"
				/>
			</div>

			<div className="admin-booking-cell" data-label="Travel">
				<strong>{scheduleLabel(booking)}</strong>
				<span>
					{booking.peopleCount} traveler{booking.peopleCount === 1 ? '' : 's'}
				</span>
			</div>

			<div className="admin-booking-cell" data-label="Amount">
				<strong>{formatMoney(booking.finalPrice, booking.currency)}</strong>
				{booking.discountAmount > 0 ? (
					<span>{formatMoney(booking.discountAmount, booking.currency)} discount</span>
				) : null}
			</div>

			<div className="admin-booking-cell" data-label="Booked">
				<strong>{formatScheduleDate(booking.createdAt)}</strong>
				<span>Updated {formatScheduleDate(booking.updatedAt)}</span>
			</div>

			<div className="admin-booking-action" data-label="Action">
				<Button variant="outlined" size="small" onClick={onView}>
					View details
				</Button>
			</div>
		</article>
	);
}

function BookingDetails({ booking }: { booking: AdminBookingRow }) {
	const packageName = booking.packageData?.packageTitle || 'Package unavailable';
	const agencyName = booking.agentData?.companyName || 'Agency unavailable';

	return (
		<div className="admin-booking-detail-grid">
			<div>
				<span>Status</span>
				<strong>{enumLabel(booking.bookingStatus)}</strong>
			</div>
			<div>
				<span>Booking ID</span>
				<strong>{booking._id}</strong>
			</div>
			<div>
				<span>Package</span>
				<strong>{packageName}</strong>
			</div>
			<div>
				<span>Agency</span>
				<strong>{agencyName}</strong>
			</div>
			<div>
				<span>Travel dates</span>
				<strong>{scheduleLabel(booking)}</strong>
			</div>
			<div>
				<span>Travelers</span>
				<strong>
					{booking.peopleCount} total · {booking.adultCount} adult · {booking.childCount} child ·{' '}
					{booking.infantCount} infant
				</strong>
			</div>
			<div>
				<span>Contact</span>
				<strong>{booking.contactName}</strong>
				<p>{booking.contactPhone}</p>
				{booking.contactEmail ? <p>{booking.contactEmail}</p> : null}
			</div>
			<div>
				<span>Pricing</span>
				<strong>{formatMoney(booking.finalPrice, booking.currency)} final</strong>
				<p>{formatMoney(booking.totalPrice, booking.currency)} total</p>
				{booking.discountAmount > 0 ? (
					<p>{formatMoney(booking.discountAmount, booking.currency)} discount</p>
				) : null}
			</div>
			<div>
				<span>Created</span>
				<strong>{formatScheduleDate(booking.createdAt)}</strong>
				<p>Updated {formatScheduleDate(booking.updatedAt)}</p>
			</div>
			{booking.cancelledAt ? (
				<div>
					<span>Cancelled</span>
					<strong>{formatScheduleDate(booking.cancelledAt)}</strong>
				</div>
			) : null}
			{booking.specialRequest?.trim() ? (
				<div className="admin-booking-detail-wide">
					<span>Special request</span>
					<p>{booking.specialRequest}</p>
				</div>
			) : null}
		</div>
	);
}

function BookingSkeleton() {
	return (
		<div className="admin-members-skeleton" aria-label="Loading bookings">
			{Array.from({ length: 5 }, (_, index) => (
				<Skeleton key={index} variant="rounded" height={90} />
			))}
		</div>
	);
}

export default function AdminBookings() {
	const resultsRef = useRef<HTMLDivElement>(null);
	const [page, setPage] = useState(1);
	const [searchDraft, setSearchDraft] = useState('');
	const [search, setSearch] = useState('');
	const [bookingStatus, setBookingStatus] = useState<BookingStatus | 'ALL'>('ALL');
	const [sort, setSort] = useState<'newest' | 'oldest'>('newest');
	const [selectedBooking, setSelectedBooking] = useState<AdminBookingRow | null>(null);

	useEffect(() => {
		const timer = setTimeout(() => {
			setSearch(searchDraft.trim());
			setPage(1);
		}, SEARCH_DELAY);
		return () => clearTimeout(timer);
	}, [searchDraft]);

	const variables = useMemo<{ input: AdminBookingsInput }>(
		() => ({
			input: {
				page,
				limit: PAGE_SIZE,
				sort: 'createdAt',
				direction: sort === 'newest' ? 'DESC' : 'ASC',
				search: {
					text: search || undefined,
					bookingStatus: bookingStatus === 'ALL' ? undefined : bookingStatus,
				},
			},
		}),
		[bookingStatus, page, search, sort],
	);

	const { data, loading, error, refetch } = useQuery(GET_ADMIN_BOOKINGS, {
		variables,
		fetchPolicy: 'no-cache',
		notifyOnNetworkStatusChange: true,
	});

	const bookings = data?.getAllBookingsByAdmin.list ?? [];
	const total = data?.getAllBookingsByAdmin.metaCounter?.[0]?.total ?? 0;
	const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
	const filtered = Boolean(search || bookingStatus !== 'ALL');

	function changePage(_: ChangeEvent<unknown>, nextPage: number) {
		setPage(nextPage);
		resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}

	function clearFilters() {
		setSearchDraft('');
		setSearch('');
		setBookingStatus('ALL');
		setSort('newest');
		setPage(1);
	}

	return (
		<div className="admin-bookings-page">
			<header className="admin-page-header">
				<div>
					<Typography className="admin-page-kicker">Booking management</Typography>
					<Typography component="h1">Bookings</Typography>
					<Typography>Review booking contacts, trips, agencies, statuses, and confirmed amounts.</Typography>
				</div>
				<span className={`admin-total-count${error ? ' is-unavailable' : ''}`}>
					{error ? 'Total unavailable' : loading && !data ? 'Loading total' : `${total} total`}
				</span>
			</header>

			<div className="admin-bookings-toolbar">
				<TextField
					label="Search bookings"
					placeholder="Booking code, contact name, phone, or email"
					value={searchDraft}
					onChange={(event) => setSearchDraft(event.target.value)}
					size="small"
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
					label="Booking status"
					value={bookingStatus}
					onChange={(event) => {
						setBookingStatus(event.target.value as BookingStatus | 'ALL');
						setPage(1);
					}}
					size="small"
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
					size="small"
				>
					<MenuItem value="newest">Newest</MenuItem>
					<MenuItem value="oldest">Oldest</MenuItem>
				</TextField>
			</div>

			<div ref={resultsRef} className="admin-members-results">
				{loading && !data ? (
					<BookingSkeleton />
				) : error ? (
					<Alert
						severity="error"
						action={
							<Button color="inherit" size="small" onClick={() => void refetch()}>
								Retry
							</Button>
						}
					>
						Bookings could not be loaded. Your search and filters have been preserved.
					</Alert>
				) : bookings.length === 0 ? (
					<Paper className="admin-members-empty" elevation={0}>
						<Typography component="h2">{filtered ? 'No matching bookings' : 'No bookings yet'}</Typography>
						<Typography>
							{filtered
								? 'Try another search or clear the current filters.'
								: 'Bookings will appear here when travelers reserve packages.'}
						</Typography>
						{filtered ? (
							<Button variant="outlined" onClick={clearFilters}>
								Clear Filters
							</Button>
						) : null}
					</Paper>
				) : (
					<Paper className="admin-members-table admin-bookings-table" elevation={0}>
						<div className="admin-bookings-table-header" aria-hidden="true">
							<span>Booking</span>
							<span>Package & agency</span>
							<span>Contact</span>
							<span>Status</span>
							<span>Travel</span>
							<span>Amount</span>
							<span>Booked</span>
							<span>Action</span>
						</div>
						<div className="admin-members-list">
							{bookings.map((booking) => (
								<BookingRow key={booking._id} booking={booking} onView={() => setSelectedBooking(booking)} />
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
				open={Boolean(selectedBooking)}
				onClose={() => setSelectedBooking(null)}
				fullWidth
				maxWidth="md"
				className="admin-booking-detail-dialog"
			>
				<DialogTitle>{selectedBooking ? `Booking ${selectedBooking.bookingCode}` : 'Booking details'}</DialogTitle>
				<DialogContent>{selectedBooking ? <BookingDetails booking={selectedBooking} /> : null}</DialogContent>
				<DialogActions>
					<Button onClick={() => setSelectedBooking(null)}>Close</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
}
