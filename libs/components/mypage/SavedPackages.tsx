import { currentUserVar } from '@/apollo/store';
import { TOGGLE_SAVED_PACKAGE } from '@/apollo/user/mutation';
import { GET_MY_PROFILE, GET_SAVED_PACKAGES, type SavedPackageItem } from '@/apollo/user/query';
import { PackageStatus } from '@/libs/enums/package.enum';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import BookmarkBorder from '@mui/icons-material/BookmarkBorder';
import Search from '@mui/icons-material/Search';
import {
	Alert,
	Avatar,
	Breadcrumbs,
	Button,
	InputAdornment,
	Pagination,
	Paper,
	Skeleton,
	TextField,
	Typography,
} from '@mui/material';
import Link from 'next/link';
import { useRef, useState } from 'react';
import PackageCard from '../package/PackageCard';
import { packageImageUrl } from '../package/PackageImage';
import ProfileSidebar from './ProfileSidebar';
const LIMIT = 6;
export default function SavedPackages() {
	const user = useReactiveVar(currentUserVar);
	return <SavedList key={user?._id ?? 'guest'} authenticated={Boolean(user)} />;
}
function SavedProfile({ authenticated }: { authenticated: boolean }) {
	const { data, loading, error, refetch } = useQuery(GET_MY_PROFILE, { skip: !authenticated, fetchPolicy: 'no-cache' });
	const member = data?.getMyProfile;
	if (!authenticated) return null;
	return (
		<Paper className="saved-profile-card" variant="outlined">
			{loading ? (
				<>
					<Skeleton variant="circular" width={64} height={64} />
					<Skeleton width="70%" />
				</>
			) : error ? (
				<Button
					onClick={() => {
						void refetch().catch(() => undefined);
					}}
				>
					Retry profile
				</Button>
			) : (
				member && (
					<>
						<Avatar src={packageImageUrl(member.memberImage)} alt={member.memberFullName || member.memberNick}>
							{(member.memberFullName || member.memberNick).slice(0, 1).toUpperCase()}
						</Avatar>
						<Typography component="h2">{member.memberFullName || member.memberNick}</Typography>
						{(member.memberCity || member.memberCountry) && (
							<Typography color="text.secondary">
								{[member.memberCity, member.memberCountry].filter(Boolean).join(', ')}
							</Typography>
						)}
					</>
				)
			)}
		</Paper>
	);
}
function SavedList({ authenticated }: { authenticated: boolean }) {
	const [page, setPage] = useState(1);
	const [busy, setBusy] = useState(false);
	const lock = useRef(false);
	const [message, setMessage] = useState('');
	const { data, loading, error, refetch } = useQuery(GET_SAVED_PACKAGES, {
		variables: { input: { page, limit: LIMIT } },
		skip: !authenticated,
		fetchPolicy: 'no-cache',
		notifyOnNetworkStatusChange: true,
	});
	const [toggle] = useMutation(TOGGLE_SAVED_PACKAGE);
	const result = data?.getFavorities;
	const total = result?.metaCounter?.[0]?.total ?? 0;
	async function remove(item: SavedPackageItem) {
		if (lock.current) return;
		lock.current = true;
		setBusy(true);
		setMessage('');
		try {
			await toggle({ variables: { packageId: item._id } });
		} catch (failure) {
			setMessage(failure instanceof Error ? failure.message : 'Unable to remove saved package.');
		} finally {
			try {
				const fresh = await refetch();
				const last = Math.max(1, Math.ceil((fresh.data.getFavorities.metaCounter?.[0]?.total ?? 0) / LIMIT));
				if (page > last) setPage(last);
			} catch {
				/* Query errors render separately. */
			}
			lock.current = false;
			setBusy(false);
		}
	}
	return (
		<div className="my-bookings-page saved-packages-page">
			<Breadcrumbs separator="›" className="my-bookings-breadcrumb">
				<Link href="/">Home</Link>
				<Link href="/mypage">My Profile</Link>
				<span aria-current="page">Saved</span>
			</Breadcrumbs>
			<div className="my-bookings-layout">
				<ProfileSidebar active="Saved" profileCard={<SavedProfile authenticated={authenticated} />} />
				<div className="saved-packages-main">
					<header className="saved-packages-header">
						<Typography component="h1">Saved Packages</Typography>
						<Typography color="text.secondary">Keep track of the travel packages you want to explore later.</Typography>
						{authenticated && loading ? (
							<Skeleton width={180} height={36} />
						) : (
							authenticated &&
							!error &&
							result && (
								<div className="saved-count">
									<BookmarkBorder fontSize="small" />
									{total} SAVED {total === 1 ? 'PACKAGE' : 'PACKAGES'}
								</div>
							)
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
							Log in to view your saved packages.
						</Alert>
					) : (
						<>
							<Paper className="saved-toolbar" variant="outlined">
								<TextField
									disabled
									size="small"
									className="saved-search"
									placeholder="Search saved packages..."
									slotProps={{
										htmlInput: { 'aria-label': 'Search saved packages (not available)' },
										input: {
											startAdornment: (
												<InputAdornment position="start">
													<Search fontSize="small" />
												</InputAdornment>
											),
										},
									}}
								/>
								{loading ? (
									<Skeleton width={180} />
								) : (
									<Typography variant="body2" className="saved-sort">
										<span>Sort by:</span> Newest Saved
									</Typography>
								)}
							</Paper>
							{message && (
								<Alert severity="error" className="saved-feedback">
									{message}
								</Alert>
							)}
							<div aria-busy={loading}>
								{loading ? (
									<div className="saved-packages-grid">
										{Array.from({ length: 6 }, (_, i) => (
											<Paper className="saved-skeleton" key={i} aria-hidden="true">
												<Skeleton variant="rectangular" height={192} />
												<div>
													<Skeleton height={30} />
													<Skeleton height={50} />
													<Skeleton width="70%" />
													<Skeleton height={60} />
												</div>
											</Paper>
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
										Unable to load saved packages. {error.message}
									</Alert>
								) : !result?.list.length ? (
									<Paper className="saved-empty" variant="outlined">
										<BookmarkBorder />
										<Typography component="h2">
											{total > 0 ? 'Saved packages could not be displayed.' : 'No saved packages yet.'}
										</Typography>
										<Typography color="text.secondary">
											{total > 0
												? 'The API returned a saved count but no packages on this page.'
												: 'Save packages you like and they’ll appear here.'}
										</Typography>
										<Button component={Link} href="/package" variant="contained">
											Browse Packages
										</Button>
									</Paper>
								) : (
									<div className="saved-packages-grid">
										{result.list.map((item) => {
											const unavailable = item.packageStatus !== PackageStatus.ACTIVE || Boolean(item.deletedAt);
											return (
												<PackageCard
													key={item._id}
													item={item}
													favoriteAction={{
														active: true,
														onToggle: () => {
															void remove(item);
														},
														disabled: busy || unavailable,
														unavailable,
													}}
												/>
											);
										})}
									</div>
								)}
							</div>
							{!loading && !error && total > LIMIT && (
								<Pagination
									className="my-bookings-pagination"
									color="primary"
									count={Math.ceil(total / LIMIT)}
									page={page}
									disabled={busy}
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
