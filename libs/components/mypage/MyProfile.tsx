import { currentUserVar } from '@/apollo/store';
import {
	GET_CONNECTION_COUNTS,
	GET_MY_BOOKINGS,
	GET_MY_INCOMING_TRAVEL_MATE_JOIN_REQUESTS,
	GET_MY_PROFILE,
	GET_PROFILE_ARTICLES,
	type PaymentBooking,
} from '@/apollo/user/query';
import { BookingStatus } from '@/libs/enums/booking.enum';
import { TravelMateJoinStatus } from '@/libs/enums/community.enum';
import { MemberType } from '@/libs/enums/member.enum';
import { useApolloClient, useQuery, useReactiveVar } from '@apollo/client';
import AddOutlined from '@mui/icons-material/AddOutlined';
import ArrowForward from '@mui/icons-material/ArrowForward';
import ArticleOutlined from '@mui/icons-material/ArticleOutlined';
import CalendarMonthOutlined from '@mui/icons-material/CalendarMonthOutlined';
import CameraAltOutlined from '@mui/icons-material/CameraAltOutlined';
import ChatBubbleOutline from '@mui/icons-material/ChatBubbleOutlined';
import EditOutlined from '@mui/icons-material/EditOutlined';
import ExploreOutlined from '@mui/icons-material/ExploreOutlined';
import FavoriteBorder from '@mui/icons-material/FavoriteBorder';
import GroupsOutlined from '@mui/icons-material/GroupsOutlined';
import LocationOnOutlined from '@mui/icons-material/LocationOnOutlined';
import LuggageOutlined from '@mui/icons-material/LuggageOutlined';
import MenuBookOutlined from '@mui/icons-material/MenuBookOutlined';
import PersonAddAlt1Outlined from '@mui/icons-material/PersonAddAlt1Outlined';
import TravelExploreOutlined from '@mui/icons-material/TravelExploreOutlined';
import VisibilityOutlined from '@mui/icons-material/VisibilityOutlined';
import { Alert, Avatar, Button, Chip, IconButton, Paper, Skeleton, Typography } from '@mui/material';
import Link from 'next/link';
import { useEffect, useState, type ReactNode } from 'react';
import PackageImage, { packageImageUrl } from '../package/PackageImage';
import { formatScheduleDate } from '../package/PackageSchedules';
import AgentOverview from './AgentOverview';
import ProfileSidebar from './ProfileSidebar';
import { useTranslation } from 'react-i18next';

type OverviewBookings = {
	loading: boolean;
	error?: string;
	trip?: PaymentBooking;
	total?: number;
};

function useOverviewBookings(skip: boolean) {
	const client = useApolloClient();
	const [retry, setRetry] = useState(0);
	const [state, setState] = useState<OverviewBookings>({ loading: true });

	useEffect(() => {
		if (skip) return;

		let cancelled = false;
		async function load() {
			setState({ loading: true });
			try {
				let page = 1;
				let scanned = 0;
				let total = 0;
				let nearest: PaymentBooking | undefined;
				const today = new Date();
				today.setHours(0, 0, 0, 0);

				do {
					const response = await client.query({
						query: GET_MY_BOOKINGS,
						variables: { input: { page, limit: 50, sort: 'createdAt', direction: 'DESC' } },
						fetchPolicy: 'no-cache',
					});
					if (cancelled) return;

					const result = response.data.getMyBookings;
					total = result.metaCounter?.[0]?.total ?? 0;
					for (const booking of result.list) {
						const start = booking.scheduleData ? new Date(booking.scheduleData.startDate).getTime() : NaN;
						const nearestStart = nearest?.scheduleData
							? new Date(nearest.scheduleData.startDate).getTime()
							: Number.POSITIVE_INFINITY;
						if (
							[BookingStatus.PENDING, BookingStatus.CONFIRMED].includes(booking.bookingStatus) &&
							Number.isFinite(start) &&
							start >= today.getTime() &&
							start < nearestStart
						)
							nearest = booking;
					}
					scanned += result.list.length;
					if (!result.list.length) break;
					page += 1;
				} while (scanned < total);

				if (!cancelled) setState({ loading: false, trip: nearest, total });
			} catch {
				if (!cancelled) setState({ loading: false, error: 'Booking information could not be loaded.' });
			}
		}

		void load();
		return () => {
			cancelled = true;
		};
	}, [client, retry, skip]);

	return { ...state, retry: () => setRetry((value) => value + 1) };
}

