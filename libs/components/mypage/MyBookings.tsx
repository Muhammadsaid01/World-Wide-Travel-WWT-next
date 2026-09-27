import ProfileSidebar from './ProfileSidebar';
import { currentUserVar } from '@/apollo/store';
import { GET_MY_BOOKINGS, type MyBookingsInput, type PaymentBooking } from '@/apollo/user/query';
import PackageImage from '@/libs/components/package/PackageImage';
import { formatScheduleDate } from '@/libs/components/package/PackageSchedules';
import { BookingStatus } from '@/libs/enums/booking.enum';
import { MemberType } from '@/libs/enums/member.enum';
import { useQuery, useReactiveVar } from '@apollo/client';
import ArrowForward from '@mui/icons-material/ArrowForward';
import CalendarTodayOutlined from '@mui/icons-material/CalendarTodayOutlined';
import LocationOnOutlined from '@mui/icons-material/LocationOnOutlined';
import PeopleAltOutlined from '@mui/icons-material/PeopleAltOutlined';
import Search from '@mui/icons-material/Search';
import {
	Alert,
	Breadcrumbs,
	Button,
	InputAdornment,
	MenuItem,
	Pagination,
	Skeleton,
	TextField,
	Typography,
} from '@mui/material';
import Link from 'next/link';
import { useState } from 'react';

