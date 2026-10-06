import { type ChangeEvent, useMemo, useRef, useState } from 'react';
import { useQuery } from '@apollo/client';
import OpenInNewOutlined from '@mui/icons-material/OpenInNewOutlined';
import { Alert, Button, Chip, MenuItem, Pagination, Paper, Skeleton, TextField, Typography } from '@mui/material';
import Link from 'next/link';
import {
	GET_ADMIN_PACKAGES,
	type AdminPackageRow,
	type AdminPackagesInput,
} from '@/apollo/admin/query';
import { PackageStatus } from '@/libs/enums/package.enum';
import PackageImage from '../package/PackageImage';
import { formatScheduleDate } from '../package/PackageSchedules';

const PAGE_SIZE = 10;

const statusOptions: Array<{ value: PackageStatus | 'ALL'; label: string }> = [
	{ value: 'ALL', label: 'All statuses' },
	{ value: PackageStatus.ACTIVE, label: 'Active' },
	{ value: PackageStatus.HIDDEN, label: 'Hidden' },
	{ value: PackageStatus.SOLD, label: 'Sold' },
	{ value: PackageStatus.EXPIRED, label: 'Expired' },
	{ value: PackageStatus.DELETED, label: 'Deleted' },
];

function enumLabel(value: string) {
	return value
		.toLowerCase()
		.split('_')
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(' ');
}

function formatPrice(value: number, currency: string) {
	try {
		return new Intl.NumberFormat(undefined, {
			style: 'currency',
			currency: currency.toUpperCase(),
			maximumFractionDigits: 2,
		}).format(value);
	} catch {
		return `${value.toLocaleString()} ${currency}`;
	}
}

function PackageRow({ item }: { item: AdminPackageRow }) {
	const destination = [item.destinationCity, item.destinationCountry].filter(Boolean).join(', ');
	const duration = `${item.packageDays} day${item.packageDays === 1 ? '' : 's'} · ${item.packageNights} night${
		item.packageNights === 1 ? '' : 's'
	}`;
	const companyName = item.agentData?.companyName?.trim() || 'Agent unavailable';

	return (
		<article className="admin-package-row">
			<div className="admin-package-summary" data-label="Package">
				<div className="admin-package-image">
					<PackageImage path={item.packageImages?.[0]} alt={item.packageTitle} />
				</div>
				<div>
					<strong>{item.packageTitle}</strong>
					<span>
						{enumLabel(item.packageType)} · {enumLabel(item.packageCategory)}
					</span>
					{item.packageShortDesc?.trim() ? <small>{item.packageShortDesc}</small> : null}
				</div>
			</div>

			<div className="admin-package-cell" data-label="Destination">
				<strong>{destination || 'Not provided'}</strong>
			</div>

			<div className="admin-package-cell" data-label="Status">
				<Chip
					label={enumLabel(item.packageStatus)}
					className={`admin-package-status is-${item.packageStatus.toLowerCase()}`}
					size="small"
				/>
			</div>

			<div className="admin-package-cell" data-label="Price & duration">
				<strong>{formatPrice(item.packagePrice, item.currency)}</strong>
				<span>{duration}</span>
			</div>

			<div className="admin-package-cell" data-label="Agent">
				<strong>{companyName}</strong>
				<span>{item.agentData ? `Agent ${item.agentData._id}` : `Agent ${item.agentId}`}</span>
			</div>

			<div className="admin-package-cell" data-label="Dates">
				<strong>Updated {formatScheduleDate(item.updatedAt)}</strong>
				<span>Created {formatScheduleDate(item.createdAt)}</span>
			</div>

			<div className="admin-package-action" data-label="Action">
				{item.packageStatus === PackageStatus.ACTIVE ? (
					<Button
						component={Link}
						href={`/package/${item._id}`}
						variant="outlined"
						size="small"
						endIcon={<OpenInNewOutlined />}
					>
						View public
					</Button>
				) : (
					<Typography component="span">Not public</Typography>
				)}
			</div>
		</article>
	);
}

function PackageSkeleton() {
	return (
		<div className="admin-members-skeleton" aria-label="Loading packages">
			{Array.from({ length: 5 }, (_, index) => (
				<Skeleton key={index} variant="rounded" height={92} />
			))}
		</div>
	);
}