function initials(name?: string) {
	if (!name?.trim()) return '?';
	return name
		.trim()
		.split(/\s+/)
		.slice(0, 2)
		.map((part) => part[0])
		.join('')
		.toUpperCase();
}

function DashboardMetric({
	label,
	value,
	loading,
	unavailable,
	href,
	linkLabel,
	tone,
	icon,
}: {
	label: string;
	value?: number;
	loading: boolean;
	unavailable: boolean;
	href: string;
	linkLabel: string;
	tone: 'blue' | 'orange' | 'green' | 'purple';
	icon: ReactNode;
}) {
	const { t, i18n } = useTranslation('profile');
	return (
		<Paper component="article" className={`profile-metric profile-metric-${tone}`} variant="outlined">
			<div className="profile-metric-icon" aria-hidden="true">
				{icon}
			</div>
			<div className="profile-metric-copy">
				<Typography component="h3">{label}</Typography>
				{loading ? (
					<Skeleton width={54} height={42} aria-label={`Loading ${label.toLowerCase()}`} />
				) : (
					<strong aria-label={unavailable ? `${label}: ${t('overview.unavailable')}` : undefined}>
						{unavailable || typeof value !== 'number' ? '—' : value.toLocaleString(i18n.language)}
					</strong>
				)}
				<Link href={href} className="profile-metric-link">
					{linkLabel} <ArrowForward aria-hidden="true" />
				</Link>
			</div>
		</Paper>
	);
}

function RecentActivity({ articles }: { articles: ReturnType<typeof useProfileArticles> }) {
	const { t } = useTranslation(['profile', 'common', 'community']);
	const result = articles.data?.getMyBoardArticles;
	return (
		<Paper component="section" className="profile-dashboard-card profile-recent" aria-labelledby="recent-activity-title">
			<div className="profile-card-header">
				<Typography component="h2" id="recent-activity-title">
					{t('overview.activity')}
				</Typography>
				<Link href="/mypage/articles">{t('actions.viewAll', { ns: 'common' })}</Link>
			</div>

			{articles.loading ? (
				<div className="profile-activity-skeletons" role="status" aria-label={t('states.loading', { ns: 'common' })}>
					{[0, 1, 2].map((item) => (
						<div key={item} className="profile-recent-row">
							<Skeleton variant="rounded" className="profile-recent-image" />
							<div>
								<Skeleton width="65%" height={28} />
								<Skeleton />
								<Skeleton width="50%" />
							</div>
						</div>
					))}
				</div>
			) : articles.error ? (
				<Alert
					severity="error"
					action={
						<Button onClick={() => void articles.refetch().catch(() => undefined)} color="inherit">
							{t('actions.retry', { ns: 'common' })}
						</Button>
					}
				>
					Recent articles could not be loaded.
				</Alert>
			) : !result?.list.length ? (
				<div className="profile-card-empty">
					<MenuBookOutlined aria-hidden="true" />
					<Typography component="h3">{t('overview.noArticles')}</Typography>
					<Button component={Link} href="/community/stories/create" endIcon={<ArrowForward />}>
						{t('overview.createStory')}
					</Button>
				</div>
			) : (
				<div className="profile-recent-list">
					{result.list.map((article) => {
						const excerpt = article.articleContent.replace(/\s+/g, ' ').trim();
						return (
							<Link
								key={article._id}
								href={`/community/stories/${article._id}`}
								className="profile-recent-row"
								aria-label={`${t('article.read', { ns: 'community' })}: ${article.articleTitle}`}
							>
								<div className="profile-recent-image">
									<PackageImage path={article.articleImages[0]} alt={article.articleTitle} />
								</div>
								<div className="profile-recent-copy">
									<Typography component="h3">{article.articleTitle}</Typography>
									{excerpt && <Typography className="profile-recent-excerpt">{excerpt}</Typography>}
									<div className="profile-recent-meta">
										<span title="Likes"><FavoriteBorder aria-hidden="true" /> {article.articleLikeCount}</span>
										<span title="Comments"><ChatBubbleOutline aria-hidden="true" /> {article.articleCommentCount}</span>
										<span title="Views"><VisibilityOutlined aria-hidden="true" /> {article.articleViewCount}</span>
										<time dateTime={article.createdAt}>{formatScheduleDate(article.createdAt)}</time>
									</div>
								</div>
							</Link>
						);
					})}
				</div>
			)}
		</Paper>
	);
}

