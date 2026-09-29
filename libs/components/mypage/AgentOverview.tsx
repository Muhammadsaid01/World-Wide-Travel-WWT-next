import {
	GET_AGENT,
	GET_AGENT_DASHBOARD_PACKAGES,
	GET_AGENT_RECENT_BOOKINGS,
	GET_MY_INCOMING_TRAVEL_MATE_JOIN_REQUESTS,
	GET_MY_PROFILE,
	GET_PROFILE_TRAVEL_MATES,
	GET_PUBLIC_MEMBER_ARTICLES,
	type AgentDetailData,
	type ProfileMember,
} from '@/apollo/user/query';
import { TravelMateJoinStatus } from '@/libs/enums/community.enum';
import { useQuery } from '@apollo/client';
import {
	Alert,
	Breadcrumbs,
	Button,
	Chip,
	Paper,
	Skeleton,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Typography,
} from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/router';
import PackageImage from '../package/PackageImage';
import { formatScheduleDate } from '../package/PackageSchedules';
import AgentProfileCard from './AgentProfileCard';
import ProfileSidebar from './ProfileSidebar';

function Failure({ children, retry }: { children: string; retry: () => void }) {
	return (
		<Alert severity="error" action={<Button onClick={retry}>Retry</Button>}>
			{children}
		</Alert>
	);
}
function Metric({ label, value, loading = false }: { label: string; value?: number; loading?: boolean }) {
	return (
		<Paper className="agent-dashboard-metric">
			<Typography component="h3">{label}</Typography>
			{loading ? (
				<Skeleton width={60} height={46} />
			) : (
				<strong>{typeof value === 'number' ? value.toLocaleString('en-US') : '—'}</strong>
			)}
		</Paper>
	);
}
function Community({ member }: { member: ProfileMember }) {
	const articles = useQuery(GET_PUBLIC_MEMBER_ARTICLES, {
		variables: { input: { page: 1, limit: 1, search: { memberId: member._id } } },
		fetchPolicy: 'no-cache',
	});
	const mates = useQuery(GET_PROFILE_TRAVEL_MATES, { fetchPolicy: 'no-cache' });
	const requests = useQuery(GET_MY_INCOMING_TRAVEL_MATE_JOIN_REQUESTS, {
		variables: { input: { page: 1, limit: 1, search: { joinStatus: TravelMateJoinStatus.PENDING } } },
		fetchPolicy: 'no-cache',
	});
	return (
		<section>
			<Typography component="h2">My Community</Typography>
			{(articles.error || mates.error || requests.error) && (
				<Failure
					retry={() => {
						void Promise.allSettled([articles.refetch(), mates.refetch(), requests.refetch()]);
					}}
				>
					Some community counts could not be loaded.
				</Failure>
			)}
			<div className="agent-dashboard-metrics">
				<Metric
					label="Published Articles"
					loading={articles.loading}
					value={
						articles.data && !articles.error ? (articles.data.getBoardArticles.metaCounter?.[0]?.total ?? 0) : undefined
					}
				/>
				<Metric
					label="Travel Mates"
					loading={mates.loading}
					value={
						mates.data && !mates.error ? (mates.data.getMyTravelMatePosts.metaCounter?.[0]?.total ?? 0) : undefined
					}
				/>
				<Metric
					label="Pending Requests"
					loading={requests.loading}
					value={
						requests.data && !requests.error
							? (requests.data.getMyIncomingTravelMateJoinRequests.metaCounter?.[0]?.total ?? 0)
							: undefined
					}
				/>
				<Metric label="Total Followers" value={member.memberFollowerCount} />
			</div>
		</section>
	);
}
function RecentBookings() {
	const { data, loading, error, refetch } = useQuery(GET_AGENT_RECENT_BOOKINGS, { fetchPolicy: 'no-cache' });
	return (
		<section>
			<Typography component="h2">Recent Bookings</Typography>
			{loading ? (
				<Skeleton variant="rounded" height={220} />
			) : error ? (
				<Failure
					retry={() => {
						void refetch().catch(() => undefined);
					}}
				>
					Recent bookings could not be loaded.
				</Failure>
			) : !data?.getBookingsByAgent.list.length ? (
				<Paper className="agent-dashboard-empty">No bookings yet.</Paper>
			) : (
				<TableContainer component={Paper} className="agent-dashboard-table">
					<Table size="small" aria-label="Recent agent bookings">
						<TableHead>
							<TableRow>
								{['Package', 'Contact', 'Pax', 'Booked On', 'Status', 'Amount'].map((label) => (
									<TableCell key={label}>{label}</TableCell>
								))}
							</TableRow>
						</TableHead>
						<TableBody>
							{data.getBookingsByAgent.list.map((booking) => (
								<TableRow key={booking._id}>
									<TableCell>{booking.packageData?.packageTitle || 'Package information unavailable'}</TableCell>
									<TableCell>{booking.contactName}</TableCell>
									<TableCell>{booking.peopleCount}</TableCell>
									<TableCell>{formatScheduleDate(booking.createdAt)}</TableCell>
									<TableCell>
										<Chip size="small" variant="outlined" label={booking.bookingStatus} />
									</TableCell>
									<TableCell>
										{booking.currency} {booking.finalPrice.toLocaleString('en-US')}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</TableContainer>
			)}
		</section>
	);
}
function Business({ agent }: { agent: AgentDetailData }) {
	const router = useRouter();
	const packages = useQuery(GET_AGENT_DASHBOARD_PACKAGES, { fetchPolicy: 'no-cache' });
	return (
		<>
			<section>
				<Typography component="h2">Business Overview</Typography>
				<div className="agent-dashboard-metrics">
					<Metric
						label="Active Packages"
						loading={packages.loading}
						value={packages.data && !packages.error ? (packages.data.active.metaCounter?.[0]?.total ?? 0) : undefined}
					/>
					<Metric label="Total Bookings" value={agent.agentBookingCount} />
					<Metric label="Reviews" value={agent.agentReviewCount} />
					<Metric label="Average Rating" value={agent.agentRating} />
				</div>
			</section>
			<RecentBookings />
			<section>
				<Typography component="h2">My Packages</Typography>
				{packages.loading ? (
					<div className="agent-dashboard-packages">
						{[0, 1, 2].map((i) => (
							<Skeleton key={i} variant="rounded" height={260} />
						))}
					</div>
				) : packages.error ? (
					<Failure
						retry={() => {
							void packages.refetch().catch(() => undefined);
						}}
					>
						Packages and the active package count could not be loaded.
					</Failure>
				) : !packages.data?.getMyTravelPackages.list.length ? (
					<Paper className="agent-dashboard-empty">No packages yet.</Paper>
				) : (
					<div className="agent-dashboard-packages">
						{packages.data.getMyTravelPackages.list.map((item) => (
							<Paper component="article" className="agent-dashboard-package"
							 key={item._id}
							 onClick={() => {
									void router.push(`/package/${item._id}`);
								}}
								role="link"
								tabIndex={0}>
								<div className="agent-dashboard-package-image">
									<PackageImage path={item.packageImages[0]} alt={item.packageTitle} />
								</div>
								<div className="agent-dashboard-package-body">
									<Chip size="small" variant="outlined" label={item.packageStatus} />
									<Typography component="h3">{item.packageTitle}</Typography>
									<Typography variant="body2" color="text.secondary">
										{item.packageBookingCount} bookings · {item.packageViewCount} views
									</Typography>
									<Typography variant="body2">Rating: {item.packageRating}</Typography>
								</div>
							</Paper>
						))}
					</div>
				)}
			</section>
		</>
	);
}
export default function AgentOverview({ memberId }: { memberId: string }) {
	const profile = useQuery(GET_MY_PROFILE, { fetchPolicy: 'no-cache' });
	const member = profile.data?.getMyProfile._id === memberId ? profile.data.getMyProfile : undefined;
	const agentId = member?.agentData?._id;
	const agentQuery = useQuery(GET_AGENT, {
		variables: { agentId: agentId ?? '' },
		skip: !agentId,
		fetchPolicy: 'no-cache',
	});
	const agent = agentQuery.data?.getAgent?.memberId === memberId ? agentQuery.data.getAgent : undefined;
	const name = member?.memberFullName || member?.memberNick;

	return (
		<div className="my-bookings-page agent-dashboard-page">
			<Breadcrumbs separator="/" className="my-bookings-breadcrumb">
				<Link href="/">Home</Link>
				<Link href="/mypage">My Profile</Link>
				<span aria-current="page">Overview</span>
			</Breadcrumbs>
			<div className="my-bookings-layout">
				<ProfileSidebar
					active="Overview"
					profileCard={<AgentProfileCard member={member} agent={agent} loading={profile.loading} />}
				/>
				<div className="agent-dashboard-main">
					{profile.loading ? (
						<Skeleton variant="rounded" height={160} />
					) : profile.error || !member ? (
						<Failure
							retry={() => {
								void profile.refetch().catch(() => undefined);
							}}
						>
							Your profile could not be loaded.
						</Failure>
					) : (
						<>
							<header>
								<Typography className="agent-dashboard-eyebrow">Overview</Typography>
								<Typography component="h1">Welcome back, {name}.</Typography>
								<Typography color="text.secondary">
									Here&apos;s a summary of your agent business and community activity.
								</Typography>
							</header>
							{agentQuery.loading ? (
								<Skeleton variant="rounded" height={240} />
							) : agentQuery.error ? (
								<Failure
									retry={() => {
										void agentQuery.refetch().catch(() => undefined);
									}}
								>
									Agent business information could not be loaded.
								</Failure>
							) : agent ? (
								<Business agent={agent} />
							) : (
								<Alert severity="info">Agent business information is unavailable.</Alert>
							)}
							<Community member={member} />
						</>
					)}
				</div>
			</div>
		</div>
	);
}
