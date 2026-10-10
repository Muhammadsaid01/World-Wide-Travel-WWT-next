import { GET_MY_REPORTS, type ReportsQueryInput } from '@/apollo/user/query';
import { useQuery } from '@apollo/client';
import { Alert, Breadcrumbs, Button, Chip, MenuItem, Pagination, Skeleton, TextField, Typography } from '@mui/material';
import Link from 'next/link';
import { type ChangeEvent, useMemo, useRef, useState } from 'react';
import { formatScheduleDate } from '@/libs/components/package/PackageSchedules';
import { ReportStatus } from '@/libs/enums/system.enum';
import ProfileSidebar from '@/libs/components/mypage/ProfileSidebar';
import ReportDetail from './ReportDetail';
import {
	REPORT_STATUS_OPTIONS,
	reportReasonLabel,
	reportStatusClass,
	reportStatusLabel,
	reportTargetLabel,
} from './reportState';

const PAGE_SIZE = 8;

export default function MyReports() {
	const resultsRef = useRef<HTMLDivElement>(null);
	const [page, setPage] = useState(1);
	const [status, setStatus] = useState<'ALL' | ReportStatus>('ALL');
	const [direction, setDirection] = useState<'DESC' | 'ASC'>('DESC');
	const [selectedId, setSelectedId] = useState('');
	const variables = useMemo<{ input: ReportsQueryInput }>(
		() => ({
			input: {
				page,
				limit: PAGE_SIZE,
				sort: 'createdAt',
				direction,
				search: { reportStatus: status === 'ALL' ? undefined : status },
			},
		}),
		[direction, page, status],
	);
	const { data, loading, error, refetch } = useQuery(GET_MY_REPORTS, {
		variables,
		fetchPolicy: 'no-cache',
		notifyOnNetworkStatusChange: true,
	});
	const reports = data?.getMyReports.list ?? [];
	const total = data?.getMyReports.metaCounter?.[0]?.total ?? 0;
	const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

	function changePage(_: ChangeEvent<unknown>, nextPage: number) {
		setPage(nextPage);
		resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}

	return (
		<div className="my-bookings-page my-reports-page">
			<Breadcrumbs separator="/" className="my-bookings-breadcrumb" aria-label="Breadcrumb">
				<Link href="/">Home</Link>
				<span>My Profile</span>
				<span aria-current="page">My Reports</span>
			</Breadcrumbs>
			<div className="my-bookings-layout">
				<ProfileSidebar active="My Reports" />
				<main className="my-bookings-main">
					<header className="my-bookings-header">
						<div>
							<Typography component="h1">My Reports</Typography>
							<Typography color="text.secondary">Track reports you have submitted to WWT.</Typography>
						</div>
						{!loading && !error ? (
							<span className="my-bookings-count">
								{total} {total === 1 ? 'report' : 'reports'}
							</span>
						) : null}
					</header>
					<div className="my-reports-controls">
						<TextField
							select
							size="small"
							label="Status"
							value={status}
							onChange={(event) => {
								setStatus(event.target.value as typeof status);
								setPage(1);
							}}
						>
							<MenuItem value="ALL">All statuses</MenuItem>
							{REPORT_STATUS_OPTIONS.map((option) => (
								<MenuItem key={option.value} value={option.value}>
									{option.label}
								</MenuItem>
							))}
						</TextField>
						<TextField
							select
							size="small"
							label="Sort"
							value={direction}
							onChange={(event) => {
								setDirection(event.target.value as typeof direction);
								setPage(1);
							}}
						>
							<MenuItem value="DESC">Newest first</MenuItem>
							<MenuItem value="ASC">Oldest first</MenuItem>
						</TextField>
					</div>
					<div ref={resultsRef} className="my-reports-list" aria-busy={loading} tabIndex={-1}>
						{loading ? (
							Array.from({ length: 4 }, (_, index) => <Skeleton key={index} variant="rounded" height={126} />)
						) : error ? (
							<Alert
								severity="error"
								action={<Button onClick={() => void refetch().catch(() => undefined)}>Retry</Button>}
							>
								Reports could not be loaded. {error.message}
							</Alert>
						) : reports.length === 0 ? (
							<div className="my-reports-empty">
								<Typography component="h2">
									{status === 'ALL' ? 'You have not submitted any reports.' : 'No reports match this status.'}
								</Typography>
								{status !== 'ALL' ? (
									<Button
										onClick={() => {
											setStatus('ALL');
											setPage(1);
										}}
									>
										Clear filter
									</Button>
								) : null}
							</div>
						) : (
							reports.map((report) => (
								<article className="my-report-row" key={report._id}>
									<div className="my-report-primary">
										<span className="my-report-eyebrow">{reportTargetLabel(report.targetType)}</span>
										<Typography component="h2">{reportReasonLabel(report.reportType)}</Typography>
										<Typography>{report.reportDesc || 'No description provided.'}</Typography>
										<code>{report.targetId}</code>
									</div>
									<div className="my-report-meta">
										<Chip
											size="small"
											className={reportStatusClass(report.reportStatus)}
											label={reportStatusLabel(report.reportStatus)}
										/>
										<time dateTime={report.createdAt}>{formatScheduleDate(report.createdAt)}</time>
										<Button size="small" variant="outlined" onClick={() => setSelectedId(report._id)}>
											View details
										</Button>
									</div>
								</article>
							))
						)}
					</div>
					{!loading && !error && total > PAGE_SIZE ? (
						<Pagination page={page} count={pageCount} onChange={changePage} color="primary" />
					) : null}
				</main>
			</div>
			<ReportDetail open={Boolean(selectedId)} reportId={selectedId} onClose={() => setSelectedId('')} />
		</div>
	);
}
