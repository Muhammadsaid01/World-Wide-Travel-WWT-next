import type { ReactNode } from 'react';
import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { Alert, Button, Chip, Paper, Skeleton, Typography } from '@mui/material';
import ArrowForwardOutlined from '@mui/icons-material/ArrowForwardOutlined';
import ArticleOutlined from '@mui/icons-material/ArticleOutlined';
import AssignmentIndOutlined from '@mui/icons-material/AssignmentIndOutlined';
import EventNoteOutlined from '@mui/icons-material/EventNoteOutlined';
import LuggageOutlined from '@mui/icons-material/LuggageOutlined';
import PeopleOutline from '@mui/icons-material/PeopleOutlined';
import SupportAgentOutlined from '@mui/icons-material/SupportAgentOutlined';
import {
	GET_ADMIN_AGENT_COUNT,
	GET_ADMIN_DASHBOARD_ARTICLES,
	GET_ADMIN_DASHBOARD_BOOKINGS,
	GET_ADMIN_DASHBOARD_PACKAGES,
	GET_ADMIN_MEMBER_COUNT,
} from '@/apollo/admin/query';
import { GET_ALL_AGENT_REQUESTS_BY_ADMIN } from '@/apollo/user/query';
import { AgentRequestStatus } from '@/libs/enums/member.enum';
import { formatScheduleDate } from '../package/PackageSchedules';

const RECENT_LIMIT = 4;

function totalFrom(metaCounter?: Array<{ total?: number | null }> | null) {
	return metaCounter?.[0]?.total ?? 0;
}

function enumLabel(value: string) {
	return value
		.toLowerCase()
		.split('_')
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(' ');
}

function formatMoney(value: number, currency: string) {
	const code = currency.trim().toUpperCase();
	try {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: code,
			maximumFractionDigits: 2,
		}).format(value);
	} catch {
		return `${value.toLocaleString('en-US')} ${code}`.trim();
	}
}

function MetricCard({
	label,
	icon,
	loading,
	error,
	value,
	onRetry,
}: {
	label: string;
	icon: ReactNode;
	loading: boolean;
	error: boolean;
	value?: number;
	onRetry: () => void;
}) {
	return (
		<Paper component="article" className="admin-dashboard-kpi" elevation={0} aria-busy={loading}>
			<div className="admin-dashboard-kpi-icon" aria-hidden="true">
				{icon}
			</div>
			<div>
				<Typography>{label}</Typography>
				{loading ? (
					<Skeleton width={84} height={48} />
				) : error ? (
					<div className="admin-dashboard-kpi-error">
						<strong>Unavailable</strong>
						<Button size="small" onClick={onRetry}>
							Retry
						</Button>
					</div>
				) : (
					<strong className="admin-dashboard-kpi-value">{value ?? 0}</strong>
				)}
			</div>
		</Paper>
	);
}

function RecentSection({
	title,
	description,
	loading,
	error,
	empty,
	onRetry,
	action,
	children,
}: {
	title: string;
	description: string;
	loading: boolean;
	error: boolean;
	empty: boolean;
	onRetry: () => void;
	action?: ReactNode;
	children: ReactNode;
}) {
	return (
		<Paper component="section" className="admin-dashboard-section" elevation={0} aria-busy={loading}>
			<header className="admin-dashboard-section-header">
				<div>
					<Typography component="h2">{title}</Typography>
					<Typography>{description}</Typography>
				</div>
				{action}
			</header>

			{loading ? (
				<div className="admin-dashboard-section-skeleton" aria-label={`Loading ${title.toLowerCase()}`}>
					{Array.from({ length: 3 }, (_, index) => (
						<Skeleton key={index} variant="rounded" height={78} />
					))}
				</div>
			) : error ? (
				<Alert severity="error" action={<Button onClick={onRetry}>Retry</Button>}>
					{title} could not be loaded.
				</Alert>
			) : empty ? (
				<div className="admin-dashboard-empty">
					<Typography>No records are available.</Typography>
				</div>
			) : (
				children
			)}
		</Paper>
	);
}

