import { useRef, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import {
	Alert,
	Avatar,
	Breadcrumbs,
	Button,
	Chip,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	LinearProgress,
	Pagination,
	Paper,
	Skeleton,
	Stack,
	TextField,
	Typography,
} from '@mui/material';
import ArrowBack from '@mui/icons-material/ArrowBack';
import ShareOutlined from '@mui/icons-material/ShareOutlined';
import CalendarMonthOutlined from '@mui/icons-material/CalendarMonthOutlined';
import PlaceOutlined from '@mui/icons-material/PlaceOutlined';
import PeopleAltOutlined from '@mui/icons-material/PeopleAltOutlined';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import FlightTakeoffOutlined from '@mui/icons-material/FlightTakeoffOutlined';
import VisibilityOutlined from '@mui/icons-material/VisibilityOutlined';
import { currentUserVar } from '@/apollo/store';
import {
	GET_TRAVEL_MATE_DETAIL,
	GET_TRAVEL_MATE_PARTICIPANTS,
	GET_MY_TRAVEL_MATE_JOIN,
	GET_MORE_TRAVEL_MATES,
	type TravelMateDetail as Post,
	type TravelMateMember,
	type TravelMateJoinItem,
} from '@/apollo/user/query';
import { JOIN_TRAVEL_MATE, LEAVE_TRAVEL_MATE } from '@/apollo/user/mutation';
import { TravelMatePostStatus, TravelMateJoinStatus } from '@/libs/enums/community.enum';
import { packageImageUrl } from '../package/PackageImage';
import { formatScheduleDate } from '../package/PackageSchedules';
const statusLabels = { ACTIVE: 'Open', FULL: 'Full', CLOSED: 'Closed', DELETED: 'Deleted' };
const joinLabels = {
	PENDING: 'Request pending',
	APPROVED: 'You have joined',
	REJECTED: 'Request rejected',
	CANCELLED: 'Request cancelled',
};
function statusLabel(post: Pick<Post, 'matePostStatus' | 'currentMembers' | 'maxMembers'>) {
	return post.matePostStatus === TravelMatePostStatus.ACTIVE && post.currentMembers >= post.maxMembers
		? 'Full'
		: statusLabels[post.matePostStatus];
}
function Person({
	member,
	role,
}: {
	member: Pick<TravelMateMember, 'memberNick' | 'memberFullName' | 'memberImage'>;
	role?: string;
}) {
	const name = member.memberFullName || member.memberNick;
	return (
		<Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
			<Avatar src={packageImageUrl(member.memberImage)} alt={name}>
				{name?.slice(0, 1).toUpperCase()}
			</Avatar>
			<div>
				<Typography sx={{ fontWeight: 600 }}>{name}</Typography>
				{role && (
					<Typography variant="caption" color="text.secondary">
						{role}
					</Typography>
				)}
			</div>
		</Stack>
	);
}
export default function TravelMateDetail({ id, ready }: { id: string; ready: boolean }) {
	const valid = /^[a-f\d]{24}$/i.test(id);
	const { data, loading, error, refetch } = useQuery(GET_TRAVEL_MATE_DETAIL, {
		variables: { postId: id },
		skip: !ready || !valid,
		fetchPolicy: 'network-only',
	});
	const user = useReactiveVar(currentUserVar);
	const post = data?.getTravelMatePost;
	const [shareMessage, setShareMessage] = useState('');
	const notFound =
		ready &&
		(!valid || error?.graphQLErrors.some((item) => item.message === 'No data found!') || (!loading && !error && !post));
	async function share() {
		try {
			if (navigator.share) await navigator.share({ title: post?.matePostTitle, url: window.location.href });
			else {
				await navigator.clipboard.writeText(window.location.href);
				setShareMessage('Link copied.');
			}
		} catch (failure) {
			if (!(failure instanceof Error && failure.name === 'AbortError'))
				setShareMessage('Unable to share. You can copy the address from your browser.');
		}
	}
	return (
		<div className="travel-mate-detail">
			<Head>
				<title>{post?.matePostTitle || 'Travel Mate'} | WWT</title>
			</Head>
			<Breadcrumbs separator="/" className="travel-mate-breadcrumb">
				<Link href="/">Home</Link>
				<Link href="/community">Community</Link>
				<Link href="/community/travel-mate">Travel Mate</Link>
				<span aria-current="page">{post?.matePostTitle || 'Post'}</span>
			</Breadcrumbs>
			<Button component={Link} href="/community/travel-mate" startIcon={<ArrowBack />} className="travel-mate-back">
				Back to Travel Mates
			</Button>
			{!ready || loading ? (
				<div className="travel-mate-columns" aria-label="Loading travel mate">
					<div>
						<Skeleton height={70} />
						<Skeleton width="50%" height={45} />
						<div className="travel-mate-facts">
							{Array.from({ length: 4 }, (_, i) => (
								<Skeleton key={i} variant="rounded" height={140} />
							))}
						</div>
						<Skeleton variant="rounded" height={260} />
					</div>
					<Skeleton variant="rounded" height={330} />
				</div>
			) : notFound ? (
				<Paper className="travel-mate-state" variant="outlined">
					<Typography variant="h4" component="h1">
						Travel mate unavailable
					</Typography>
					<Typography>This post could not be found or is no longer publicly available.</Typography>
					<Button component={Link} href="/community/travel-mate">
						Back to Travel Mates
					</Button>
				</Paper>
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
					Unable to load this travel mate. {error.message}
				</Alert>
			) : (
				post && (
					<>
						<div className="travel-mate-columns">
							<div className="travel-mate-content">
								<header>
									<Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
										<Chip label={[post.destinationCity, post.destinationCountry].filter(Boolean).join(', ')} />
										<Chip color={statusLabel(post) === 'Open' ? 'info' : 'default'} label={statusLabel(post)} />
										<Button
											startIcon={<ShareOutlined />}
											onClick={() => {
												void share();
											}}
											sx={{ ml: 'auto' }}
										>
											Share
										</Button>
									</Stack>
									{shareMessage && (
										<Typography role="status" variant="caption">
											{shareMessage}
										</Typography>
									)}
									<Typography component="h1">{post.matePostTitle}</Typography>
									{post.memberData && <Person member={post.memberData} role="Creator" />}
								</header>
								<div className="travel-mate-facts">
									{[
										{ label: 'Travel Date', value: formatScheduleDate(post.travelDate), Icon: CalendarMonthOutlined },
										...(post.departureCity || post.departureCountry
											? [{
												label: 'Departure',
												value: [post.departureCity, post.departureCountry].filter(Boolean).join(', '),
												Icon: FlightTakeoffOutlined,
											}]
											: []),
										{
											label: 'Destination',
											value: [post.destinationCity, post.destinationCountry].filter(Boolean).join(', '),
											Icon: PlaceOutlined,
										},
										{ label: 'Max Group Size', value: `${post.maxMembers} travelers`, Icon: PeopleAltOutlined },
										{ label: 'Status', value: statusLabel(post), Icon: InfoOutlined },
										...(typeof post.matePostViewCount === 'number'
											? [{ label: 'Views', value: post.matePostViewCount.toLocaleString('en-US'), Icon: VisibilityOutlined }]
											: []),
									].map(({ label, value, Icon }) => (
										<Paper key={label} elevation={0}>
											<Icon color="primary" />
											<Typography component="h2">{label}</Typography>
											<Typography sx={{ fontWeight: 600 }}>{value}</Typography>
										</Paper>
									))}
								</div>
								<section>
									<Typography component="h2">About This Trip</Typography>
									<Typography className="travel-mate-description">{post.matePostContent}</Typography>
								</section>
								{/* TravelMatePost has no structured itinerary or image fields. */}
								<Participants post={post} />
								{post.memberData && (
									<section>
										<Typography component="h2">About the Creator</Typography>
										<Paper variant="outlined" className="travel-mate-creator">
											<Person member={post.memberData} role="Creator" />
											{(post.memberData.memberCity || post.memberData.memberCountry) && (
												<Typography color="text.secondary">
													{[post.memberData.memberCity, post.memberData.memberCountry].filter(Boolean).join(', ')}
												</Typography>
											)}
											{post.memberData.memberDesc && (
												<Typography className="travel-mate-description">{post.memberData.memberDesc}</Typography>
											)}
											<Typography color="text.secondary">
												{post.memberData.memberFollowerCount} followers · {post.memberData.memberFollowingCount}{' '}
												following
											</Typography>
										</Paper>
									</section>
								)}
							</div>
							<JoinPanel
								key={`${id}:${user?._id ?? 'guest'}`}
								post={post}
								userId={user?._id}
								refresh={() => refetch()}
							/>
						</div>
						<MorePosts id={id} />
					</>
				)
			)}
		</div>
	);
}
function Participants({ post }: { post: Post }) {
	const [page, setPage] = useState(1);
	const { data, loading, error, refetch } = useQuery(GET_TRAVEL_MATE_PARTICIPANTS, {
		variables: {
			input: { page, limit: 6, sort: 'createdAt', direction: 'ASC', search: { travelMatePostId: post._id } },
		},
		fetchPolicy: 'network-only',
	});
	const result = data?.getTravelMateParticipants;
	const total = result?.metaCounter?.[0]?.total ?? 0;
	return (
		<section>
			<Typography component="h2">Current Travelers</Typography>
			<Typography color="text.secondary">
				{post.currentMembers} / {post.maxMembers} Joined
			</Typography>
			{loading ? (
				<Skeleton height={90} />
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
					Unable to load travelers.
				</Alert>
			) : (
				<>
					<div className="travel-mate-travelers">
						{page === 1 && post.memberData && (
							<Paper variant="outlined">
								<Person member={post.memberData} role="Creator" />
							</Paper>
						)}
						{result?.list
							.filter((item) => item.memberId !== post.memberId)
							.map((item) => (
								<Paper key={item._id} variant="outlined">
									{item.memberData ? (
										<Person member={item.memberData} role="Approved" />
									) : (
										<Typography>Member profile unavailable</Typography>
									)}
								</Paper>
							))}
					</div>
					{!result?.list.length && <Typography color="text.secondary">No approved join requests yet.</Typography>}
					{total > 6 && (
						<Pagination
							count={Math.ceil(total / 6)}
							page={page}
							onChange={(_, value) => setPage(value)}
							color="primary"
						/>
					)}
				</>
			)}
		</section>
	);
}
function JoinPanel({ post, userId, refresh }: { post: Post; userId?: string; refresh: () => Promise<unknown> }) {
	const owner = userId === post.memberId;
	const { data, loading, error, refetch } = useQuery(GET_MY_TRAVEL_MATE_JOIN, {
		variables: { input: { page: 1, limit: 1, search: { travelMatePostId: post._id } } },
		skip: !userId || owner,
		fetchPolicy: 'no-cache',
		notifyOnNetworkStatusChange: true,
	});
	const [join] = useMutation(JOIN_TRAVEL_MATE);
	const [leave] = useMutation(LEAVE_TRAVEL_MATE);
	const inFlight = useRef(false);
	const [returned, setReturned] = useState<TravelMateJoinItem>();
	const [failure, setFailure] = useState('');
	const [joinOpen, setJoinOpen] = useState(false);
	const [leaveOpen, setLeaveOpen] = useState(false);
	const [message, setMessage] = useState('');
	const [busy, setBusy] = useState(false);
	const request = data?.getMyJoinedTravelMates.list[0] ?? returned;
	const remaining = Math.max(post.maxMembers - post.currentMembers, 0);
	const percent = post.maxMembers > 0 ? Math.max(0, Math.min((post.currentMembers / post.maxMembers) * 100, 100)) : 0;
	const eligible = Boolean(
		userId &&
		!owner &&
		!request &&
		!loading &&
		!error &&
		data &&
		remaining > 0 &&
		post.matePostStatus === TravelMatePostStatus.ACTIVE,
	);
	async function submit() {
		if (!eligible || inFlight.current) return;
		inFlight.current = true;
		setBusy(true);
		setFailure('');
		try {
			const result = await join({
				variables: {
					input: {
						travelMatePostId: post._id,
						message: message.trim() || undefined,
					},
				},
			});
			if (!result.data?.joinTravelMate) throw new Error('The request did not return a result.');
			setReturned(result.data.joinTravelMate);
			setJoinOpen(false);
		} catch (e) {
			setFailure(e instanceof Error ? e.message : 'Unable to send join request.');
		} finally {
			await Promise.allSettled([refetch(), refresh()]);
			inFlight.current = false;
			setBusy(false);
		}
	}
	async function removeRequest() {
		if (!request || inFlight.current) return;
		inFlight.current = true;
		setBusy(true);
		setFailure('');
		try {
			await leave({
				variables: { joinId: request._id },
				refetchQueries: ['GetTravelMateParticipants'],
			});
			setReturned(undefined);
			setLeaveOpen(false);
			setMessage('');
			await Promise.all([refetch(), refresh()]);
		} catch (e) {
			setFailure(e instanceof Error ? e.message : 'Unable to update your trip membership.');
		} finally {
			inFlight.current = false;
			setBusy(false);
		}
	}
	const label = owner
		? 'You created this trip'
		: loading
			? 'Checking request…'
			: request
				? joinLabels[request.joinStatus]
				: post.matePostStatus !== TravelMatePostStatus.ACTIVE
					? 'Trip unavailable'
					: remaining === 0
						? 'Trip full'
						: 'Request to Join';
	return (
		<Paper component="aside" variant="outlined" className="travel-mate-join">
			<Typography component="h2">Join This Trip</Typography>
			<Typography>
				{post.currentMembers} / {post.maxMembers} travelers
			</Typography>
			<Stack direction="row" sx={{ justifyContent: 'space-between' }}>
				<Typography variant="caption">Capacity</Typography>
				<Typography variant="caption">{Math.round(percent)}% full</Typography>
			</Stack>
			<LinearProgress variant="determinate" value={percent} aria-label="Group capacity" />
			<Typography color="text.secondary">{remaining} spots remaining</Typography>
			{!userId ? (
				<Button component={Link} href="/account/login" variant="contained" fullWidth>
					Log in to request to join
				</Button>
			) : (
				<Button
					variant="contained"
					fullWidth
					disabled={!eligible || busy}
					onClick={() => setJoinOpen(true)}
				>
					{label}
				</Button>
			)}
			{owner && (
				<Button component={Link} href="/mypage/travel-mates" variant="outlined" fullWidth>
					My Travel Mates
				</Button>
			)}
			{request?.joinStatus === TravelMateJoinStatus.PENDING && (
				<>
					<Typography role="status" variant="body2">
						Your request is awaiting the creator&apos;s approval.
					</Typography>
					<Button variant="outlined" color="error" fullWidth disabled={busy} onClick={() => setLeaveOpen(true)}>
						Cancel Request
					</Button>
				</>
			)}
			{request?.joinStatus === TravelMateJoinStatus.APPROVED && (
				<>
					<Typography role="status" variant="body2">You are an approved traveler on this trip.</Typography>
					<Button variant="outlined" color="error" fullWidth disabled={busy} onClick={() => setLeaveOpen(true)}>
						Leave Trip
					</Button>
				</>
			)}
			{request && [TravelMateJoinStatus.REJECTED, TravelMateJoinStatus.CANCELLED].includes(request.joinStatus) && (
				<Typography variant="body2">An existing request cannot be submitted again.</Typography>
			)}
			{eligible && (
				<Typography variant="body2" color="text.secondary">
					The creator will review your request before you join.
				</Typography>
			)}
			{error && (
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
					Unable to check your request status.
				</Alert>
			)}
			{failure && <Alert severity="error">{failure}</Alert>}
			<Dialog
				open={joinOpen}
				onClose={() => {
					if (!busy) setJoinOpen(false);
				}}
				fullWidth
				maxWidth="sm"
				aria-labelledby="request-travel-mate-title"
			>
				<DialogTitle id="request-travel-mate-title">Request to Join</DialogTitle>
				<DialogContent className="travel-mate-request-dialog">
					<Typography color="text.secondary">
						Send a short note to the creator. Your request remains pending until they approve it.
					</Typography>
					<TextField
						label="Message (optional)"
						placeholder="Introduce yourself and share why this trip interests you."
						multiline
						minRows={5}
						fullWidth
						value={message}
						onChange={(event) => setMessage(event.target.value)}
						error={message.trim().length === 1}
						helperText={message.trim().length === 1 ? 'Use at least 2 characters or leave the message empty.' : `${message.length}/500`}
						slotProps={{ htmlInput: { maxLength: 500 } }}
					/>
					{failure && <Alert severity="error">{failure}</Alert>}
				</DialogContent>
				<DialogActions>
					<Button disabled={busy} onClick={() => setJoinOpen(false)}>Cancel</Button>
					<Button
						variant="contained"
						disabled={busy || message.trim().length === 1}
						onClick={() => void submit()}
					>
						{busy ? 'Sending…' : 'Send Request'}
					</Button>
				</DialogActions>
			</Dialog>
			<Dialog
				open={leaveOpen}
				onClose={() => {
					if (!busy) setLeaveOpen(false);
				}}
				fullWidth
				maxWidth="xs"
				aria-labelledby="leave-travel-mate-title"
			>
				<DialogTitle id="leave-travel-mate-title">
					{request?.joinStatus === TravelMateJoinStatus.APPROVED ? 'Leave this trip?' : 'Cancel this request?'}
				</DialogTitle>
				<DialogContent>
					<Typography>
						{request?.joinStatus === TravelMateJoinStatus.APPROVED
							? 'Your approved place will be released for another traveler.'
							: 'Your pending request will be removed.'}
					</Typography>
					{failure && <Alert severity="error">{failure}</Alert>}
				</DialogContent>
				<DialogActions>
					<Button disabled={busy} onClick={() => setLeaveOpen(false)}>Keep It</Button>
					<Button color="error" variant="contained" disabled={busy} onClick={() => void removeRequest()}>
						{busy ? 'Updating…' : request?.joinStatus === TravelMateJoinStatus.APPROVED ? 'Leave Trip' : 'Cancel Request'}
					</Button>
				</DialogActions>
			</Dialog>
		</Paper>
	);
}
function MorePosts({ id }: { id: string }) {
	const { data, loading, error, refetch } = useQuery(GET_MORE_TRAVEL_MATES, {
		variables: { input: { page: 1, limit: 4, sort: 'createdAt', direction: 'DESC' } },
	});
	const posts = data?.getTravelMatePosts.list.filter((item) => item._id !== id).slice(0, 3) ?? [];
	if (!loading && !error && !posts.length) return null;
	return (
		<section className="travel-mate-more">
			<Typography component="h2">More Travel Mates</Typography>
			{loading ? (
				<Skeleton height={180} />
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
					Unable to load more posts.
				</Alert>
			) : (
				<div>
					{posts.map((post) => (
						<Paper key={post._id} variant="outlined">
							<Chip size="small" label={statusLabel(post)} />
							<Typography color="text.secondary">
								{post.destinationCity}, {post.destinationCountry}
							</Typography>
							<Typography component="h3">{post.matePostTitle}</Typography>
							<Typography>{formatScheduleDate(post.travelDate)}</Typography>
							<Typography>
								{post.currentMembers} / {post.maxMembers} travelers
							</Typography>
							<Button component={Link} href={`/community/travel-mate/${post._id}`} variant="outlined">
								View Post
							</Button>
						</Paper>
					))}
				</div>
			)}
		</section>
	);
}
