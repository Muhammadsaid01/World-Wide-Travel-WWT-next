import { type ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import AddOutlined from '@mui/icons-material/AddOutlined';
import DeleteOutlineOutlined from '@mui/icons-material/DeleteOutlineOutlined';
import EditOutlined from '@mui/icons-material/EditOutlined';
import HistoryOutlined from '@mui/icons-material/HistoryOutlined';
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
import { CREATE_COUPON, DELETE_COUPON, UPDATE_COUPON } from '@/apollo/admin/mutation';
import { GET_ADMIN_COUPONS, type AdminCouponRow, type AdminCouponsInput } from '@/apollo/admin/query';
import { CouponStatus, CouponType } from '@/libs/enums/booking.enum';
import type { CouponInput } from '@/libs/types/booking/coupon.input';
import type { CouponUpdate } from '@/libs/types/booking/coupon.update';
import { formatScheduleDate } from '../package/PackageSchedules';
import AdminCouponDetail from './AdminCouponDetail';
import AdminCouponForm, { type AdminCouponFormErrors, type AdminCouponFormValues } from './AdminCouponForm';

const PAGE_SIZE = 10;
const SEARCH_DELAY = 300;

type CouponAction = 'ENABLE' | 'DISABLE' | 'DELETE';
type SelectedAction = { coupon: AdminCouponRow; action: CouponAction };

function toLocalDateTime(value: string) {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return '';
	const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
	return local.toISOString().slice(0, 16);
}

function initialForm(coupon?: AdminCouponRow): AdminCouponFormValues {
	return {
		couponCode: coupon?.couponCode ?? '',
		couponTitle: coupon?.couponTitle ?? '',
		couponDesc: coupon?.couponDesc ?? '',
		couponType: coupon?.couponType ?? CouponType.FIXED,
		couponValue: coupon ? String(coupon.couponValue) : '',
		minAmount: coupon ? String(coupon.minAmount) : '',
		maxDiscount: coupon?.maxDiscount == null ? '' : String(coupon.maxDiscount),
		usageLimit: coupon ? String(coupon.usageLimit) : '0',
		perUserLimit: coupon ? String(coupon.perUserLimit) : '1',
		validFrom: coupon ? toLocalDateTime(coupon.validFrom) : '',
		validUntil: coupon ? toLocalDateTime(coupon.validUntil) : '',
		couponStatus: coupon?.couponStatus ?? CouponStatus.ACTIVE,
	};
}

function numericValue(value: string) {
	return value.trim() === '' ? undefined : Number(value);
}

function validateForm(values: AdminCouponFormValues, usedCount = 0) {
	const errors: AdminCouponFormErrors = {};
	const couponValue = numericValue(values.couponValue);
	const minAmount = numericValue(values.minAmount);
	const maxDiscount = numericValue(values.maxDiscount);
	const usageLimit = numericValue(values.usageLimit);
	const perUserLimit = numericValue(values.perUserLimit);
	const validFrom = new Date(values.validFrom);
	const validUntil = new Date(values.validUntil);

	if (!values.couponCode.trim()) errors.couponCode = 'Coupon code is required.';
	if (values.couponTitle.trim().length < 3 || values.couponTitle.trim().length > 100) {
		errors.couponTitle = 'Title must be between 3 and 100 characters.';
	}
	if (couponValue == null || !Number.isFinite(couponValue) || couponValue <= 0) {
		errors.couponValue = 'Coupon value must be greater than 0.';
	} else if (values.couponType === CouponType.PERCENT && couponValue > 100) {
		errors.couponValue = 'Percentage value cannot exceed 100.';
	}
	if (minAmount != null && (!Number.isFinite(minAmount) || minAmount < 0)) {
		errors.minAmount = 'Minimum amount must be 0 or greater.';
	}
	if (
		values.couponType === CouponType.PERCENT &&
		(maxDiscount == null || !Number.isFinite(maxDiscount) || maxDiscount <= 0)
	) {
		errors.maxDiscount = 'A maximum discount greater than 0 is required for percentage coupons.';
	}
	if (usageLimit == null || !Number.isInteger(usageLimit) || usageLimit < 0) {
		errors.usageLimit = 'Usage limit must be a whole number of 0 or greater.';
	} else if (usageLimit > 0 && usageLimit < usedCount) {
		errors.usageLimit = `Usage limit cannot be lower than the current ${usedCount.toLocaleString()} uses.`;
	}
	if (perUserLimit == null || !Number.isInteger(perUserLimit) || perUserLimit < 1) {
		errors.perUserLimit = 'Per-user limit must be a whole number of at least 1.';
	}
	if (!values.validFrom || Number.isNaN(validFrom.getTime())) errors.validFrom = 'A valid start date is required.';
	if (!values.validUntil || Number.isNaN(validUntil.getTime())) errors.validUntil = 'A valid end date is required.';
	if (!errors.validFrom && !errors.validUntil && validUntil.getTime() <= validFrom.getTime()) {
		errors.validUntil = 'Valid Until must be after Valid From.';
	}
	return errors;
}

function createInput(values: AdminCouponFormValues): CouponInput {
	const minAmount = numericValue(values.minAmount);
	const maxDiscount = numericValue(values.maxDiscount);
	return {
		couponCode: values.couponCode.trim(),
		couponTitle: values.couponTitle.trim(),
		couponDesc: values.couponDesc.trim() || undefined,
		couponType: values.couponType,
		couponValue: Number(values.couponValue),
		minAmount: minAmount ?? 0,
		maxDiscount: values.couponType === CouponType.PERCENT ? maxDiscount : undefined,
		usageLimit: Number(values.usageLimit),
		perUserLimit: Number(values.perUserLimit),
		validFrom: new Date(values.validFrom).toISOString(),
		validUntil: new Date(values.validUntil).toISOString(),
	};
}

function updateInput(couponId: string, values: AdminCouponFormValues): CouponUpdate {
	const minAmount = numericValue(values.minAmount);
	const maxDiscount = numericValue(values.maxDiscount);
	return {
		couponId,
		couponTitle: values.couponTitle.trim(),
		couponDesc: values.couponDesc.trim(),
		couponType: values.couponType,
		couponValue: Number(values.couponValue),
		minAmount: minAmount ?? 0,
		maxDiscount: values.couponType === CouponType.PERCENT ? maxDiscount : undefined,
		usageLimit: Number(values.usageLimit),
		perUserLimit: Number(values.perUserLimit),
		validFrom: new Date(values.validFrom).toISOString(),
		validUntil: new Date(values.validUntil).toISOString(),
		couponStatus: values.couponStatus,
	};
}

function formatNumber(value: number) {
	return new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(value);
}

function discountLabel(coupon: AdminCouponRow) {
	if (coupon.couponType === CouponType.PERCENT) {
		return `${formatNumber(coupon.couponValue)}%${coupon.maxDiscount == null ? '' : ` · cap ${formatNumber(coupon.maxDiscount)}`}`;
	}
	return formatNumber(coupon.couponValue);
}

function isDateExpired(coupon: AdminCouponRow) {
	const validUntil = new Date(coupon.validUntil).getTime();
	return Number.isFinite(validUntil) && validUntil < Date.now();
}

function CouponSkeleton() {
	return (
		<div className="admin-members-skeleton" aria-label="Loading coupons">
			{Array.from({ length: 5 }, (_, index) => (
				<Skeleton key={index} variant="rounded" height={102} />
			))}
		</div>
	);
}

function CouponRow({
	coupon,
	busy,
	onEdit,
	onUsage,
	onAction,
}: {
	coupon: AdminCouponRow;
	busy: boolean;
	onEdit: () => void;
	onUsage: () => void;
	onAction: (action: CouponAction) => void;
}) {
	const dateExpired = isDateExpired(coupon);
	const toggleAction =
		coupon.couponStatus === CouponStatus.ACTIVE
			? 'DISABLE'
			: coupon.couponStatus === CouponStatus.DISABLED
				? 'ENABLE'
				: null;
	return (
		<article className="admin-coupon-row">
			<div className="admin-coupon-summary" data-label="Coupon">
				<strong>{coupon.couponCode}</strong>
				<span>{coupon.couponTitle}</span>
				{coupon.couponDesc?.trim() ? <small>{coupon.couponDesc}</small> : null}
			</div>
			<div className="admin-coupon-cell" data-label="Discount">
				<strong>{discountLabel(coupon)}</strong>
				<span>{coupon.couponType === CouponType.FIXED ? 'Fixed amount' : 'Percentage'}</span>
			</div>
			<div className="admin-coupon-cell" data-label="Minimum">
				<strong>{formatNumber(coupon.minAmount)}</strong>
				<span>minimum amount</span>
			</div>
			<div className="admin-coupon-cell" data-label="Usage">
				<strong>
					{coupon.usedCount.toLocaleString()} /{' '}
					{coupon.usageLimit === 0 ? 'Unlimited' : coupon.usageLimit.toLocaleString()}
				</strong>
				<span>{coupon.perUserLimit.toLocaleString()} per user</span>
			</div>
			<div className="admin-coupon-cell" data-label="Validity">
				<strong>{formatScheduleDate(coupon.validFrom)}</strong>
				<span>to {formatScheduleDate(coupon.validUntil)}</span>
			</div>
			<div className="admin-coupon-cell admin-coupon-status-cell" data-label="Status">
				<Chip
					size="small"
					label={coupon.couponStatus}
					className={`admin-coupon-status is-${coupon.couponStatus.toLowerCase()}`}
				/>
				{dateExpired && coupon.couponStatus === CouponStatus.ACTIVE ? (
					<Chip size="small" label="Date expired" className="admin-coupon-date-expired" />
				) : null}
			</div>
			<div className="admin-coupon-cell" data-label="Created">
				<strong>{formatScheduleDate(coupon.createdAt)}</strong>
				<span>Updated {formatScheduleDate(coupon.updatedAt)}</span>
			</div>
			<div className="admin-coupon-actions" data-label="Actions">
				<Button size="small" startIcon={<EditOutlined />} disabled={busy} onClick={onEdit}>
					Edit
				</Button>
				<Button size="small" startIcon={<HistoryOutlined />} disabled={busy} onClick={onUsage}>
					Usage History
				</Button>
				{toggleAction ? (
					<Button size="small" disabled={busy} onClick={() => onAction(toggleAction)}>
						{toggleAction === 'ENABLE' ? 'Enable' : 'Disable'}
					</Button>
				) : null}
				<Button
					size="small"
					color="error"
					startIcon={<DeleteOutlineOutlined />}
					disabled={busy}
					onClick={() => onAction('DELETE')}
				>
					Delete
				</Button>
			</div>
		</article>
	);
}

function actionCopy(selected: SelectedAction | null) {
	if (!selected) return { title: '', description: '', confirm: '', color: 'primary' as const };
	if (selected.action === 'DELETE')
		return {
			title: 'Delete coupon?',
			description: `“${selected.coupon.couponCode}” will be soft-deleted and removed from active coupon management. Existing booking and usage history remains unchanged.`,
			confirm: 'Delete Coupon',
			color: 'error' as const,
		};
	const enabling = selected.action === 'ENABLE';
	return {
		title: `${enabling ? 'Enable' : 'Disable'} coupon?`,
		description: `“${selected.coupon.couponCode}” will be marked ${enabling ? 'Active' : 'Disabled'} by the server.`,
		confirm: `${enabling ? 'Enable' : 'Disable'} Coupon`,
		color: 'primary' as const,
	};
}

export default function AdminCoupons() {
	const mutationLock = useRef(false);
	const resultsRef = useRef<HTMLDivElement>(null);
	const [page, setPage] = useState(1);
	const [searchText, setSearchText] = useState('');
	const [debouncedSearch, setDebouncedSearch] = useState('');
	const [couponType, setCouponType] = useState<CouponType | 'ALL'>('ALL');
	const [couponStatus, setCouponStatus] = useState<CouponStatus | 'ALL'>('ALL');
	const [sort, setSort] = useState<'newest' | 'oldest'>('newest');
	const [formOpen, setFormOpen] = useState(false);
	const [editingCoupon, setEditingCoupon] = useState<AdminCouponRow | null>(null);
	const [form, setForm] = useState<AdminCouponFormValues>(() => initialForm());
	const [formErrors, setFormErrors] = useState<AdminCouponFormErrors>({});
	const [formError, setFormError] = useState('');
	const [selectedAction, setSelectedAction] = useState<SelectedAction | null>(null);
	const [usageCoupon, setUsageCoupon] = useState<AdminCouponRow | null>(null);
	const [busyId, setBusyId] = useState('');
	const [actionError, setActionError] = useState('');
	const [feedback, setFeedback] = useState('');

	useEffect(() => {
		const timer = window.setTimeout(() => {
			setDebouncedSearch(searchText.trim());
			setPage(1);
		}, SEARCH_DELAY);
		return () => window.clearTimeout(timer);
	}, [searchText]);

	const variables = useMemo<{ input: AdminCouponsInput }>(
		() => ({
			input: {
				page,
				limit: PAGE_SIZE,
				sort: 'createdAt',
				direction: sort === 'newest' ? 'DESC' : 'ASC',
				search: {
					text: debouncedSearch || undefined,
					couponType: couponType === 'ALL' ? undefined : couponType,
					couponStatus: couponStatus === 'ALL' ? undefined : couponStatus,
				},
			},
		}),
		[couponStatus, couponType, debouncedSearch, page, sort],
	);

	const { data, loading, error, refetch } = useQuery(GET_ADMIN_COUPONS, {
		variables,
		fetchPolicy: 'no-cache',
		notifyOnNetworkStatusChange: true,
	});
	const [createCoupon] = useMutation(CREATE_COUPON);
	const [updateCoupon] = useMutation(UPDATE_COUPON);
	const [deleteCoupon] = useMutation(DELETE_COUPON);

	const coupons = data?.getAllCoupons.list ?? [];
	const total = data?.getAllCoupons.metaCounter?.[0]?.total ?? 0;
	const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
	const filtered = Boolean(debouncedSearch) || couponType !== 'ALL' || couponStatus !== 'ALL';
	const copy = actionCopy(selectedAction);

	function changePage(_: ChangeEvent<unknown>, nextPage: number) {
		setPage(nextPage);
		resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}

	function clearFilters() {
		setSearchText('');
		setDebouncedSearch('');
		setCouponType('ALL');
		setCouponStatus('ALL');
		setSort('newest');
		setPage(1);
	}

	function openCreate() {
		setEditingCoupon(null);
		setForm(initialForm());
		setFormErrors({});
		setFormError('');
		setFormOpen(true);
	}

	function openEdit(coupon: AdminCouponRow) {
		setEditingCoupon(coupon);
		setForm(initialForm(coupon));
		setFormErrors({});
		setFormError('');
		setFormOpen(true);
	}

	function closeForm() {
		if (busyId) return;
		setFormOpen(false);
		setEditingCoupon(null);
		setFormErrors({});
		setFormError('');
	}

	async function synchronize(targetPage = page) {
		try {
			const refreshed = await refetch({ input: { ...variables.input, page: targetPage } });
			const freshTotal = refreshed.data.getAllCoupons.metaCounter?.[0]?.total ?? 0;
			const lastPage = Math.max(1, Math.ceil(freshTotal / PAGE_SIZE));
			if (targetPage > lastPage) setPage(lastPage);
		} catch {
			setActionError('The action succeeded, but the coupon list could not be refreshed. Retry to synchronize it.');
		}
	}

	async function submitForm() {
		if (mutationLock.current) return;
		const errors = validateForm(form, editingCoupon?.usedCount);
		setFormErrors(errors);
		if (Object.keys(errors).length) return;

		mutationLock.current = true;
		setBusyId(editingCoupon?._id ?? 'create');
		setFormError('');
		setActionError('');
		setFeedback('');
		try {
			if (editingCoupon) {
				const response = await updateCoupon({ variables: { input: updateInput(editingCoupon._id, form) } });
				const updated = response.data?.updateCoupon;
				if (!updated) throw new Error('The server did not confirm the coupon update.');
				setFeedback(`${updated.couponCode} was updated.`);
				setFormOpen(false);
				setEditingCoupon(null);
				await synchronize();
			} else {
				const response = await createCoupon({ variables: { input: createInput(form) } });
				const created = response.data?.createCoupon;
				if (!created) throw new Error('The server did not confirm coupon creation.');
				setFeedback(`${created.couponCode} was created.`);
				setFormOpen(false);
				setForm(initialForm());
				setPage(1);
				await synchronize(1);
			}
		} catch (failure) {
			setFormError(failure instanceof Error ? failure.message : 'The coupon could not be saved.');
		} finally {
			mutationLock.current = false;
			setBusyId('');
		}
	}

	async function confirmAction() {
		if (!selectedAction || mutationLock.current) return;
		mutationLock.current = true;
		setBusyId(selectedAction.coupon._id);
		setActionError('');
		setFeedback('');
		try {
			if (selectedAction.action === 'DELETE') {
				const response = await deleteCoupon({ variables: { couponId: selectedAction.coupon._id } });
				const deleted = response.data?.deleteCoupon;
				if (!deleted) throw new Error('The server did not confirm coupon deletion.');
				setFeedback(`${deleted.couponCode} was deleted.`);
			} else {
				const nextStatus = selectedAction.action === 'ENABLE' ? CouponStatus.ACTIVE : CouponStatus.DISABLED;
				const response = await updateCoupon({
					variables: { input: { couponId: selectedAction.coupon._id, couponStatus: nextStatus } },
				});
				const updated = response.data?.updateCoupon;
				if (!updated) throw new Error('The server did not confirm the coupon status change.');
				setFeedback(`${updated.couponCode} was marked ${nextStatus.toLowerCase()}.`);
			}
			setSelectedAction(null);
			await synchronize();
		} catch (failure) {
			setActionError(failure instanceof Error ? failure.message : 'The coupon action could not be completed.');
		} finally {
			mutationLock.current = false;
			setBusyId('');
		}
	}

	return (
		<div className="admin-coupons-page">
			<header className="admin-page-header">
				<div>
					<Typography className="admin-page-kicker">Promotion management</Typography>
					<Typography component="h1">Coupons</Typography>
					<Typography>Create, schedule, monitor, and manage booking discounts.</Typography>
				</div>
				<div className="admin-coupons-header-actions">
					<span className={`admin-total-count${error && !data ? ' is-unavailable' : ''}`}>
						{error && !data ? 'Total unavailable' : loading && !data ? 'Loading total' : `${total} coupons`}
					</span>
					<Button variant="contained" startIcon={<AddOutlined />} onClick={openCreate}>
						Create Coupon
					</Button>
				</div>
			</header>

			<section className="admin-coupons-toolbar" aria-label="Coupon filters">
				<TextField
					size="small"
					label="Search coupons"
					value={searchText}
					onChange={(event) => setSearchText(event.target.value)}
				/>
				<TextField
					select
					size="small"
					label="Type"
					value={couponType}
					onChange={(event) => {
						setCouponType(event.target.value as typeof couponType);
						setPage(1);
					}}
				>
					<MenuItem value="ALL">All types</MenuItem>
					<MenuItem value={CouponType.FIXED}>Fixed</MenuItem>
					<MenuItem value={CouponType.PERCENT}>Percent</MenuItem>
				</TextField>
				<TextField
					select
					size="small"
					label="Status"
					value={couponStatus}
					onChange={(event) => {
						setCouponStatus(event.target.value as typeof couponStatus);
						setPage(1);
					}}
				>
					<MenuItem value="ALL">All statuses</MenuItem>
					<MenuItem value={CouponStatus.ACTIVE}>Active</MenuItem>
					<MenuItem value={CouponStatus.EXPIRED}>Expired</MenuItem>
					<MenuItem value={CouponStatus.DISABLED}>Disabled</MenuItem>
				</TextField>
				<TextField
					select
					size="small"
					label="Sort"
					value={sort}
					onChange={(event) => {
						setSort(event.target.value as typeof sort);
						setPage(1);
					}}
				>
					<MenuItem value="newest">Newest first</MenuItem>
					<MenuItem value="oldest">Oldest first</MenuItem>
				</TextField>
			</section>

			<div className="admin-members-feedback">
				{feedback ? <Alert severity="success">{feedback}</Alert> : null}
				{actionError && !selectedAction ? (
					<Alert severity="error" action={<Button onClick={() => void refetch()}>Refresh list</Button>}>
						{actionError}
					</Alert>
				) : null}
				{error && data ? (
					<Alert severity="warning" action={<Button onClick={() => void refetch()}>Retry</Button>}>
						The latest coupon data could not be refreshed.
					</Alert>
				) : null}
			</div>

			<div ref={resultsRef} className="admin-members-results" aria-busy={loading}>
				{loading && !data ? (
					<CouponSkeleton />
				) : error && !data ? (
					<Alert severity="error" action={<Button onClick={() => void refetch()}>Retry</Button>}>
						Coupons could not be loaded. Your filters have been preserved.
					</Alert>
				) : coupons.length === 0 ? (
					<Paper className="admin-members-empty" elevation={0}>
						<Typography component="h2">{filtered ? 'No matching coupons' : 'No coupons yet'}</Typography>
						<Typography>
							{filtered
								? 'Try another search, type, or status filter.'
								: 'Create a coupon to offer a booking discount.'}
						</Typography>
						{filtered ? (
							<Button onClick={clearFilters}>Clear filters</Button>
						) : (
							<Button variant="contained" onClick={openCreate}>
								Create Coupon
							</Button>
						)}
					</Paper>
				) : (
					<Paper className="admin-members-table admin-coupons-table" elevation={0}>
						<div className="admin-coupons-table-header" aria-hidden="true">
							<span>Coupon</span>
							<span>Discount</span>
							<span>Minimum</span>
							<span>Usage</span>
							<span>Validity</span>
							<span>Status</span>
							<span>Created</span>
							<span>Actions</span>
						</div>
						<div className="admin-members-list">
							{coupons.map((coupon) => (
								<CouponRow
									key={coupon._id}
									coupon={coupon}
									busy={Boolean(busyId)}
									onEdit={() => openEdit(coupon)}
									onUsage={() => setUsageCoupon(coupon)}
									onAction={(action) => {
										setActionError('');
										setSelectedAction({ coupon, action });
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

			<Dialog open={formOpen} onClose={closeForm} fullWidth maxWidth="md" className="admin-coupon-dialog">
				<DialogTitle>{editingCoupon ? 'Edit Coupon' : 'Create Coupon'}</DialogTitle>
				<DialogContent>
					<AdminCouponForm
						values={form}
						errors={formErrors}
						disabled={Boolean(busyId)}
						isEdit={Boolean(editingCoupon)}
						onChange={(next) => {
							setForm(next);
							setFormErrors({});
							setFormError('');
						}}
					/>
					{formError ? <Alert severity="error">{formError}</Alert> : null}
				</DialogContent>
				<DialogActions>
					<Button disabled={Boolean(busyId)} onClick={closeForm}>
						Cancel
					</Button>
					<Button variant="contained" disabled={Boolean(busyId)} onClick={() => void submitForm()}>
						{busyId ? 'Saving...' : editingCoupon ? 'Save Changes' : 'Create Coupon'}
					</Button>
				</DialogActions>
			</Dialog>

			<Dialog
				open={Boolean(selectedAction)}
				onClose={() => {
					if (!busyId) setSelectedAction(null);
				}}
				fullWidth
				maxWidth="xs"
				className="admin-coupon-dialog"
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
						color={copy.color}
						disabled={Boolean(busyId)}
						onClick={() => void confirmAction()}
					>
						{busyId ? 'Working...' : copy.confirm}
					</Button>
				</DialogActions>
			</Dialog>

			<AdminCouponDetail open={Boolean(usageCoupon)} coupon={usageCoupon} onClose={() => setUsageCoupon(null)} />
		</div>
	);
}