const PAGE_SIZE = 6;
function BookingCard({ booking }: { booking: PaymentBooking }) {
	const destination = [booking.packageData?.destinationCity, booking.packageData?.destinationCountry]
		.filter(Boolean)
		.join(', ');
	return (
		<article className="my-booking-card">
			<div className="my-booking-image">
				<PackageImage
					path={booking.packageData?.packageImages[0]}
					alt={booking.packageData?.packageTitle ?? 'Travel package'}
				/>
				<span className={`my-booking-status status-${booking.bookingStatus.toLowerCase()}`}>
					{booking.bookingStatus}
				</span>
			</div>
			<div className="my-booking-content">
				<div className="my-booking-meta">
					<span>REF: {booking.bookingCode}</span>
					{booking.scheduleData && (
						<span>
							<CalendarTodayOutlined />
							{formatScheduleDate(booking.scheduleData.startDate)} – {formatScheduleDate(booking.scheduleData.endDate)}
						</span>
					)}
				</div>
				<Typography component="h2">{booking.packageData?.packageTitle ?? 'Package information unavailable'}</Typography>
				<div className="my-booking-info">
					{destination && (
						<span className="my-booking-location">
							<LocationOnOutlined />
							{destination}
						</span>
					)}
					<span>
						<PeopleAltOutlined />
						{booking.peopleCount} {booking.peopleCount === 1 ? 'Traveler' : 'Travelers'}
					</span>
				</div>
				<div className="my-booking-bottom">
					<div>
						<Typography className="my-booking-total-label">Total</Typography>
						<Typography className="my-booking-amount">
							{booking.currency}{' '}
							{booking.finalPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
						</Typography>
					</div>

					<Button
						component={Link}
						href={`/mypage/my-bookings/${booking._id}`}
						variant="outlined"
						endIcon={<ArrowForward />}
					>
						View Booking
					</Button>
				</div>
			</div>
		</article>
	);
}
function BookingSkeleton() {
	return (
		<div className="my-booking-card" aria-hidden="true">
			<Skeleton variant="rectangular" className="my-booking-image" />
			<div className="my-booking-content">
				<Skeleton width="70%" />
				<Skeleton height={48} />
				<Skeleton width="60%" />
				<div className="my-booking-bottom">
					<Skeleton width={130} height={50} />
					<Skeleton width={140} height={44} />
				</div>
			</div>
		</div>
	);
}

export default function MyBookings() {
	const user = useReactiveVar(currentUserVar);
	// Remount on account changes so previous users' results and filters are never shown.
	return (
		<MyBookingsContent
			key={user?._id ?? 'guest'}
			authenticated={Boolean(user)}
			allowed={user?.memberType === MemberType.USER}
		/>
	);
}
function MyBookingsContent({ authenticated, allowed }: { authenticated: boolean; allowed: boolean }) {
	const [page, setPage] = useState(1);
	const [status, setStatus] = useState<BookingStatus | undefined>();
	const [searchDraft, setSearchDraft] = useState('');
	const [text, setText] = useState('');
	const [direction, setDirection] = useState<'DESC' | 'ASC'>('DESC');
	const input: MyBookingsInput = {
		page,
		limit: PAGE_SIZE,
		sort: 'createdAt',
		direction,
		search: { bookingStatus: status, text: text || undefined },
	};
	const { data, loading, error, refetch } = useQuery(GET_MY_BOOKINGS, {
		variables: { input },
		skip: !allowed,
		fetchPolicy: 'no-cache',
		notifyOnNetworkStatusChange: true,
	});
	const result = data?.getMyBookings;
	const total = result?.metaCounter?.[0]?.total ?? 0;
	const filtered = Boolean(status || text);
	return (
		<div className="my-bookings-page">
			<Breadcrumbs separator="/" className="my-bookings-breadcrumb" aria-label="Breadcrumb">
				<Link href="/">Home</Link>
				<span>My Profile</span>
				<span aria-current="page">My Bookings</span>
			</Breadcrumbs>
			<div className="my-bookings-layout">
				<ProfileSidebar />
				<main className="my-bookings-main">
					<header className="my-bookings-header">
						<div>
							<Typography component="h1">My Bookings</Typography>
							<Typography color="text.secondary">
								View and manage your past, present, and future travel itineraries.
							</Typography>
						</div>
						{allowed && !loading && !error && result && (
							<span className="my-bookings-count">
								{total} {filtered ? 'matching bookings' : 'bookings total'}
							</span>
						)}
					</header>
					{!authenticated ? (
						<Alert
							severity="info"
							action={
								<Button component={Link} href="/account/login">
									Login
								</Button>
							}
						>
							Log in to view your bookings.
						</Alert>
					) : !allowed ? (
						<Alert severity="info">My Bookings is available to user accounts.</Alert>
					) : (
						<>
							<div className="my-bookings-controls">
								<div className="my-bookings-tabs" role="group" aria-label="Filter bookings">
									{[
										{ label: 'All', value: undefined },
										{ label: 'Upcoming', value: undefined, disabled: true },
										{ label: 'Completed', value: BookingStatus.COMPLETED },
										{ label: 'Cancelled', value: BookingStatus.CANCELLED },
									].map((tab) => (
										<Button
											key={tab.label}
											disabled={tab.disabled}
											title={tab.disabled ? 'Upcoming date filtering is not supported yet.' : undefined}
											aria-pressed={!tab.disabled && status === tab.value}
											className={!tab.disabled && status === tab.value ? 'is-active' : ''}
											onClick={() => {
												setStatus(tab.value);
												setPage(1);
											}}
										>
											{tab.label}
										</Button>
									))}
								</div>
								<form
									className="my-bookings-search"
									onSubmit={(event) => {
										event.preventDefault();
										setText(searchDraft.trim());
										setPage(1);
									}}
								>
									<TextField
										size="small"
										placeholder="Search bookings..."
										value={searchDraft}
										onChange={(event) => setSearchDraft(event.target.value)}
										slotProps={{
											htmlInput: { 'aria-label': 'Search booking reference or contact details; press Enter' },
											input: {
												startAdornment: (
													<InputAdornment position="start">
														<Search />
													</InputAdornment>
												),
											},
										}}
									/>
								</form>
								<TextField
									select
									size="small"
									className="my-bookings-sort"
									value={direction}
									onChange={(event) => {
										setDirection(event.target.value === 'ASC' ? 'ASC' : 'DESC');
										setPage(1);
									}}
									slotProps={{ htmlInput: { 'aria-label': 'Sort bookings' } }}
								>
									<MenuItem value="DESC">Sort: Newest</MenuItem>
									<MenuItem value="ASC">Sort: Oldest</MenuItem>
								</TextField>
							</div>
							<div className="my-bookings-list" aria-busy={loading}>
								{loading ? (
									Array.from({ length: 3 }, (_, index) => <BookingSkeleton key={index} />)
								) : error ? (
									<Alert
										severity="error"
										action={
											<Button
												onClick={() => {
													void refetch().catch(() => undefined);
												}}
											>
												Retry
											</Button>
										}
									>
										Bookings could not be loaded. {error.message}
									</Alert>
								) : !result?.list.length ? (
									<div className="my-bookings-empty">
										<Typography component="h2">
											{filtered ? 'No bookings match your filters.' : "You don't have any bookings yet."}
										</Typography>
										{filtered ? (
											<Button
												onClick={() => {
													setStatus(undefined);
													setText('');
													setSearchDraft('');
													setPage(1);
												}}
											>
												Clear filters
											</Button>
										) : (
											<Button component={Link} href="/package" variant="contained">
												Browse Packages
											</Button>
										)}
									</div>
								) : (
									result.list.map((booking) => <BookingCard key={booking._id} booking={booking} />)
								)}
							</div>
							{!loading && !error && total > PAGE_SIZE && (
								<Pagination
									className="my-bookings-pagination"
									count={Math.ceil(total / PAGE_SIZE)}
									page={page}
									onChange={(_, value) => setPage(value)}
									color="primary"
								/>
							)}
						</>
					)}
				</main>
			</div>
		</div>
	);
}