export default function AdminHome() {
	const membersQuery = useQuery(GET_ADMIN_MEMBER_COUNT, {
		variables: { input: { page: 1, limit: 1 } },
		fetchPolicy: 'no-cache',
		notifyOnNetworkStatusChange: true,
	});
	const agentsQuery = useQuery(GET_ADMIN_AGENT_COUNT, {
		variables: { input: { page: 1, limit: 1 } },
		fetchPolicy: 'no-cache',
		notifyOnNetworkStatusChange: true,
	});
	const requestsQuery = useQuery(GET_ALL_AGENT_REQUESTS_BY_ADMIN, {
		variables: {
			input: {
				page: 1,
				limit: RECENT_LIMIT,
				sort: 'createdAt',
				direction: 'DESC',
				search: { requestStatus: AgentRequestStatus.PENDING },
			},
		},
		fetchPolicy: 'no-cache',
		notifyOnNetworkStatusChange: true,
	});
	const bookingsQuery = useQuery(GET_ADMIN_DASHBOARD_BOOKINGS, {
		variables: {
			input: { page: 1, limit: RECENT_LIMIT, sort: 'createdAt', direction: 'DESC' },
		},
		fetchPolicy: 'no-cache',
		notifyOnNetworkStatusChange: true,
	});
	const packagesQuery = useQuery(GET_ADMIN_DASHBOARD_PACKAGES, {
		variables: {
			input: { page: 1, limit: RECENT_LIMIT, sort: 'createdAt', direction: 'DESC', search: {} },
		},
		fetchPolicy: 'no-cache',
		notifyOnNetworkStatusChange: true,
	});
	const articlesQuery = useQuery(GET_ADMIN_DASHBOARD_ARTICLES, {
		variables: {
			input: { page: 1, limit: RECENT_LIMIT, sort: 'createdAt', direction: 'DESC', search: {} },
		},
		fetchPolicy: 'no-cache',
		notifyOnNetworkStatusChange: true,
	});

	const requestsResult = requestsQuery.data?.getAllAgentRequestsByAdmin;
	const bookingsResult = bookingsQuery.data?.getAllBookingsByAdmin;
	const packagesResult = packagesQuery.data?.getAllTravelPackagesByAdmin;
	const articlesResult = articlesQuery.data?.getAllBoardArticlesByAdmin;

	const metrics = [
		{
			label: 'Total Members',
			icon: <PeopleOutline />,
			loading: membersQuery.loading && !membersQuery.data,
			error: Boolean(membersQuery.error),
			onRetry: () => void membersQuery.refetch().catch(() => undefined),
			value: membersQuery.data ? totalFrom(membersQuery.data.getAllMembersByAdmin.metaCounter) : undefined,
		},
		{
			label: 'Total Agents',
			icon: <SupportAgentOutlined />,
			loading: agentsQuery.loading && !agentsQuery.data,
			error: Boolean(agentsQuery.error),
			onRetry: () => void agentsQuery.refetch().catch(() => undefined),
			value: agentsQuery.data ? totalFrom(agentsQuery.data.getAllAgentsByAdmin.metaCounter) : undefined,
		},
		{
			label: 'Pending Agent Requests',
			icon: <AssignmentIndOutlined />,
			loading: requestsQuery.loading && !requestsQuery.data,
			error: Boolean(requestsQuery.error),
			onRetry: () => void requestsQuery.refetch().catch(() => undefined),
			value: requestsResult ? totalFrom(requestsResult.metaCounter) : undefined,
		},
		{
			label: 'Total Packages',
			icon: <LuggageOutlined />,
			loading: packagesQuery.loading && !packagesQuery.data,
			error: Boolean(packagesQuery.error),
			onRetry: () => void packagesQuery.refetch().catch(() => undefined),
			value: packagesResult ? totalFrom(packagesResult.metaCounter) : undefined,
		},
		{
			label: 'Total Bookings',
			icon: <EventNoteOutlined />,
			loading: bookingsQuery.loading && !bookingsQuery.data,
			error: Boolean(bookingsQuery.error),
			onRetry: () => void bookingsQuery.refetch().catch(() => undefined),
			value: bookingsResult ? totalFrom(bookingsResult.metaCounter) : undefined,
		},
		{
			label: 'Total Articles',
			icon: <ArticleOutlined />,
			loading: articlesQuery.loading && !articlesQuery.data,
			error: Boolean(articlesQuery.error),
			onRetry: () => void articlesQuery.refetch().catch(() => undefined),
			value: articlesResult ? totalFrom(articlesResult.metaCounter) : undefined,
		},
	];

	return (
		<div className="admin-dashboard-page">
			<header className="admin-page-header">
				<div>
					<Typography className="admin-page-kicker">Administration</Typography>
					<Typography component="h1">Dashboard</Typography>
					<Typography>Monitor WWT membership, operations, and community activity from real platform data.</Typography>
				</div>
			</header>

			<section className="admin-dashboard-kpis" aria-label="Platform totals">
				{metrics.map(({ label, icon, loading, error, onRetry, value }) => (
					<MetricCard
						key={label}
						label={label}
						icon={icon}
						loading={loading}
						error={error}
						value={value}
						onRetry={onRetry}
					/>
				))}
			</section>

			<div className="admin-dashboard-sections">
				<RecentSection
					title="Pending Agent Requests"
					description="Newest agency applications awaiting review."
					loading={requestsQuery.loading && !requestsQuery.data}
					error={Boolean(requestsQuery.error)}
					empty={Boolean(requestsResult && requestsResult.list.length === 0)}
					onRetry={() => void requestsQuery.refetch().catch(() => undefined)}
					action={
						<Button component={Link} href="/admin/agent-requests" endIcon={<ArrowForwardOutlined />}>
							View All
						</Button>
					}
				>
					<div className="admin-dashboard-list">
						{requestsResult?.list.map((request) => (
							<article key={request._id} className="admin-dashboard-row">
								<div className="admin-dashboard-row-main">
									<strong>{request.companyName}</strong>
									<span>
										Business {request.businessNumber} · License {request.licenseNumber}
									</span>
								</div>
								<div className="admin-dashboard-row-side">
									<Chip label="Pending" className="admin-dashboard-status is-pending" size="small" />
									<time dateTime={request.createdAt}>{formatScheduleDate(request.createdAt)}</time>
								</div>
							</article>
						))}
					</div>
				</RecentSection>

				<RecentSection
					title="Recent Bookings"
					description="Latest bookings across WWT packages."
					loading={bookingsQuery.loading && !bookingsQuery.data}
					error={Boolean(bookingsQuery.error)}
					empty={Boolean(bookingsResult && bookingsResult.list.length === 0)}
					onRetry={() => void bookingsQuery.refetch().catch(() => undefined)}
				>
					<div className="admin-dashboard-list">
						{bookingsResult?.list.map((booking) => (
							<article key={booking._id} className="admin-dashboard-row">
								<div className="admin-dashboard-row-main">
									<strong>{booking.packageData?.packageTitle || booking.bookingCode}</strong>
									<span>
										{booking.contactName} · {booking.peopleCount} {booking.peopleCount === 1 ? 'traveler' : 'travelers'}
									</span>
								</div>
								<div className="admin-dashboard-row-side">
									<Chip
										label={enumLabel(booking.bookingStatus)}
										className={`admin-dashboard-status is-${booking.bookingStatus.toLowerCase()}`}
										size="small"
									/>
									<strong>{formatMoney(booking.finalPrice, booking.currency)}</strong>
									<time dateTime={booking.createdAt}>{formatScheduleDate(booking.createdAt)}</time>
								</div>
							</article>
						))}
					</div>
				</RecentSection>

				<RecentSection
					title="Recent Packages"
					description="Newest packages submitted to the platform."
					loading={packagesQuery.loading && !packagesQuery.data}
					error={Boolean(packagesQuery.error)}
					empty={Boolean(packagesResult && packagesResult.list.length === 0)}
					onRetry={() => void packagesQuery.refetch().catch(() => undefined)}
				>
					<div className="admin-dashboard-list">
						{packagesResult?.list.map((travelPackage) => (
							<article key={travelPackage._id} className="admin-dashboard-row">
								<div className="admin-dashboard-row-main">
									<strong>{travelPackage.packageTitle}</strong>
									<span>
										{[travelPackage.destinationCity, travelPackage.destinationCountry].filter(Boolean).join(', ')}
										{travelPackage.agentData?.companyName ? ` · ${travelPackage.agentData.companyName}` : ''}
									</span>
								</div>
								<div className="admin-dashboard-row-side">
									<Chip
										label={enumLabel(travelPackage.packageStatus)}
										className={`admin-dashboard-status is-${travelPackage.packageStatus.toLowerCase()}`}
										size="small"
									/>
									<strong>{formatMoney(travelPackage.packagePrice, travelPackage.currency)}</strong>
									<time dateTime={travelPackage.createdAt}>{formatScheduleDate(travelPackage.createdAt)}</time>
								</div>
							</article>
						))}
					</div>
				</RecentSection>

				<RecentSection
					title="Recent Articles"
					description="Latest community articles across all statuses."
					loading={articlesQuery.loading && !articlesQuery.data}
					error={Boolean(articlesQuery.error)}
					empty={Boolean(articlesResult && articlesResult.list.length === 0)}
					onRetry={() => void articlesQuery.refetch().catch(() => undefined)}
				>
					<div className="admin-dashboard-list">
						{articlesResult?.list.map((article) => (
							<article key={article._id} className="admin-dashboard-row">
								<div className="admin-dashboard-row-main">
									<strong>{article.articleTitle}</strong>
									<span>
										{article.memberData?.memberFullName || article.memberData?.memberNick || 'Member unavailable'} ·{' '}
										{enumLabel(article.articleCategory)}
									</span>
									<span>
										{article.articleViewCount} views · {article.articleCommentCount} comments
									</span>
								</div>
								<div className="admin-dashboard-row-side">
									<Chip
										label={enumLabel(article.articleStatus)}
										className={`admin-dashboard-status is-${article.articleStatus.toLowerCase()}`}
										size="small"
									/>
									<time dateTime={article.createdAt}>{formatScheduleDate(article.createdAt)}</time>
								</div>
							</article>
						))}
					</div>
				</RecentSection>
			</div>
		</div>
	);
}
