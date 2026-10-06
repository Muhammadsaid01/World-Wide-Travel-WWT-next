import { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { currentUserVar } from '@/apollo/store';
import { GET_MY_TRAVEL_MATES, type MyTravelMateItem, type MyTravelMatesInput } from '@/apollo/user/query';
import { DELETE_TRAVEL_MATE_POST } from '@/apollo/user/mutation';
import { TravelMatePostStatus } from '@/libs/enums/community.enum';
import {
	Alert,
	Breadcrumbs,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	InputAdornment,
	LinearProgress,
	IconButton,
	Menu,
	MenuItem,
	Pagination,
	Paper,
	Skeleton,
	TextField,
	Typography,
} from '@mui/material';
import MoreVert from '@mui/icons-material/MoreVert';
import Add from '@mui/icons-material/Add';
import Search from '@mui/icons-material/Search';
import CalendarMonthOutlined from '@mui/icons-material/CalendarMonthOutlined';
import PeopleAltOutlined from '@mui/icons-material/PeopleAltOutlined';
import EditOutlined from '@mui/icons-material/EditOutlined';
import GroupOutlined from '@mui/icons-material/GroupOutlined';
import ProfileSidebar from './ProfileSidebar';
import { formatScheduleDate } from '../package/PackageSchedules';

// Match the existing My Articles list size; this API has no default limit.
const LIMIT = 6;
const labels: Record<TravelMatePostStatus, string> = {
	ACTIVE: 'Open',
	FULL: 'Full',
	CLOSED: 'Closed',
	DELETED: 'Deleted',
};
export default function MyTravelMates() {
	const user = useReactiveVar(currentUserVar);
	return <TravelMateList key={user?._id ?? 'guest'} userId={user?._id} />;
}
function TravelMateList({ userId }: { userId?: string }) {
	const [page, setPage] = useState(1);
	const [status, setStatus] = useState<TravelMatePostStatus>();
	const [draft, setDraft] = useState('');
	const [search, setSearch] = useState('');
	const [oldest, setOldest] = useState(false);
	const [actionMenu, setActionMenu] = useState<{ anchor: HTMLElement; post: MyTravelMateItem } | null>(null);
	const [deleting, setDeleting] = useState<MyTravelMateItem | null>(null);
	const [deleteError, setDeleteError] = useState('');
	const input: MyTravelMatesInput = {
		page,
		limit: LIMIT,
		sort: 'createdAt',
		direction: oldest ? 'ASC' : 'DESC',
		search: {
			matePostStatus: status,
			// Backend uses a regular expression. Escape user text for literal title search.
			text: search ? search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : undefined,
		},
	};
	const { data, loading, error, refetch } = useQuery(GET_MY_TRAVEL_MATES, {
		variables: { input },
		skip: !userId,
		fetchPolicy: 'no-cache',
		notifyOnNetworkStatusChange: true,
	});
	const [deletePost, { loading: removing }] = useMutation(DELETE_TRAVEL_MATE_POST);
	const result = data?.getMyTravelMatePosts;
	const total = result?.metaCounter?.[0]?.total ?? 0;
	const reset = () => {
		setStatus(undefined);
		setDraft('');
		setSearch('');
		setPage(1);
	};
	async function confirmDelete() {
		if (!deleting || removing) return;
		setDeleteError('');
		try {
			await deletePost({ variables: { postId: deleting._id } });
			setDeleting(null);
			if (result?.list.length === 1 && page > 1) setPage(page - 1);
			else await refetch();
		} catch (failure) {
			setDeleteError(failure instanceof Error ? failure.message : 'The post could not be deleted. Please retry.');
		}
	}
	return (
		<div className="my-bookings-page my-travel-mates-page">
			<Breadcrumbs separator="›" className="my-bookings-breadcrumb">
				<Link href="/">Home</Link>
				<Link href="/mypage">My Profile</Link>
				<span aria-current="page">My Travel Mates</span>
			</Breadcrumbs>
			<div className="my-bookings-layout">
				<ProfileSidebar active="My Travel Mates" />
				<div className="my-travel-mates-main">
					<header className="my-travel-mates-header">
						<div>
							<Typography component="h1">My Travel Mates</Typography>
							<Typography color="text.secondary">
								Manage the trips you&apos;ve created and find travelers to join your adventures.
							</Typography>
						</div>
						<Button component={Link} href="/mypage/travel-mates/create" variant="contained" startIcon={<Add />}>
							Create Travel Mate
						</Button>
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
							Log in to view your travel mates.
						</Alert>
					) : (
						<>
							<div className="my-travel-mates-toolbar">
								<div className="my-bookings-tabs" role="group" aria-label="Travel mate status">
									<Button
										className={!status ? 'is-active' : ''}
										aria-pressed={!status}
										onClick={() => {
											setStatus(undefined);
											setPage(1);
										}}
									>
										All
									</Button>
									{[TravelMatePostStatus.ACTIVE, TravelMatePostStatus.FULL, TravelMatePostStatus.CLOSED].map(
										(value) => (
											<Button
												key={value}
												className={status === value ? 'is-active' : ''}
												aria-pressed={status === value}
												onClick={() => {
													setStatus(value);
													setPage(1);
												}}
											>
												{labels[value]}
											</Button>
										),
									)}
								</div>
								<form
									onSubmit={(event) => {
										event.preventDefault();
										setSearch(draft.trim());
										setPage(1);
									}}
								>
									<TextField
										size="small"
										fullWidth
										placeholder="Search trips..."
										value={draft}
										onChange={(event) => setDraft(event.target.value)}
										slotProps={{
											htmlInput: { 'aria-label': 'Search trip titles; press Enter' },
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
									value={oldest ? 'oldest' : 'newest'}
									onChange={(event) => {
										setOldest(event.target.value === 'oldest');
										setPage(1);
									}}
									slotProps={{ htmlInput: { 'aria-label': 'Sort trips' } }}
								>
									<MenuItem value="newest">Newest</MenuItem>
									<MenuItem value="oldest">Oldest</MenuItem>
								</TextField>
							</div>
							{!loading && !error && result && (
								<Typography className="my-travel-mates-count" role="status">
									{total} {status || search ? 'matching posts' : 'posts total'}
								</Typography>
							)}
							<div className="my-travel-mates-list" aria-busy={loading}>
								{loading ? (
									<>
										<Skeleton variant="rounded" height={44} />
										{Array.from({ length: 3 }, (_, index) => (
											<Paper className="my-travel-mate-card" key={index} aria-hidden="true">
												<div className="my-travel-mate-info">
													<Skeleton width="35%" />
													<Skeleton height={42} />
													<Skeleton width="65%" />
													<Skeleton height={30} />
												</div>
											</Paper>
										))}
									</>
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
										Travel mates could not be loaded. {error.message}
									</Alert>
								) : !result?.list.length ? (
									<Paper variant="outlined" className="my-travel-mates-empty">
										<Typography component="h2">
											{status || search ? 'No travel mates match these filters.' : 'No Travel Mates Found'}
										</Typography>
										{status || search ? (
											<Button onClick={reset}>Reset filters</Button>
										) : (
											<Typography color="text.secondary">
												You haven&apos;t created any travel mate posts yet.
											</Typography>
										)}
									</Paper>
								) : (
								result.list.map((post) => {
									const progress =
											post.maxMembers > 0
												? Math.max(0, Math.min((post.currentMembers / post.maxMembers) * 100, 100))
												: 0;
										return (
											<Paper
												component="article"
												variant="outlined"
												className={`my-travel-mate-card is-${post.matePostStatus.toLowerCase()}`}
												key={post._id}
											>
												<div className="my-travel-mate-info">
													<div className="my-travel-mate-meta">
														<span className="my-travel-mate-status">
															{post.matePostStatus === TravelMatePostStatus.ACTIVE && post.currentMembers >= post.maxMembers
																? 'Full'
																: labels[post.matePostStatus]}
														</span>
														<span>{[post.destinationCity, post.destinationCountry].filter(Boolean).join(', ')}</span>
													</div>
													<Typography component="h2">{post.matePostTitle}</Typography>
													<div className="my-travel-mate-details">
														<span>
															<CalendarMonthOutlined />
															{formatScheduleDate(post.travelDate)}
														</span>
														<div>
															<PeopleAltOutlined />
															{post.currentMembers} / {post.maxMembers} Travelers
															<LinearProgress
																variant="determinate"
																value={progress}
																aria-label="Traveler capacity"
																aria-valuetext={`${post.currentMembers} of ${post.maxMembers} travelers`}
															/>
														</div>
													</div>
												</div>
												{post.memberId === userId && (
													<div className="my-travel-mate-actions">
												{post.matePostStatus === TravelMatePostStatus.ACTIVE && (
													<Button component={Link} href={`/community/travel-mate/${post._id}`} variant="outlined">
														View Details
													</Button>
												)}
												{post.matePostStatus === TravelMatePostStatus.ACTIVE && (
													<Button
														component={Link}
														href={`/mypage/travel-mates/${post._id}/edit`}
														startIcon={<EditOutlined />}
													>
														Edit
													</Button>
												)}
												<Button
													component={Link}
													href={`/mypage/join-requests?postId=${post._id}`}
													startIcon={<GroupOutlined />}
												>
													Requests
												</Button>
														<IconButton
															aria-label={`More actions for ${post.matePostTitle}`}
															aria-haspopup="menu"
															aria-expanded={actionMenu?.post._id === post._id ? true : undefined}
															onClick={(event) => setActionMenu({ anchor: event.currentTarget, post })}
														>
															<MoreVert />
														</IconButton>
													</div>
												)}
											</Paper>
										);
									})
								)}
							</div>
							{!loading && !error && total > LIMIT && (
								<Pagination
									className="my-bookings-pagination"
									color="primary"
									count={Math.ceil(total / LIMIT)}
									page={page}
									onChange={(_, value) => setPage(value)}
								/>
							)}
						</>
					)}
				</div>
			</div>
			<Menu anchorEl={actionMenu?.anchor} open={Boolean(actionMenu)} onClose={() => setActionMenu(null)}>
				<MenuItem
					onClick={() => {
						if (actionMenu) {
							setDeleteError('');
							setDeleting(actionMenu.post);
							setActionMenu(null);
						}
					}}
					sx={{ color: 'error.main' }}
				>
					Delete
				</MenuItem>
			</Menu>
			<Dialog
				open={Boolean(deleting)}
				onClose={() => {
					if (!removing) setDeleting(null);
				}}
				fullWidth
				maxWidth="xs"
				aria-labelledby="delete-travel-mate-title"
			>
				<DialogTitle id="delete-travel-mate-title">Delete travel mate post?</DialogTitle>
				<DialogContent>
					<Typography sx={{ overflowWrap: 'anywhere' }}>
						Delete “{deleting?.matePostTitle}”? This cannot be undone.
					</Typography>
					{deleteError && <Alert severity="error">{deleteError}</Alert>}
				</DialogContent>
				<DialogActions>
					<Button disabled={removing} onClick={() => setDeleting(null)}>
						Cancel
					</Button>
					<Button
						color="error"
						variant="contained"
						disabled={removing}
						onClick={() => {
							void confirmDelete();
						}}
					>
						{removing ? 'Deleting…' : 'Delete'}
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
}