export default function AdminPackages() {
	const resultsRef = useRef<HTMLDivElement>(null);
	const [page, setPage] = useState(1);
	const [packageStatus, setPackageStatus] = useState<PackageStatus | 'ALL'>('ALL');
	const [sort, setSort] = useState<'newest' | 'oldest'>('newest');

	const variables = useMemo<{ input: AdminPackagesInput }>(
		() => ({
			input: {
				page,
				limit: PAGE_SIZE,
				sort: 'createdAt',
				direction: sort === 'newest' ? 'DESC' : 'ASC',
				search: {
					packageStatus: packageStatus === 'ALL' ? undefined : packageStatus,
				},
			},
		}),
		[page, packageStatus, sort],
	);

	const { data, loading, error, refetch } = useQuery(GET_ADMIN_PACKAGES, {
		variables,
		fetchPolicy: 'no-cache',
		notifyOnNetworkStatusChange: true,
	});

	const packages = data?.getAllTravelPackagesByAdmin.list ?? [];
	const total = data?.getAllTravelPackagesByAdmin.metaCounter?.[0]?.total ?? 0;
	const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
	const filtered = packageStatus !== 'ALL';

	function changePage(_: ChangeEvent<unknown>, nextPage: number) {
		setPage(nextPage);
		resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}

	function clearFilters() {
		setPackageStatus('ALL');
		setSort('newest');
		setPage(1);
	}

	return (
		<div className="admin-packages-page">
			<header className="admin-page-header">
				<div>
					<Typography className="admin-page-kicker">Package management</Typography>
					<Typography component="h1">Packages</Typography>
					<Typography>Review package ownership, status, pricing, and destination information.</Typography>
				</div>
				<span className={`admin-total-count${error ? ' is-unavailable' : ''}`}>
					{error ? 'Total unavailable' : loading && !data ? 'Loading total' : `${total} total`}
				</span>
			</header>

			<div className="admin-packages-toolbar">
				<TextField
					select
					label="Package status"
					value={packageStatus}
					onChange={(event) => {
						setPackageStatus(event.target.value as PackageStatus | 'ALL');
						setPage(1);
					}}
					size="small"
				>
					{statusOptions.map((option) => (
						<MenuItem key={option.value} value={option.value}>
							{option.label}
						</MenuItem>
					))}
				</TextField>
				<TextField
					select
					label="Sort"
					value={sort}
					onChange={(event) => {
						setSort(event.target.value as 'newest' | 'oldest');
						setPage(1);
					}}
					size="small"
				>
					<MenuItem value="newest">Newest</MenuItem>
					<MenuItem value="oldest">Oldest</MenuItem>
				</TextField>
			</div>

			<div ref={resultsRef} className="admin-members-results">
				{loading && !data ? (
					<PackageSkeleton />
				) : error ? (
					<Alert
						severity="error"
						action={
							<Button color="inherit" size="small" onClick={() => void refetch()}>
								Retry
							</Button>
						}
					>
						Packages could not be loaded. Your filters have been preserved.
					</Alert>
				) : packages.length === 0 ? (
					<Paper className="admin-members-empty" elevation={0}>
						<Typography component="h2">{filtered ? 'No matching packages' : 'No packages yet'}</Typography>
						<Typography>
							{filtered
								? 'Try another status or clear the current filter.'
								: 'Packages will appear here when agents create them.'}
						</Typography>
						{filtered ? (
							<Button variant="outlined" onClick={clearFilters}>
								Clear Filter
							</Button>
						) : null}
					</Paper>
				) : (
					<Paper className="admin-members-table admin-packages-table" elevation={0}>
						<div className="admin-packages-table-header" aria-hidden="true">
							<span>Package</span>
							<span>Destination</span>
							<span>Status</span>
							<span>Price & duration</span>
							<span>Agent</span>
							<span>Dates</span>
							<span>Action</span>
						</div>
						<div className="admin-members-list">
							{packages.map((item) => (
								<PackageRow key={item._id} item={item} />
							))}
						</div>
					</Paper>
				)}
			</div>

			{!loading && !error && total > PAGE_SIZE ? (
				<div className="admin-members-pagination">
					<Pagination count={pageCount} page={Math.min(page, pageCount)} onChange={changePage} color="primary" />
				</div>
			) : null}
		</div>
	);
}
