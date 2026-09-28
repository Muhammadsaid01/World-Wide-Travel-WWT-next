import { useRef, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { Alert, Avatar, Breadcrumbs, Button, Pagination, Paper, Skeleton, Typography } from '@mui/material';
import Check from '@mui/icons-material/Check';
import { currentUserVar } from '@/apollo/store';
import {
	GET_MEMBER_FOLLOWERS,
	GET_MEMBER_FOLLOWINGS,
	GET_CONNECTION_COUNTS,
	type ConnectionItem,
} from '@/apollo/user/query';
import { SUBSCRIBE_MEMBER, UNSUBSCRIBE_MEMBER } from '@/apollo/user/mutation';
import { packageImageUrl } from '../package/PackageImage';
import ProfileSidebar from './ProfileSidebar';

export type FollowConnectionsProps = { type: 'followers' | 'following' };
const LIMIT = 8;
export default function FollowConnections({ type }: FollowConnectionsProps) {
	const user = useReactiveVar(currentUserVar);
	return <Connections key={`${user?._id ?? 'guest'}-${type}`} type={type} userId={user?._id} />;
}
function Connections({ type, userId }: FollowConnectionsProps & { userId?: string }) {
	const [page, setPage] = useState(1);
	const pending = useRef(new Set<string>());
	const [busyIds, setBusyIds] = useState<Set<string>>(new Set());
	const [actionError, setActionError] = useState('');
	const followers = useQuery(GET_MEMBER_FOLLOWERS, {
		variables: { input: { page, limit: LIMIT, search: { followingId: userId } } },
		skip: !userId || type !== 'followers',
		fetchPolicy: 'no-cache',
		notifyOnNetworkStatusChange: true,
	});
	const following = useQuery(GET_MEMBER_FOLLOWINGS, {
		variables: { input: { page, limit: LIMIT, search: { followerId: userId } } },
		skip: !userId || type !== 'following',
		fetchPolicy: 'no-cache',
		notifyOnNetworkStatusChange: true,
	});
	const counts = useQuery(GET_CONNECTION_COUNTS, {
		variables: {
			followers: { page: 1, limit: 1, search: { followingId: userId } },
			following: { page: 1, limit: 1, search: { followerId: userId } },
		},
		skip: !userId,
		fetchPolicy: 'no-cache',
		notifyOnNetworkStatusChange: true,
	});
	const [subscribe] = useMutation(SUBSCRIBE_MEMBER);
	const [unsubscribe] = useMutation(UNSUBSCRIBE_MEMBER);
	const query = type === 'followers' ? followers : following;
	const result = type === 'followers' ? followers.data?.getMemberFollowers : following.data?.getMemberFollowings;
	const title = type === 'followers' ? 'Followers' : 'Following';
	const total = result?.metaCounter?.[0]?.total ?? 0;
	async function refresh() {
		const results = await Promise.allSettled([
			type === 'followers' ? followers.refetch() : following.refetch(),
			counts.refetch(),
		]);
		const list = results[0];
		if (list.status === 'fulfilled') {
			const data = list.value.data;
			const fresh = 'getMemberFollowers' in data ? data.getMemberFollowers : data.getMemberFollowings;
			const lastPage = Math.max(1, Math.ceil((fresh.metaCounter?.[0]?.total ?? 0) / LIMIT));
			setPage((current) => Math.min(current, lastPage));
		}
		if (results.some((result) => result.status === 'rejected')) {
			setActionError('Unable to refresh connections. Please retry to see the latest state.');
		}
	}
	async function toggle(item: ConnectionItem) {
		const member = type === 'followers' ? item.followerData : item.followingData;
		if (!userId || !member?._id || member._id === userId || pending.current.has(member._id)) return;
		const id = member._id;
		pending.current.add(id);
		setBusyIds(new Set(pending.current));
		setActionError('');
		try {
			const mutation = (item.meFollowed?.[0]?.myFollowing ?? false) ? unsubscribe : subscribe;
			await mutation({ variables: { input: id } });
			await refresh();
		} catch (failure) {
			setActionError(failure instanceof Error ? failure.message : 'Unable to update this connection.');
		} finally {
			pending.current.delete(id);
			setBusyIds(new Set(pending.current));
		}
	}
	return (
		<div className="my-bookings-page follow-connections-page">
			<Breadcrumbs separator="/" className="my-bookings-breadcrumb">
				<Link href="/">Home</Link>
				<Link href="/mypage">My Profile</Link>
				<span aria-current="page">{title}</span>
			</Breadcrumbs>
			<div className="my-bookings-layout">
				<ProfileSidebar active={title} />
				<div className="follow-connections-main">
					<header className="follow-connections-header">
						<Typography component="h1">{title}</Typography>
						<Typography color="text.secondary">
							{type === 'followers' ? 'People following you on WWT.' : 'People you follow on WWT.'}
						</Typography>
					</header>
					<nav className="follow-connections-tabs" aria-label="Connections">
						{(['followers', 'following'] as const).map((tab) => {
							const countResult =
								tab === 'followers' ? counts.data?.getMemberFollowers : counts.data?.getMemberFollowings;
							const count =
								!counts.loading && !counts.error && countResult
									? (countResult.metaCounter?.[0]?.total ?? 0)
									: undefined;
							return (
								<Button
									component={Link}
									href={`/mypage/${tab}`}
									key={tab}
									className={type === tab ? 'is-active' : undefined}
									aria-current={type === tab ? 'page' : undefined}
								>
									{tab === 'followers' ? 'Followers' : 'Following'}
									{userId && count !== undefined && <span>{count}</span>}
								</Button>
							);
						})}
					</nav>
					{!userId ? (
						<Alert
							severity="info"
							action={
								<Button component={Link} href="/account/login">
									Login
								</Button>
							}
						>
							Log in to view your {type}.
						</Alert>
					) : (
						<>
							{(actionError || counts.error) && (
								<Alert
									className="follow-connections-feedback"
									severity="error"
									action={
										<Button
											onClick={() => {
												setActionError('');
												void refresh();
											}}
										>
											Retry
										</Button>
									}
								>
									{actionError || 'Unable to load connection counts.'}
								</Alert>
							)}
							<div aria-busy={query.loading}>
								{query.error ? (
									<Alert
										severity="error"
										action={
											<Button
												onClick={() => {
													void refresh();
												}}
											>
												Retry
											</Button>
										}
									>
										Unable to load {type}. {query.error.message}
									</Alert>
								) : query.loading && !result ? (
									<Paper className="follow-connections-card" aria-label="Loading connections">
										{Array.from({ length: LIMIT }, (_, index) => (
											<div className="follow-connection-row" key={index} aria-hidden="true">
												<div className="follow-connection-member">
													<Skeleton variant="circular" width={48} height={48} />
													<Skeleton width="60%" height={40} />
												</div>
												<Skeleton width="80%" />
												<Skeleton width={110} height={40} />
											</div>
										))}
									</Paper>
								) : !result?.list.length ? (
									<Paper className="follow-connections-empty">
										<Typography component="h2">
											{type === 'followers' ? 'No followers yet' : 'You aren’t following anyone yet'}
										</Typography>
										<Typography color="text.secondary">
											{type === 'followers'
												? 'People who follow you will appear here.'
												: 'People you follow will appear here.'}
										</Typography>
									</Paper>
								) : (
									<Paper className="follow-connections-card">
										<div className="follow-connection-columns" aria-hidden="true">
											<span>Member</span>
											<span>Details</span>
											<span>Action</span>
										</div>
										<ul className="follow-connections-list">
											{result.list.map((item) => {
												const member = type === 'followers' ? item.followerData : item.followingData;
												const name = member?.memberFullName || member?.memberNick;
												const isFollowing = item.meFollowed?.[0]?.myFollowing ?? false;
												const busy = Boolean(member && busyIds.has(member._id));
												return (
													<li className="follow-connection-row" key={item._id}>
														<div className="follow-connection-member">
															<Avatar src={packageImageUrl(member?.memberImage)} alt={name}>
																{name?.slice(0, 1).toUpperCase()}
															</Avatar>
															<div>
																<Typography component="h2">{name || 'Member profile unavailable'}</Typography>
																{member?.memberNick && (
																	<Typography variant="body2" color="text.secondary">
																		@{member.memberNick}
																	</Typography>
																)}
																{(member?.memberCity || member?.memberCountry) && (
																	<Typography variant="caption" color="text.secondary">
																		{[member.memberCity, member.memberCountry].filter(Boolean).join(', ')}
																	</Typography>
																)}
															</div>
														</div>
														<div className="follow-connection-details">
															{typeof member?.memberFollowerCount === 'number' && (
																<span>
																	<strong>{member.memberFollowerCount}</strong> Followers
																</span>
															)}
															{typeof member?.memberFollowingCount === 'number' && (
																<span>
																	<strong>{member.memberFollowingCount}</strong> Following
																</span>
															)}
														</div>
														<div className="follow-connection-action">
															{member?._id && member._id !== userId && (
																<Button
																	className={isFollowing ? 'is-following' : 'is-follow'}
																	variant={isFollowing ? 'outlined' : 'text'}
																	startIcon={isFollowing ? <Check /> : undefined}
																	disabled={busy}
																	aria-label={`${isFollowing ? 'Unfollow' : 'Follow'} ${name || member.memberNick}`}
																	aria-busy={busy}
																	onClick={() => {
																		void toggle(item);
																	}}
																>
																	{busy ? 'Updating…' : isFollowing ? 'FOLLOWING' : 'FOLLOW'}
																</Button>
															)}
														</div>
													</li>
												);
											})}
										</ul>
									</Paper>
								)}
							</div>
							{!query.error && total > LIMIT && (
								<Pagination
									className="follow-connections-pagination"
									color="primary"
									page={page}
									count={Math.ceil(total / LIMIT)}
									disabled={query.loading || busyIds.size > 0}
									onChange={(_, value) => setPage(value)}
								/>
							)}
						</>
					)}
				</div>
			</div>
		</div>
	);
}
