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
import ProfileSidebar from './ProfileSidebar';
import { useTranslation } from 'react-i18next';

const PAGE_SIZE = 6;
function BookingCard({ booking }: { booking: PaymentBooking }) {
	const { t, i18n } = useTranslation(['profile', 'common']);
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
				<Typography component="h2">{booking.packageData?.packageTitle ?? t('overview.packageUnavailable')}</Typography>
				<div className="my-booking-info">
					{destination && (
						<span className="my-booking-location">
							<LocationOnOutlined />
							{destination}
						</span>
					)}
					<span>
						<PeopleAltOutlined />
						{t('bookings.travelers', { count: booking.peopleCount })}
					</span>
				</div>
				<div className="my-booking-bottom">
					<div>
						<Typography className="my-booking-total-label">{t('bookings.total')}</Typography>
						<Typography className="my-booking-amount">
							{booking.currency}{' '}
							{booking.finalPrice.toLocaleString(i18n.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
						</Typography>
					</div>

					<Button
						component={Link}
						href={`/mypage/my-bookings/${booking._id}`}
						variant="outlined"
						endIcon={<ArrowForward />}
					>
						{t('bookings.view')}
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
			allowed={
				user?.memberType === MemberType.USER ||
				user?.memberType === MemberType.AGENT ||
				user?.memberType === MemberType.ADMIN
			}
		/>
	);
}
function MyBookingsContent({ authenticated, allowed }: { authenticated: boolean; allowed: boolean }) {
	const { t } = useTranslation(['profile', 'common']);
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
			<Breadcrumbs separator="/" className="my-bookings-breadcrumb" aria-label={t('bookings.title')}>
				<Link href="/">{t('navigation.home', { ns: 'common' })}</Link>
				<span>{t('navigation.profile', { ns: 'common' })}</span>
				<span aria-current="page">{t('bookings.title')}</span>
			</Breadcrumbs>
			<div className="my-bookings-layout">
				<ProfileSidebar />
				<main className="my-bookings-main">
					<header className="my-bookings-header">
						<div>
							<Typography component="h1">{t('bookings.title')}</Typography>
							<Typography color="text.secondary">
								{t('bookings.description')}
							</Typography>
						</div>
						{allowed && !loading && !error && result && (
							<span className="my-bookings-count">
								{t(filtered ? 'bookings.matchingCount' : 'bookings.count', { count: total })}
							</span>
						)}
					</header>
					{!authenticated ? (
						<Alert
							severity="info"
							action={
								<Button component={Link} href="/account/login">
									{t('account.login', { ns: 'common' })}
								</Button>
							}
						>
							{t('bookings.login')}
						</Alert>
					) : !allowed ? (
					<Alert severity="info">{t('bookings.unavailable')}</Alert>
					) : (
						<>
							<div className="my-bookings-controls">
								<div className="my-bookings-tabs" role="group" aria-label="Filter bookings">
									{[
										{ label: t('bookings.all'), value: undefined },
										{ label: t('bookings.upcoming'), value: undefined, disabled: true },
										{ label: t('bookings.completed'), value: BookingStatus.COMPLETED },
										{ label: t('bookings.cancelled'), value: BookingStatus.CANCELLED },
									].map((tab) => (
										<Button
											key={tab.label}
											disabled={tab.disabled}
											title={tab.disabled ? t('bookings.upcomingUnsupported') : undefined}
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
										placeholder={t('bookings.search')}
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
											<MenuItem value="DESC">{t('sort.newest', { ns: 'common' })}</MenuItem>
											<MenuItem value="ASC">{t('sort.oldest', { ns: 'common' })}</MenuItem>
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
												{t('actions.retry', { ns: 'common' })}
											</Button>
										}
									>
										{t('bookings.error')} {error.message}
									</Alert>
								) : !result?.list.length ? (
									<div className="my-bookings-empty">
										<Typography component="h2">
											{t(filtered ? 'bookings.emptyFiltered' : 'bookings.empty')}
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
												{t('actions.clearAll', { ns: 'common' })}
											</Button>
										) : (
											<Button component={Link} href="/package" variant="contained">
												{t('overview.browsePackages')}
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
