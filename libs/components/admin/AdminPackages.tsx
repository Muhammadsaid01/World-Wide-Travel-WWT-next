import { type ChangeEvent, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import OpenInNewOutlined from '@mui/icons-material/OpenInNewOutlined';
import {
	Alert,
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
import Link from 'next/link';
import {
	DELETE_TRAVEL_PACKAGE_BY_ADMIN,
	UPDATE_TRAVEL_PACKAGE_BY_ADMIN,
} from '@/apollo/admin/mutation';
import {
	GET_ADMIN_PACKAGES,
	type AdminPackageRow,
	type AdminPackagesInput,
} from '@/apollo/admin/query';
import { PackageStatus } from '@/libs/enums/package.enum';
import PackageImage from '../package/PackageImage';
import { formatScheduleDate } from '../package/PackageSchedules';

const PAGE_SIZE = 10;

type PackageAction = 'SOLD' | 'DELETED' | 'HARD_DELETE';
type SelectedAction = { item: AdminPackageRow; action: PackageAction };

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

function PackageRow({
	item,
	busy,
	onAction,
}: {
	item: AdminPackageRow;
	busy: boolean;
	onAction: (item: AdminPackageRow, action: PackageAction) => void;
}) {
	const destination = [item.destinationCity, item.destinationCountry].filter(Boolean).join(', ');
	const duration = `${item.packageDays} day${item.packageDays === 1 ? '' : 's'} · ${item.packageNights} night${
		item.packageNights === 1 ? '' : 's'
	}`;
	const companyName = item.agentData?.companyName?.trim() || 'Agent unavailable';
	const active = item.packageStatus === PackageStatus.ACTIVE;

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

			<div className="admin-package-action admin-package-actions" data-label="Actions">
				{active ? (
					<Button
						component={Link}
						href={`/package/${item._id}`}
						variant="outlined"
						size="small"
						endIcon={<OpenInNewOutlined />}
						disabled={busy}
					>
						View public
					</Button>
				) : null}
				{active ? (
					<>
						<Button size="small" disabled={busy} onClick={() => onAction(item, 'SOLD')}>
							Mark sold
						</Button>
						<Button color="error" size="small" disabled={busy} onClick={() => onAction(item, 'DELETED')}>
							Mark deleted
						</Button>
					</>
				) : null}
				<Button color="error" size="small" disabled={busy} onClick={() => onAction(item, 'HARD_DELETE')}>
					Delete permanently
				</Button>
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

function actionCopy(selected: SelectedAction | null) {
	if (!selected) return { title: '', description: '', confirm: '' };
	if (selected.action === 'SOLD') {
		return {
			title: 'Mark package as sold?',
			description: `“${selected.item.packageTitle}” will move from Active to Sold. This lifecycle change cannot be reversed from Admin.`,
			confirm: 'Mark as Sold',
		};
	}
	if (selected.action === 'DELETED') {
		return {
			title: 'Mark package as deleted?',
			description: `“${selected.item.packageTitle}” will move from Active to Deleted. The package record will remain in the system.`,
			confirm: 'Mark as Deleted',
		};
	}
	return {
		title: 'Permanently delete package?',
		description: `“${selected.item.packageTitle}” and its schedules, itinerary, includes, excludes, tags, and policy will be permanently removed. This is different from marking a package Deleted and cannot be undone.`,
		confirm: 'Delete Permanently',
	};
}

export default function AdminPackages() {
	const actionLock = useRef(false);
	const resultsRef = useRef<HTMLDivElement>(null);
	const [page, setPage] = useState(1);
	const [packageStatus, setPackageStatus] = useState<PackageStatus | 'ALL'>('ALL');
	const [sort, setSort] = useState<'newest' | 'oldest'>('newest');
	const [selectedAction, setSelectedAction] = useState<SelectedAction | null>(null);
	const [busyId, setBusyId] = useState('');
	const [actionError, setActionError] = useState('');
	const [notice, setNotice] = useState('');

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
	const [updatePackage] = useMutation(UPDATE_TRAVEL_PACKAGE_BY_ADMIN);
	const [deletePackage] = useMutation(DELETE_TRAVEL_PACKAGE_BY_ADMIN);

	const packages = data?.getAllTravelPackagesByAdmin.list ?? [];
	const total = data?.getAllTravelPackagesByAdmin.metaCounter?.[0]?.total ?? 0;
	const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
	const filtered = packageStatus !== 'ALL';
	const copy = actionCopy(selectedAction);

	function changePage(_: ChangeEvent<unknown>, nextPage: number) {
		setPage(nextPage);
		resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}

	function clearFilters() {
		setPackageStatus('ALL');
		setSort('newest');
		setPage(1);
	}

	async function synchronize() {
		try {
			const refreshed = await refetch();
			const freshTotal = refreshed.data.getAllTravelPackagesByAdmin.metaCounter?.[0]?.total ?? 0;
			const lastPage = Math.max(1, Math.ceil(freshTotal / PAGE_SIZE));
			if (page > lastPage) setPage(lastPage);
		} catch {
			setActionError('The package was changed, but the list could not be refreshed. Retry to synchronize it.');
		}
	}

	async function confirmAction() {
		if (!selectedAction || actionLock.current) return;
		if (selectedAction.action !== 'HARD_DELETE' && selectedAction.item.packageStatus !== PackageStatus.ACTIVE) {
			setActionError('Only Active packages can change lifecycle status.');
			return;
		}

		actionLock.current = true;
		setBusyId(selectedAction.item._id);
		setActionError('');
		setNotice('');
		try {
			if (selectedAction.action === 'HARD_DELETE') {
				const response = await deletePackage({ variables: { input: { _id: selectedAction.item._id } } });
				if (!response.data?.deleteTravelPackageByAdmin) {
					throw new Error('The server did not confirm the permanent deletion.');
				}
				setNotice(`${selectedAction.item.packageTitle} was permanently deleted.`);
			} else {
				const nextStatus = selectedAction.action === 'SOLD' ? PackageStatus.SOLD : PackageStatus.DELETED;
				const response = await updatePackage({
					variables: { input: { _id: selectedAction.item._id, packageStatus: nextStatus } },
				});
				if (!response.data?.updateTravelPackageByAdmin) {
					throw new Error('The server did not confirm the package status change.');
				}
				setNotice(`${selectedAction.item.packageTitle} was marked ${enumLabel(nextStatus).toLowerCase()}.`);
			}
			setSelectedAction(null);
			await synchronize();
		} catch (failure) {
			setActionError(failure instanceof Error ? failure.message : 'The package action could not be completed.');
		} finally {
			actionLock.current = false;
			setBusyId('');
		}
	}

	return (
		<div className="admin-packages-page">
			<header className="admin-page-header">
				<div>
					<Typography className="admin-page-kicker">Package management</Typography>
					<Typography component="h1">Packages</Typography>
					<Typography>Review package ownership, status, pricing, and destination information.</Typography>
				</div>
				<span className={`admin-total-count${error && !data ? ' is-unavailable' : ''}`}>
					{error && !data ? 'Total unavailable' : loading && !data ? 'Loading total' : `${total} total`}
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

			<div className="admin-members-feedback">
				{notice ? <Alert severity="success">{notice}</Alert> : null}
				{actionError && !selectedAction ? (
					<Alert severity="error" action={<Button onClick={() => void refetch()}>Refresh list</Button>}>
						{actionError}
					</Alert>
				) : null}
				{error && data ? (
					<Alert severity="warning" action={<Button onClick={() => void refetch()}>Retry</Button>}>
						The latest package data could not be refreshed.
					</Alert>
				) : null}
			</div>

			<div ref={resultsRef} className="admin-members-results" aria-busy={loading}>
				{loading && !data ? (
					<PackageSkeleton />
				) : error && !data ? (
					<Alert severity="error" action={<Button onClick={() => void refetch()}>Retry</Button>}>
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
							<span>Actions</span>
						</div>
						<div className="admin-members-list">
							{packages.map((item) => (
								<PackageRow
									key={item._id}
									item={item}
									busy={Boolean(busyId)}
									onAction={(selectedItem, action) => {
										setActionError('');
										setSelectedAction({ item: selectedItem, action });
									}}
								/>
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

			<Dialog
				className="admin-request-dialog"
				open={Boolean(selectedAction)}
				onClose={() => {
					if (!busyId) setSelectedAction(null);
				}}
				fullWidth
				maxWidth="sm"
			>
				<DialogTitle>{copy.title}</DialogTitle>
				<DialogContent>
					<Typography>{copy.description}</Typography>
					{actionError ? <Alert severity="error">{actionError}</Alert> : null}
				</DialogContent>
				<DialogActions>
					<Button disabled={Boolean(busyId)} onClick={() => setSelectedAction(null)}>
						Cancel
					</Button>
					<Button
						variant="contained"
						color={selectedAction?.action === 'SOLD' ? 'primary' : 'error'}
						disabled={Boolean(busyId)}
						onClick={() => void confirmAction()}
					>
						{busyId ? 'Working...' : copy.confirm}
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
}