function UpcomingTrips({ bookings }: { bookings: ReturnType<typeof useOverviewBookings> }) {
	const { t } = useTranslation(['profile', 'common']);
	const trip = bookings.trip;
	const destination = [trip?.packageData?.destinationCity, trip?.packageData?.destinationCountry].filter(Boolean).join(', ');

	return (
		<Paper component="section" className="profile-dashboard-card profile-upcoming" aria-labelledby="upcoming-trips-title">
			<div className="profile-card-header">
				<Typography component="h2" id="upcoming-trips-title">{t('overview.trips')}</Typography>
				<Link href="/mypage/my-bookings">{t('actions.viewAll', { ns: 'common' })}</Link>
			</div>

			{bookings.loading ? (
				<Skeleton variant="rounded" height={230} aria-label={t('states.loading', { ns: 'common' })} />
			) : bookings.error ? (
				<Alert severity="error" action={<Button onClick={bookings.retry}>{t('actions.retry', { ns: 'common' })}</Button>}>{bookings.error}</Alert>
			) : trip ? (
				<article className="profile-trip-card">
					<div className="profile-trip-image">
						<PackageImage path={trip.packageData?.packageImages[0]} alt={trip.packageData?.packageTitle ?? 'Upcoming travel package'} />
						<Chip label={trip.bookingStatus} size="small" />
					</div>
					<div className="profile-trip-copy">
						<Typography component="h3">{trip.packageData?.packageTitle ?? t('overview.packageUnavailable')}</Typography>
						{destination && <Typography className="profile-trip-detail"><LocationOnOutlined aria-hidden="true" /> {destination}</Typography>}
						{trip.scheduleData && (
							<Typography className="profile-trip-detail">
								<CalendarMonthOutlined aria-hidden="true" /> {formatScheduleDate(trip.scheduleData.startDate)} – {formatScheduleDate(trip.scheduleData.endDate)}
							</Typography>
						)}
						<Button component={Link} href={`/mypage/my-bookings/${trip._id}`} endIcon={<ArrowForward />}>{t('actions.viewDetails', { ns: 'common' })}</Button>
					</div>
				</article>
			) : (
				<div className="profile-card-empty profile-trip-empty">
					<TravelExploreOutlined aria-hidden="true" />
					<Typography component="h3">{t('overview.noTrips')}</Typography>
					<Typography>{t('overview.noTripsText')}</Typography>
					<Button component={Link} href="/package" endIcon={<ArrowForward />}>{t('overview.browsePackages')}</Button>
				</div>
			)}
		</Paper>
	);
}

const quickActions = [
	{ labelKey: 'overview.createStory', href: '/community/stories/create', icon: <AddOutlined /> },
	{ labelKey: 'overview.findMate', href: '/community/travel-mate', icon: <GroupsOutlined /> },
	{ labelKey: 'overview.browsePackages', href: '/package', icon: <LuggageOutlined /> },
	{ labelKey: 'overview.exploreCommunity', href: '/community', icon: <ExploreOutlined /> },
];

