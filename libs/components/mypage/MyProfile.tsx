import { currentUserVar } from '@/apollo/store';
import {
	GET_CONNECTION_COUNTS,
	GET_MY_BOOKINGS,
	GET_MY_PROFILE,
	GET_PROFILE_ARTICLES,
	GET_PROFILE_TRAVEL_MATES,
	type PaymentBooking,
} from '@/apollo/user/query';
import { BookingStatus } from '@/libs/enums/booking.enum';
import { MemberType } from '@/libs/enums/member.enum';
import { useApolloClient, useQuery, useReactiveVar } from '@apollo/client';
import EditOutlined from '@mui/icons-material/EditOutlined';
import { Alert, Avatar, Button, Chip, Paper, Skeleton, Stack, Typography } from '@mui/material';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import PackageImage, { packageImageUrl } from '../package/PackageImage';
import { formatScheduleDate } from '../package/PackageSchedules';
import ProfileSidebar from './ProfileSidebar';

function UpcomingTrip() {
	const client = useApolloClient();
	const [state, setState] = useState<{ loading: boolean; error?: string; trip?: PaymentBooking; total?: number }>({
		loading: true,
	});
	const [retry, setRetry] = useState(0);
	useEffect(() => {
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
						const date = booking.scheduleData ? new Date(booking.scheduleData.startDate).getTime() : NaN;
						if (
							[BookingStatus.PENDING, BookingStatus.CONFIRMED].includes(booking.bookingStatus) &&
							date >= today.getTime() &&
							(!nearest || date < new Date(nearest.scheduleData!.startDate).getTime())
						)
							nearest = booking;
					}
					scanned += result.list.length;
					if (!result.list.length) break;
					page += 1;
				} while (scanned < total);
				setState({ loading: false, trip: nearest, total });
			} catch {
				if (!cancelled) setState({ loading: false, error: 'Upcoming bookings could not be loaded.' });
			}
		}
		void load();
		return () => {
			cancelled = true;
		};
	}, [client, retry]);
	const trip = state.trip;
	return (
		<section>
			<div className="profile-section-title">
				<Typography component="h2">Upcoming Trip</Typography>
				<Button component={Link} href="/mypage/my-bookings">
					My Bookings{state.total !== undefined ? ` (${state.total})` : ''} →
				</Button>
			</div>
			{state.loading ? (
				<Skeleton variant="rounded" height={230} />
			) : state.error ? (
				<Alert severity="error" action={<Button onClick={() => setRetry((value) => value + 1)}>Retry</Button>}>
					{state.error}
				</Alert>
			) : trip ? (
				<Paper variant="outlined" className="profile-trip">
					<div className="profile-trip-image">
						<PackageImage
							path={trip.packageData?.packageImages[0]}
							alt={trip.packageData?.packageTitle ?? 'Travel package'}
						/>
					</div>
					<div className="profile-trip-info">
						<Chip label={trip.bookingStatus} size="small" />
						<Typography variant="body2" color="text.secondary">
							{trip.scheduleData &&
								`${formatScheduleDate(trip.scheduleData.startDate)} – ${formatScheduleDate(trip.scheduleData.endDate)}`}
						</Typography>
						<Typography component="h3">
							{trip.packageData?.packageTitle ?? 'Package information unavailable'}
						</Typography>
						<Typography color="text.secondary">
							{[trip.packageData?.destinationCity, trip.packageData?.destinationCountry].filter(Boolean).join(', ')}
						</Typography>
						<Typography>{trip.peopleCount} travelers</Typography>
						<Button component={Link} href={`/mypage/my-bookings/${trip._id}`}>
							View Booking →
						</Button>
					</div>
				</Paper>
			) : (
				<Paper variant="outlined" className="profile-empty">
					<Typography>No upcoming bookings.</Typography>
					<Button component={Link} href="/package">
						Browse Packages
					</Button>
				</Paper>
			)}
		</section>
	);
}
function useProfileArticles(skip: boolean) {
	return useQuery(GET_PROFILE_ARTICLES, { skip, fetchPolicy: 'no-cache' });
}
function Activity({ articles }: { articles: ReturnType<typeof useProfileArticles> }) {
	const mates = useQuery(GET_PROFILE_TRAVEL_MATES, { fetchPolicy: 'no-cache' });
	const article = articles.data?.getMyBoardArticles;
	const mate = mates.data?.getMyTravelMatePosts;
	return (
		<section>
			<Typography component="h2">My Activity</Typography>
			<div className="profile-activity">
				<Paper variant="outlined">
					<Typography component="h3">My Articles</Typography>
					{articles.loading ? (
						<Skeleton height={100} />
					) : articles.error ? (
						<Alert
							severity="error"
							action={
								<Button
									onClick={() => {
										void articles.refetch().catch(() => undefined);
									}}
								>
									Retry
								</Button>
							}
						>
							Articles unavailable.
						</Alert>
					) : (
						<>
							<Typography className="profile-activity-count">
								{article?.metaCounter?.[0]?.total ?? 0} articles
							</Typography>
							{article?.list[0] ? (
								<>
									<Typography>{article.list[0].articleTitle}</Typography>
									<Typography variant="body2" color="text.secondary">
										{article.list[0].articleLikeCount} likes · {article.list[0].articleCommentCount} comments ·{' '}
										{article.list[0].articleViewCount} views
									</Typography>
								</>
							) : (
								<Typography color="text.secondary">No articles yet.</Typography>
							)}
						</>
					)}
				</Paper>
				<Paper variant="outlined">
					<Typography component="h3">Travel Mate Posts</Typography>
					{mates.loading ? (
						<Skeleton height={100} />
					) : mates.error ? (
						<Alert
							severity="error"
							action={
								<Button
									onClick={() => {
										void mates.refetch().catch(() => undefined);
									}}
								>
									Retry
								</Button>
							}
						>
							Travel mate posts unavailable.
						</Alert>
					) : (
						<>
							<Typography className="profile-activity-count">{mate?.metaCounter?.[0]?.total ?? 0} posts</Typography>
							{mate?.list[0] ? (
								<>
									<Typography>{mate.list[0].matePostTitle}</Typography>
									<Typography variant="body2" color="text.secondary">
										{mate.list[0].matePostStatus}
									</Typography>
								</>
							) : (
								<Typography color="text.secondary">No travel mate posts yet.</Typography>
							)}
						</>
					)}
				</Paper>
			</div>
		</section>
	);
}
export default function MyProfile() {
	const user = useReactiveVar(currentUserVar);
	return <ProfileContent key={user?._id ?? 'guest'} authenticated={Boolean(user)} />;
}
function ProfileContent({ authenticated }: { authenticated: boolean }) {
	const { data, loading, error, refetch } = useQuery(GET_MY_PROFILE, { skip: !authenticated, fetchPolicy: 'no-cache' });
	const member = data?.getMyProfile;
	const connectionCounts = useQuery(GET_CONNECTION_COUNTS, {
  variables: {
    followers: {
      page: 1,
      limit: 1,
      search: {
        followingId: member?._id,
      },
    },
    following: {
      page: 1,
      limit: 1,
      search: {
        followerId: member?._id,
      },
    },
  },
  skip: !authenticated || !member?._id,
  fetchPolicy: 'no-cache',
});

const followerCount =
  connectionCounts.data?.getMemberFollowers.metaCounter?.[0]?.total ?? 0;

const followingCount =
  connectionCounts.data?.getMemberFollowings.metaCounter?.[0]?.total ?? 0;
	const articles = useProfileArticles(!authenticated || !member);
	const name = member?.memberFullName || member?.memberNick;
	return (
		<div className="profile-overview">
			<div className="profile-cover" aria-hidden="true" />
			<div className="my-bookings-page profile-container">
				<Paper className="profile-header">
					<Avatar className="profile-avatar" src={packageImageUrl(member?.memberImage)}>
						{name?.slice(0, 1)}
					</Avatar>
					{loading ? (
						<Stack spacing={1} className="profile-identity">
							<Skeleton width="60%" height={45} />
							<Skeleton />
							<Skeleton height={60} />
						</Stack>
					) : !authenticated ? (
						<Alert
							severity="info"
							action={
								<Button component={Link} href="/account/login">
									Login
								</Button>
							}
						>
							Log in to view your profile.
						</Alert>
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
							Your profile could not be loaded.
						</Alert>
					) : member ? (
						<>
							<div className="profile-identity">
								<div className="profile-name">
									<Typography component="h1">{name}</Typography>
									<Chip label={member.memberType} size="small" />
								</div>
								<Typography color="text.secondary">@{member.memberNick}</Typography>
								{member.memberDesc && <Typography className="profile-bio">{member.memberDesc}</Typography>}
								{(member.memberCity || member.memberCountry) && (
									<Typography color="text.secondary">
										{[member.memberCity, member.memberCountry].filter(Boolean).join(', ')}
									</Typography>
								)}
								<div className="profile-stats">
									<div>
										{articles.loading ? (
											<Skeleton width={40} height={32} />
										) : (
											<strong>
												{articles.error || !articles.data
													? '—'
													: (articles.data.getMyBoardArticles.metaCounter?.[0]?.total ?? 0)}
											</strong>
										)}
										<span>Articles</span>
									</div>
										<Link href="/mypage/followers" className="profile-stat-link">
											<strong>
												{connectionCounts.loading ? '—' : followerCount}
											</strong>
											<span>Followers</span>
										</Link>

										<Link href="/mypage/following" className="profile-stat-link">
											<strong>
												{connectionCounts.loading ? '—' : followingCount}
											</strong>
											<span>Following</span>
										</Link>
								</div>
							</div>
							<Button
								component={Link}
								href="/mypage/edit-profile"
								variant="outlined"
								startIcon={<EditOutlined />}
								className="profile-edit"
							>
								Edit Profile
							</Button>
						</>
					) : (
						<Typography>Profile information unavailable.</Typography>
					)}
				</Paper>
				<div className="my-bookings-layout">
					<ProfileSidebar active="Overview" />
					<div className="profile-content">
						{member ? (
							<>
								<header>
									<Typography className="profile-eyebrow">Overview</Typography>
									<Typography component="h2">Welcome back, {name}</Typography>
									<Typography color="text.secondary">Here&apos;s what&apos;s happening with your travels.</Typography>
								</header>
								{member.memberType === MemberType.USER && <UpcomingTrip />}
								<Activity articles={articles} />
								<section>
									<Typography component="h2">Join Requests</Typography>
									{/* No owner-wide incoming-request summary API is currently exposed. */}
									<Paper variant="outlined" className="profile-empty">
										<Typography color="text.secondary">
											Pending join requests are not available in Overview yet.
										</Typography>
									</Paper>
								</section>
								<section>
									<Typography component="h2">Saved</Typography>
									<Typography color="text.secondary" className="profile-section-subtitle">
										Quick access to things you&apos;ve saved.
									</Typography>
									{/* A saved-items query is required before real saved content can be displayed. */}
									<Paper variant="outlined" className="profile-empty">
										<Typography color="text.secondary">Saved items are not available yet.</Typography>
										<Button component={Link} href="/package">
											Browse Packages
										</Button>
									</Paper>
								</section>
							</>
						) : loading ? (
							<>
								<Skeleton height={80} />
								<Skeleton variant="rounded" height={230} />
								<Skeleton variant="rounded" height={180} />
							</>
						) : null}
					</div>
				</div>
			</div>
		</div>
	);
}
