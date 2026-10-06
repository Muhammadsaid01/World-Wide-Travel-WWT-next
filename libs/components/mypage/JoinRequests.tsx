import { useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
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
	MenuItem,
	Pagination,
	Paper,
	Skeleton,
	TextField,
	Typography,
} from '@mui/material';
import CalendarMonthOutlined from '@mui/icons-material/CalendarMonthOutlined';
import PeopleAltOutlined from '@mui/icons-material/PeopleAltOutlined';
import { currentUserVar } from '@/apollo/store';
import { GET_MY_INCOMING_TRAVEL_MATE_JOIN_REQUESTS, type IncomingTravelMateJoin } from '@/apollo/user/query';
import { APPROVE_TRAVEL_MATE_JOIN, REJECT_TRAVEL_MATE_JOIN } from '@/apollo/user/mutation';
import { TravelMateJoinStatus, TravelMatePostStatus } from '@/libs/enums/community.enum';
import { packageImageUrl } from '../package/PackageImage';
import { formatScheduleDate } from '../package/PackageSchedules';
import ProfileSidebar from './ProfileSidebar';

const LIMIT = 6;
const statuses: Record<TravelMateJoinStatus, { label: string; color: 'warning' | 'success' | 'error' | 'default' }> = {
	PENDING: { label: 'Pending', color: 'warning' },
	APPROVED: { label: 'Accepted', color: 'success' },
	REJECTED: { label: 'Rejected', color: 'error' },
	CANCELLED: { label: 'Cancelled', color: 'default' },
};
const tabs = [
	{ label: 'All', value: undefined },
	{ label: 'Pending', value: TravelMateJoinStatus.PENDING },
	{ label: 'Accepted', value: TravelMateJoinStatus.APPROVED },
	{ label: 'Rejected', value: TravelMateJoinStatus.REJECTED },
];
export default function JoinRequests() {
	const user = useReactiveVar(currentUserVar);
	return <IncomingRequests key={user?._id ?? 'guest'} userId={user?._id} />;
}
function IncomingRequests({ userId }: { userId?: string }) {
	const router = useRouter();
	const requestedPostId = typeof router.query.postId === 'string' ? router.query.postId : '';
	const postId = /^[a-f\d]{24}$/i.test(requestedPostId) ? requestedPostId : undefined;
	const [page, setPage] = useState(1);
	const [status, setStatus] = useState<TravelMateJoinStatus>();
	const [oldest, setOldest] = useState(false);
	const [declining, setDeclining] = useState<IncomingTravelMateJoin | null>(null);
	const [busyId, setBusyId] = useState<string>();
	const busy = useRef(false);
	const [actionError, setActionError] = useState('');
	const [actionNotice, setActionNotice] = useState('');
	const { data, loading, error, refetch } = useQuery(GET_MY_INCOMING_TRAVEL_MATE_JOIN_REQUESTS, {
		variables: {
			input: {
				page,
				limit: LIMIT,
				sort: 'createdAt',
				direction: oldest ? 'ASC' : 'DESC',
				search: { joinStatus: status, travelMatePostId: postId },
			},
		},
		skip: !userId,
		fetchPolicy: 'no-cache',
		notifyOnNetworkStatusChange: true,
	});
	const [approve] = useMutation(APPROVE_TRAVEL_MATE_JOIN);
	const [reject] = useMutation(REJECT_TRAVEL_MATE_JOIN);
	const result = data?.getMyIncomingTravelMateJoinRequests;
	const total = result?.metaCounter?.[0]?.total ?? 0;
	// These groups contain only this page of results, never complete per-trip totals.
	const groups = new Map<string, IncomingTravelMateJoin[]>();
	for (const request of result?.list ?? [])
		groups.set(request.travelMatePostId, [...(groups.get(request.travelMatePostId) ?? []), request]);
	async function act(request: IncomingTravelMateJoin, action: 'accept' | 'decline') {
		if (busy.current || request.joinStatus !== TravelMateJoinStatus.PENDING) return;
		busy.current = true;
		setBusyId(request._id);
		setActionError('');
		setActionNotice('');
		try {
			if (action === 'accept') await approve({ variables: { joinId: request._id } });
			else await reject({ variables: { joinId: request._id } });
			setActionNotice(action === 'accept' ? 'Request accepted.' : 'Request declined.');
		} catch (failure) {
			setActionError(failure instanceof Error ? failure.message : 'Unable to update the request.');
		} finally {
			setDeclining(null);
			// Refresh on success and failure, including capacity races. The response includes current trip counts.
			try {
				const fresh = await refetch();
				const lastPage = Math.max(
					1,
					Math.ceil((fresh.data.getMyIncomingTravelMateJoinRequests.metaCounter?.[0]?.total ?? 0) / LIMIT),
				);
				if (page > lastPage) setPage(lastPage);
			} catch {
				/* The query error is rendered below; stale results are not shown. */
			}
			busy.current = false;
			setBusyId(undefined);
		}
	}
	return (
		<div className="my-bookings-page join-requests-page">
			<Breadcrumbs separator="/" className="my-bookings-breadcrumb">
				<Link href="/">Home</Link>
				<Link href="/mypage">My Profile</Link>
				<span aria-current="page">Join Requests</span>
			</Breadcrumbs>
			<div className="my-bookings-layout">
				<ProfileSidebar active="Join Requests" />
				<div className="join-requests-main">
					<header className="join-requests-header">
						<div>
							<Typography component="h1">Join Requests</Typography>
							<Typography color="text.secondary">Review travelers who want to join your trips.</Typography>
						</div>
						{userId && loading ? (
							<Skeleton width={130} height={40} />
						) : userId && !error && result && !status ? (
							<span className="my-bookings-count">{total} Total Requests</span>
						) : null}
					</header>
					{!userId ? (
						<Alert
							severity="info"
							action={
								<Button component={Link} href="/account/login">
									Login
								</Button>
							}
						>
							Log in to review requests to your trips.
						</Alert>
					) : (
						<>
							{postId && (
								<Alert
									severity="info"
									className="join-requests-feedback"
									action={<Button onClick={() => void router.replace('/mypage/join-requests')}>Show All Trips</Button>}
								>
									Showing requests for the selected travel mate post.
								</Alert>
							)}
							<div className="join-requests-toolbar">
								<div className="my-bookings-tabs" role="group" aria-label="Request status">
									{tabs.map((tab) => (
										<Button
											key={tab.label}
											disabled={Boolean(busyId)}
											className={status === tab.value ? 'is-active' : undefined}
											aria-pressed={status === tab.value}
											onClick={() => {
												setStatus(tab.value);
												setPage(1);
												setActionNotice('');
											}}
										>
											{tab.label}
										</Button>
									))}
								</div>
								<TextField
									select
									size="small"
									value={oldest ? 'oldest' : 'newest'}
									disabled={Boolean(busyId)}
									onChange={(event) => {
										setOldest(event.target.value === 'oldest');
										setPage(1);
									}}
									slotProps={{ htmlInput: { 'aria-label': 'Sort join requests' } }}
								>
									<MenuItem value="newest">Newest First</MenuItem>
									<MenuItem value="oldest">Oldest First</MenuItem>
								</TextField>
							</div>
							{actionError && (
								<Alert severity="error" className="join-requests-feedback">
									{actionError}
								</Alert>
							)}
							{actionNotice && (
								<Typography role="status" className="join-requests-feedback">
									{actionNotice}
								</Typography>
							)}
							<div aria-busy={loading}>
								{loading ? (
									<div aria-label="Loading join requests">
										<Skeleton height={42} />
										{[0, 1].map((index) => (
											<section className="join-request-group" key={index} aria-hidden="true">
												<Skeleton width="60%" height={56} />
												<Paper className="join-request-card">
													<Skeleton variant="circular" width={48} height={48} />
													<div className="join-request-content">
														<Skeleton width="45%" />
														<Skeleton height={80} />
													</div>
												</Paper>
											</section>
										))}
									</div>
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
										Unable to load join requests. {error.message}
									</Alert>
								) : !result?.list.length ? (
									<Paper variant="outlined" className="join-requests-empty">
										<Typography component="h2">
											{status ? 'No requests match this filter.' : 'No join requests yet.'}
										</Typography>
										{status ? (
											<Button
												onClick={() => {
													setStatus(undefined);
													setPage(1);
												}}
											>
												Show All
											</Button>
										) : (
											<Typography color="text.secondary">
												When travelers request to join your trips, they&apos;ll appear here.
											</Typography>
										)}
									</Paper>
								) : (
									Array.from(groups, ([postId, requests]) => {
										const post = requests[0].travelMatePostData;
										const active = post?.matePostStatus === TravelMatePostStatus.ACTIVE;
										return (
											<section className="join-request-group" key={postId}>
												<header className="join-request-trip">
													<div>
														<Typography component="h2">
															{post?.matePostTitle ?? 'Trip information unavailable'}
														</Typography>
														{post && (
															<div className="join-request-trip-meta">
																<span>
																	<CalendarMonthOutlined />
																	{formatScheduleDate(post.travelDate)}
																</span>
																<span>
																	<PeopleAltOutlined />
																	{post.currentMembers} / {post.maxMembers} travelers
																</span>
															</div>
														)}
													</div>
													{active && (
														<Button component={Link} href={`/community/travel-mate/${postId}`}>
															View Trip Details
														</Button>
													)}
												</header>
												<div className="join-request-cards">
													{requests.map((request) => {
														const member = request.memberData;
														const name = member?.memberFullName || member?.memberNick;
														const badge = statuses[request.joinStatus];
														const pending = request.joinStatus === TravelMateJoinStatus.PENDING;
														const canManage = active && post?.memberId === userId;
														return (
															<Paper
																component="article"
																variant="outlined"
																className="join-request-card"
																key={request._id}
															>
																<Avatar src={packageImageUrl(member?.memberImage)} alt={name}>
																	{name?.slice(0, 1).toUpperCase()}
																</Avatar>
																<div className="join-request-content">
																	<div className="join-request-person">
																		<Typography component="h3">{name ?? 'Member profile unavailable'}</Typography>
																		<Chip size="small" variant="outlined" color={badge.color} label={badge.label} />
																	</div>
																	{member?.memberFullName && member.memberNick && (
																		<Typography color="text.secondary" variant="body2">
																			@{member.memberNick}
																		</Typography>
																	)}
																	<Typography variant="caption" color="text.secondary">
																		Requested: {formatScheduleDate(request.createdAt)}
																	</Typography>
																	{request.message && (
																		<Typography className="join-request-message">{request.message}</Typography>
																	)}
																	{pending && !active && (
																		<Typography variant="caption" color="text.secondary">
																			This trip is no longer open for request management.
																		</Typography>
																	)}
																</div>
																{pending && canManage && (
																	<div className="join-request-actions">
																		<Button
																			color="error"
																			disabled={Boolean(busyId)}
																			onClick={() => {
																				setActionError('');
																				setDeclining(request);
																			}}
																		>
																			Decline
																		</Button>
																		<Button
																			variant="contained"
																			disabled={Boolean(busyId) || !post || post.currentMembers >= post.maxMembers}
																			onClick={() => {
																				void act(request, 'accept');
																			}}
																		>
																			{busyId === request._id
																				? 'Updating…'
																				: post && post.currentMembers >= post.maxMembers
																					? 'Trip full'
																					: 'Accept'}
																		</Button>
																	</div>
																)}
															</Paper>
														);
													})}
												</div>
											</section>
										);
									})
								)}
							</div>
							{!loading && !error && total > LIMIT && (
								<Pagination
									className="my-bookings-pagination"
									color="primary"
									page={page}
									count={Math.ceil(total / LIMIT)}
									disabled={Boolean(busyId)}
									onChange={(_, value) => setPage(value)}
								/>
							)}
						</>
					)}
				</div>
			</div>
			<Dialog
				open={Boolean(declining)}
				onClose={() => {
					if (!busyId) setDeclining(null);
				}}
				fullWidth
				maxWidth="xs"
				aria-labelledby="decline-request-title"
			>
				<DialogTitle id="decline-request-title">Decline this request?</DialogTitle>
				<DialogContent>
					<Typography>The request will remain in your history as rejected.</Typography>
				</DialogContent>
				<DialogActions>
					<Button disabled={Boolean(busyId)} onClick={() => setDeclining(null)}>
						Keep Request
					</Button>
					<Button
						color="error"
						variant="contained"
						disabled={Boolean(busyId)}
						onClick={() => {
							if (declining) void act(declining, 'decline');
						}}
					>
						{busyId ? 'Declining…' : 'Decline'}
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
}