function QuickActions() {
	const { t } = useTranslation('profile');
	return (
		<Paper component="section" className="profile-dashboard-card profile-quick-actions" aria-labelledby="quick-actions-title">
			<div className="profile-card-header">
				<Typography component="h2" id="quick-actions-title">{t('overview.quickActions')}</Typography>
			</div>
			<div className="profile-action-grid">
				{quickActions.map((action, index) => (
					<Link key={action.labelKey} href={action.href} className={index === 0 ? 'is-primary' : undefined}>
						{action.icon}<span>{t(action.labelKey)}</span>
					</Link>
				))}
			</div>
		</Paper>
	);
}

function useProfileArticles(skip: boolean) {
	return useQuery(GET_PROFILE_ARTICLES, { skip, fetchPolicy: 'no-cache' });
}

export default function MyProfile() {
	const user = useReactiveVar(currentUserVar);
	if (user?.memberType === MemberType.AGENT) return <AgentOverview key={user._id} memberId={user._id} />;
	return <ProfileContent key={user?._id ?? 'guest'} authenticated={Boolean(user)} />;
}

function ProfileContent({ authenticated }: { authenticated: boolean }) {
	const { t } = useTranslation(['profile', 'common']);
	const profile = useQuery(GET_MY_PROFILE, { skip: !authenticated, fetchPolicy: 'no-cache' });
	const member = profile.data?.getMyProfile;
	const articles = useProfileArticles(!authenticated || !member);
	const bookings = useOverviewBookings(!authenticated || !member);
	const connectionCounts = useQuery(GET_CONNECTION_COUNTS, {
		variables: {
			followers: { page: 1, limit: 1, search: { followingId: member?._id } },
			following: { page: 1, limit: 1, search: { followerId: member?._id } },
		},
		skip: !authenticated || !member?._id,
		fetchPolicy: 'no-cache',
	});
	const joinRequests = useQuery(GET_MY_INCOMING_TRAVEL_MATE_JOIN_REQUESTS, {
		variables: { input: { page: 1, limit: 1, search: { joinStatus: TravelMateJoinStatus.PENDING } } },
		skip: !authenticated || !member?._id,
		fetchPolicy: 'no-cache',
	});

	const name = member?.memberFullName || member?.memberNick;
	const firstName = name?.trim().split(/\s+/)[0] || member?.memberNick;
	const articleTotal = articles.data?.getMyBoardArticles.metaCounter?.[0]?.total;
	const followerCount = connectionCounts.data?.getMemberFollowers.metaCounter?.[0]?.total ?? undefined;
	const followingCount = connectionCounts.data?.getMemberFollowings.metaCounter?.[0]?.total ?? undefined;
	const pendingJoinRequests = joinRequests.data?.getMyIncomingTravelMateJoinRequests.metaCounter?.[0]?.total;
	const location = [member?.memberCity, member?.memberCountry].filter(Boolean).join(', ');

	return (
		<div className="profile-overview">
			<section className="profile-hero" aria-labelledby="profile-name">
				<div className="profile-hero-inner">
					{profile.loading ? (
						<div className="profile-hero-loading" role="status" aria-label={t('hero.loading')}>
							<Skeleton variant="circular" width={144} height={144} />
							<div><Skeleton width={360} height={50} /><Skeleton width={240} /><Skeleton width={500} height={54} /></div>
						</div>
					) : !authenticated ? (
						<Alert severity="info" action={<Button component={Link} href="/account/login">{t('account.login', { ns: 'common' })}</Button>}>{t('hero.login')}</Alert>
					) : profile.error || !member ? (
						<Alert severity="error" action={<Button onClick={() => void profile.refetch().catch(() => undefined)}>{t('actions.retry', { ns: 'common' })}</Button>}>
							Your profile could not be loaded.
						</Alert>
					) : (
						<>
							<div className="profile-avatar-wrap">
								<Avatar className="profile-avatar" src={packageImageUrl(member.memberImage)} alt={name}>{initials(name)}</Avatar>
								<IconButton component={Link} href="/mypage/edit-profile" className="profile-avatar-edit" aria-label={t('hero.changePhoto')}>
									<CameraAltOutlined />
								</IconButton>
							</div>
							<div className="profile-identity">
								<div className="profile-name">
									<Typography component="h1" id="profile-name">{name}</Typography>
									<Chip className={`role-${member.memberType.toLowerCase()}`} label={member.memberType} size="small" />
								</div>
								<div className="profile-identity-meta">
									<span>@{member.memberNick}</span>
									{location && <span><LocationOnOutlined aria-hidden="true" /> {location}</span>}
								</div>
								{member.memberDesc && <Typography className="profile-bio">{member.memberDesc}</Typography>}
								<div className="profile-stats" aria-label={t('hero.statistics')}>
									<Link href="/mypage/articles"><strong>{articles.loading || articles.error ? '—' : (articleTotal ?? 0)}</strong><span>{t('hero.articles')}</span></Link>
									<Link href="/mypage/followers"><strong>{connectionCounts.loading || connectionCounts.error ? '—' : (followerCount ?? 0)}</strong><span>{t('hero.followers')}</span></Link>
									<Link href="/mypage/following"><strong>{connectionCounts.loading || connectionCounts.error ? '—' : (followingCount ?? 0)}</strong><span>{t('hero.following')}</span></Link>
								</div>
							</div>
							<Button component={Link} href="/mypage/edit-profile" variant="contained" startIcon={<EditOutlined />} className="profile-edit">{t('hero.edit')}</Button>
						</>
					)}
				</div>
			</section>

			<div className="profile-dashboard-shell">
				<div className="profile-dashboard-layout">
					<ProfileSidebar active="Overview" pendingJoinRequests={pendingJoinRequests} />
					<main className="profile-dashboard-main">
						{member ? (
							<>
								<header className="profile-dashboard-heading">
									<Typography className="profile-eyebrow">{t('overview.eyebrow')}</Typography>
									<Typography component="h2">{t('overview.welcome', { name: firstName })}</Typography>
									<Typography>{t('overview.subtitle')}</Typography>
								</header>

								<section className="profile-metrics" aria-label={t('overview.statistics')}>
									<DashboardMetric label={t('overview.myArticles')} value={articleTotal} loading={articles.loading} unavailable={Boolean(articles.error)} href="/mypage/articles" linkLabel={t('overview.viewArticles')} tone="blue" icon={<ArticleOutlined />} />
									<DashboardMetric label={t('overview.myBookings')} value={bookings.total} loading={bookings.loading} unavailable={Boolean(bookings.error)} href="/mypage/my-bookings" linkLabel={t('overview.viewBookings')} tone="orange" icon={<LuggageOutlined />} />
									<DashboardMetric label={t('overview.followers')} value={followerCount} loading={connectionCounts.loading} unavailable={Boolean(connectionCounts.error)} href="/mypage/followers" linkLabel={t('overview.viewFollowers')} tone="green" icon={<GroupsOutlined />} />
									<DashboardMetric label={t('overview.following')} value={followingCount} loading={connectionCounts.loading} unavailable={Boolean(connectionCounts.error)} href="/mypage/following" linkLabel={t('overview.viewFollowing')} tone="purple" icon={<PersonAddAlt1Outlined />} />
								</section>

								<div className="profile-dashboard-columns">
									<RecentActivity articles={articles} />
									<div className="profile-dashboard-rail">
										<UpcomingTrips bookings={bookings} />
										<QuickActions />
									</div>
								</div>
							</>
						) : profile.loading ? (
							<div className="profile-dashboard-loading" role="status" aria-label="Loading dashboard">
								<Skeleton height={86} />
								<div className="profile-metrics">{[0, 1, 2, 3].map((item) => <Skeleton key={item} variant="rounded" height={140} />)}</div>
								<Skeleton variant="rounded" height={360} />
							</div>
						) : null}
					</main>
				</div>
			</div>
		</div>
	);
}
