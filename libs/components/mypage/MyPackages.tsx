import { currentUserVar } from '@/apollo/store';
import { GET_AGENT, GET_MY_PROFILE, GET_MY_TRAVEL_PACKAGES } from '@/apollo/user/query';
import { MemberType } from '@/libs/enums/member.enum';
import { PackageStatus } from '@/libs/enums/package.enum';
import { useQuery, useReactiveVar } from '@apollo/client';
import Add from '@mui/icons-material/Add';
import Star from '@mui/icons-material/Star';
import {
	Alert,
	Breadcrumbs,
	Button,
	Chip,
	MenuItem,
	Pagination,
	Paper,
	Skeleton,
	TextField,
	Typography,
} from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import PackageImage from '../package/PackageImage';
import AgentProfileCard from './AgentProfileCard';
import ProfileSidebar from './ProfileSidebar';

const LIMIT = 6;
const statuses = [PackageStatus.ACTIVE, PackageStatus.SOLD, PackageStatus.HIDDEN, PackageStatus.EXPIRED];
const sorts = [
	{ value: 'newest', label: 'Newest', sort: 'createdAt', direction: 'DESC' as const },
	{ value: 'oldest', label: 'Oldest', sort: 'createdAt', direction: 'ASC' as const },
	{ value: 'price-high', label: 'Price: High to Low', sort: 'packagePrice', direction: 'DESC' as const },
	{ value: 'price-low', label: 'Price: Low to High', sort: 'packagePrice', direction: 'ASC' as const },
];
const statusColors: Record<PackageStatus, 'success' | 'info' | 'default' | 'warning' | 'error'> = {
	ACTIVE: 'success',
	SOLD: 'info',
	HIDDEN: 'default',
	EXPIRED: 'warning',
	DELETED: 'error',
};
function AgentPackages({ memberId }: { memberId: string }) {
	const router = useRouter();
	const [page, setPage] = useState(1);
	const [status, setStatus] = useState<PackageStatus>();
	const [sortKey, setSortKey] = useState('newest');
	const sort = sorts.find((option) => option.value === sortKey) ?? sorts[0];
	const query = useQuery(GET_MY_TRAVEL_PACKAGES, {
		variables: {
			input: {
				page,
				limit: LIMIT,
				sort: sort.sort,
				direction: sort.direction,
				search: status ? { packageStatus: status } : {},
			},
		},
		fetchPolicy: 'no-cache',
		notifyOnNetworkStatusChange: true,
	});
	const profile = useQuery(GET_MY_PROFILE, { fetchPolicy: 'no-cache' });
	const member = profile.data?.getMyProfile._id === memberId ? profile.data.getMyProfile : undefined;
	const agentId = member?.agentData?._id;
	const agentQuery = useQuery(GET_AGENT, {
		variables: { agentId: agentId ?? '' },
		skip: !agentId,
		fetchPolicy: 'no-cache',
	});
	const agent = agentQuery.data?.getAgent?.memberId === memberId ? agentQuery.data.getAgent : undefined;
	const result = query.data?.getMyTravelPackages;
	const total = result?.metaCounter?.[0]?.total ?? 0;
	return (
		<div className="my-bookings-layout">
			<ProfileSidebar
				active="My Packages"
				profileCard={<AgentProfileCard member={member} agent={agent} loading={profile.loading} />}
			/>
			<div className="my-packages-main">
				<header className="my-packages-heading">
					<div>
						<Typography component="h1">My Packages</Typography>
						<Typography color="text.secondary">Manage the travel packages you offer on WWT.</Typography>
					</div>
					<Button
						component={Link}
						href="/mypage/packages/create"
						variant="contained"
						startIcon={<Add />}
						className="my-packages-create"
					>
						Create New Package
					</Button>
				</header>
				{router.query.created === '1' && (
					<Alert
						severity="success"
						onClose={() => {
							void router.replace('/mypage/packages', undefined, { shallow: true });
						}}
					>
						Package created successfully.
					</Alert>
				)}
				{(profile.error || agentQuery.error) && (
					<Alert
						severity="error"
						action={
							<Button
								onClick={() => {
									void profile.refetch().catch(() => undefined);
									if (agentId) void agentQuery.refetch().catch(() => undefined);
								}}
							>
								Retry
							</Button>
						}
					>
						Profile information could not be loaded.
					</Alert>
				)}
				<Paper className="my-packages-toolbar">
					<div className="my-packages-filters" role="group" aria-label="Package status">
						<Chip
							label="All"
							clickable
							color={!status ? 'primary' : 'default'}
							variant={!status ? 'filled' : 'outlined'}
							aria-pressed={!status}
							onClick={() => {
								setStatus(undefined);
								setPage(1);
							}}
						/>
						{statuses.map((value) => (
							<Chip
								key={value}
								label={value.charAt(0) + value.slice(1).toLowerCase()}
								clickable
								color={status === value ? 'primary' : 'default'}
								variant={status === value ? 'filled' : 'outlined'}
								aria-pressed={status === value}
								onClick={() => {
									setStatus(value);
									setPage(1);
								}}
							/>
						))}
					</div>
					<TextField
						select
						size="small"
						label="Sort by"
						value={sortKey}
						onChange={(event) => {
							setSortKey(event.target.value);
							setPage(1);
						}}
					>
						{sorts.map((option) => (
							<MenuItem key={option.value} value={option.value}>
								{option.label}
							</MenuItem>
						))}
					</TextField>
				</Paper>
				<div aria-busy={query.loading}>
					{query.loading ? (
						<div className="my-packages-list" aria-label="Loading packages">
							{Array.from({ length: LIMIT }, (_, i) => (
								<Paper className="my-package-card" key={i}>
									<Skeleton variant="rounded" className="my-package-image" />
									<div className="my-package-content">
										<Skeleton width="70%" height={35} />
										<Skeleton width="50%" />
										<Skeleton height={80} />
									</div>
								</Paper>
							))}
						</div>
					) : query.error ? (
						<Alert
							severity="error"
							action={
								<Button
									onClick={() => {
										void query.refetch().catch(() => undefined);
									}}
								>
									Retry
								</Button>
							}
						>
							Your packages could not be loaded.
						</Alert>
					) : !result?.list.length ? (
						<Paper className="my-packages-empty">No packages found.</Paper>
					) : (
						<>
							<Typography className="my-packages-total" role="status">
								{total} packages
							</Typography>
							<div className="my-packages-list">
								{result.list.map((item) => (
									<Paper
										component="article"
										className="my-package-card"
										key={item._id}
										onClick={() => {
											void router.push(`/package/${item._id}`);
										}}
										role="link"
										tabIndex={0}
									>
										<div className="my-package-image">
											<PackageImage path={item.packageImages?.[0]} alt={item.packageTitle} />
											<Chip
												className="my-package-status"
												size="small"
												color={statusColors[item.packageStatus]}
												label={item.packageStatus.charAt(0) + item.packageStatus.slice(1).toLowerCase()}
											/>
										</div>
										<div className="my-package-content">
											<Typography component="h2">{item.packageTitle}</Typography>
											<Typography color="text.secondary">
												{[item.destinationCity, item.destinationCountry].filter(Boolean).join(', ')}
											</Typography>
											<div className="my-package-details">
												<span>
													{item.packageDays} Days / {item.packageNights} Nights
												</span>
												<strong>
													{item.currency} {item.packagePrice.toLocaleString('en-US')}
												</strong>
											</div>
											<div className="my-package-metrics">
												<span>{item.packageBookingCount} bookings</span>
												<span>{item.packageViewCount} views</span>
												<span>
													<Star fontSize="small" />
													{item.packageRating} rating
												</span>
											</div>
											<div className="my-package-actions">
															<Button
																			variant="outlined"
																			size="small"
																			onClick={(event) => {
																							event.stopPropagation();

																							void router.push({
																											pathname: '/mypage/packages',
																											query: {
																															edit: item._id,
																											},
																							});
																			}}
															>
																			Edit
															</Button>
											</div>
										</div>
									</Paper>
								))}
							</div>
						</>
					)}
				</div>
				{!query.loading && !query.error && total > LIMIT && (
					<Pagination
						color="primary"
						className="my-packages-pagination"
						page={page}
						count={Math.ceil(total / LIMIT)}
						onChange={(_, value) => setPage(value)}
					/>
				)}
			</div>
		</div>
	);
}
export default function MyPackages() {
	const user = useReactiveVar(currentUserVar);
	return (
		<div className="my-bookings-page agent-dashboard-page my-packages-page">
			<Breadcrumbs separator="/" className="my-bookings-breadcrumb">
				<Link href="/">Home</Link>
				<Link href="/mypage">My Profile</Link>
				<span aria-current="page">My Packages</span>
			</Breadcrumbs>
			{!user?._id ? (
				<Alert
					severity="info"
					action={
						<Button component={Link} href="/account/login">
							Login
						</Button>
					}
				>
					Log in to view your packages.
				</Alert>
			) : user.memberType !== MemberType.AGENT ? (
				<Alert
					severity="warning"
					action={
						<Button component={Link} href="/mypage">
							My Profile
						</Button>
					}
				>
					Only agent members can access My Packages.
				</Alert>
			) : (
				<AgentPackages key={user._id} memberId={user._id} />
			)}
		</div>
	);
}
