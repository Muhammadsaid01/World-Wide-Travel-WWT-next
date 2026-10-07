import { type ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import SearchOutlined from '@mui/icons-material/SearchOutlined';
import {
	Alert,
	Button,
	Chip,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	InputAdornment,
	MenuItem,
	Pagination,
	Paper,
	Skeleton,
	TextField,
	Typography,
} from '@mui/material';
import { DELETE_PAYMENT_BY_ADMIN, UPDATE_PAYMENT_STATUS } from '@/apollo/admin/mutation';
import { GET_ADMIN_PAYMENTS, type AdminPaymentRow } from '@/apollo/admin/query';
import { PaymentMethod, PaymentStatus } from '@/libs/enums/booking.enum';
import { formatScheduleDate } from '../package/PackageSchedules';

const PAGE_SIZE = 10;
const SEARCH_DELAY = 300;
const EMPTY_PAYMENTS: AdminPaymentRow[] = [];

type PaymentAction =
	| { payment: AdminPaymentRow; kind: 'STATUS'; nextStatus: PaymentStatus }
	| { payment: AdminPaymentRow; kind: 'DELETE' };

const statusOptions: Array<{ value: PaymentStatus | 'ALL'; label: string }> = [
	{ value: 'ALL', label: 'All statuses' },
	{ value: PaymentStatus.PENDING, label: 'Pending' },
	{ value: PaymentStatus.PAID, label: 'Paid' },
	{ value: PaymentStatus.FAILED, label: 'Failed' },
	{ value: PaymentStatus.CANCELLED, label: 'Cancelled' },
	{ value: PaymentStatus.REFUNDED, label: 'Refunded' },
];

const methodOptions: Array<{ value: PaymentMethod | 'ALL'; label: string }> = [
	{ value: 'ALL', label: 'All methods' },
	...Object.values(PaymentMethod).map((value) => ({ value, label: value.replaceAll('_', ' ') })),
];

function enumLabel(value: string) {
	return value
		.toLowerCase()
		.split('_')
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(' ');
}

function formatMoney(value: number, currency: string) {
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

function dateLabel(value?: string) {
	return value ? formatScheduleDate(value) : 'Not recorded';
}

function paymentMatches(payment: AdminPaymentRow, search: string, status: PaymentStatus | 'ALL', method: PaymentMethod | 'ALL') {
	if (status !== 'ALL' && payment.paymentStatus !== status) return false;
	if (method !== 'ALL' && payment.paymentMethod !== method) return false;
	if (!search) return true;
	const haystack = [
		payment._id,
		payment.bookingId,
		payment.memberId,
		payment.agentId,
		payment.transactionId,
	].filter(Boolean).join(' ').toLowerCase();
	return haystack.includes(search.toLowerCase());
}

function visiblePayments(
	payments: AdminPaymentRow[],
	search: string,
	status: PaymentStatus | 'ALL',
	method: PaymentMethod | 'ALL',
	sort: 'newest' | 'oldest',
) {
	return payments
		.filter((payment) => paymentMatches(payment, search, status, method))
		.sort((left, right) => {
			const difference = new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime();
			return sort === 'newest' ? -difference : difference;
		});
}

function PaymentRow({ payment, busy, onDetails, onAction }: {
	payment: AdminPaymentRow;
	busy: boolean;
	onDetails: () => void;
	onAction: (action: PaymentAction) => void;
}) {
	return (
		<article className="admin-payment-row">
			<div className="admin-payment-identity" data-label="Payment">
				<strong>{payment._id}</strong>
				<span>{dateLabel(payment.createdAt)}</span>
			</div>
			<div className="admin-payment-cell" data-label="Booking">
				<strong>{payment.bookingId}</strong>
				<span>Member {payment.memberId}</span>
			</div>
			<div className="admin-payment-cell" data-label="Agent">
				<strong>{payment.agentId}</strong>
				<span>Agent ID</span>
			</div>
			<div className="admin-payment-cell" data-label="Method">
				<strong>{enumLabel(payment.paymentMethod)}</strong>
				{payment.transactionId ? <span>{payment.transactionId}</span> : <span>No transaction ID</span>}
			</div>
			<div className="admin-payment-cell" data-label="Amount">
				<strong>{formatMoney(payment.paymentAmount, payment.currency)}</strong>
				{payment.refundAmount > 0 ? <span>Refunded {formatMoney(payment.refundAmount, payment.currency)}</span> : null}
			</div>
			<div className="admin-payment-cell" data-label="Status">
				<Chip label={enumLabel(payment.paymentStatus)} size="small" className={`admin-payment-status is-${payment.paymentStatus.toLowerCase()}`} />
			</div>
			<div className="admin-payment-cell" data-label="Payment date">
				<strong>{dateLabel(payment.paymentDate)}</strong>
				<span>Updated {dateLabel(payment.updatedAt)}</span>
			</div>
			<div className="admin-payment-actions" data-label="Actions">
				<Button size="small" variant="outlined" startIcon={<InfoOutlined />} disabled={busy} onClick={onDetails}>
					Details
				</Button>
				{payment.paymentStatus === PaymentStatus.PENDING ? (
					<>
						<Button size="small" disabled={busy} onClick={() => onAction({ payment, kind: 'STATUS', nextStatus: PaymentStatus.PAID })}>Mark as Paid</Button>
						<Button size="small" disabled={busy} onClick={() => onAction({ payment, kind: 'STATUS', nextStatus: PaymentStatus.FAILED })}>Mark as Failed</Button>
						<Button size="small" disabled={busy} onClick={() => onAction({ payment, kind: 'STATUS', nextStatus: PaymentStatus.CANCELLED })}>Cancel Payment</Button>
					</>
				) : null}
				{payment.paymentStatus === PaymentStatus.PAID ? (
					<Button size="small" disabled={busy} onClick={() => onAction({ payment, kind: 'STATUS', nextStatus: PaymentStatus.REFUNDED })}>Mark as Refunded</Button>
				) : null}
				{payment.paymentStatus === PaymentStatus.FAILED || payment.paymentStatus === PaymentStatus.CANCELLED ? (
					<Button size="small" color="error" disabled={busy} onClick={() => onAction({ payment, kind: 'DELETE' })}>Delete</Button>
				) : null}
			</div>
		</article>
	);
}

function PaymentDetails({ payment }: { payment: AdminPaymentRow }) {
	const fields: Array<[string, string]> = [
		['Payment ID', payment._id],
		['Booking ID', payment.bookingId],
		['Member ID', payment.memberId],
		['Agent ID', payment.agentId],
		['Payment Method', enumLabel(payment.paymentMethod)],
		['Payment Status', enumLabel(payment.paymentStatus)],
		['Payment Amount', formatMoney(payment.paymentAmount, payment.currency)],
		['Currency', payment.currency],
		['Transaction ID', payment.transactionId || 'Not recorded'],
		['Payment Date', dateLabel(payment.paymentDate)],
		['Refund Amount', formatMoney(payment.refundAmount, payment.currency)],
		['Refund Reason', payment.refundReason || 'Not recorded'],
		['Refunded At', dateLabel(payment.refundedAt)],
		['Created At', dateLabel(payment.createdAt)],
		['Updated At', dateLabel(payment.updatedAt)],
	];
	return (
		<div className="admin-payment-detail-grid">
			{fields.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}
		</div>
	);
}

function actionCopy(action: PaymentAction | null) {
	if (!action) return { title: '', description: '', confirm: '', color: 'primary' as const, refund: false };
	if (action.kind === 'DELETE') {
		return {
			title: 'Delete payment record?',
			description: `This will soft-delete payment ${action.payment._id} from Admin payment management. It will not permanently remove the database record.`,
			confirm: 'Delete Record',
			color: 'error' as const,
			refund: false,
		};
	}
	if (action.nextStatus === PaymentStatus.REFUNDED) {
		return {
			title: 'Mark payment as refunded?',
			description: 'Marking this payment as refunded only updates the internal payment status. It does not transfer money. According to the backend lifecycle, the related booking may also be cancelled.',
			confirm: 'Mark as Refunded',
			color: 'warning' as const,
			refund: true,
		};
	}
	return {
		title: `Mark payment as ${enumLabel(action.nextStatus).toLowerCase()}?`,
		description: `The backend will transition payment ${action.payment._id} from ${enumLabel(action.payment.paymentStatus)} to ${enumLabel(action.nextStatus)} and apply its related booking side effects.`,
		confirm: `Mark as ${enumLabel(action.nextStatus)}`,
		color: 'primary' as const,
		refund: false,
	};
}

function PaymentSkeleton() {
	return <div className="admin-members-skeleton" aria-label="Loading payments">{Array.from({ length: 5 }, (_, index) => <Skeleton key={index} variant="rounded" height={94} />)}</div>;
}

export default function AdminPayments() {
	const mutationLock = useRef(false);
	const resultsRef = useRef<HTMLDivElement>(null);
	const [searchDraft, setSearchDraft] = useState('');
	const [search, setSearch] = useState('');
	const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | 'ALL'>('ALL');
	const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | 'ALL'>('ALL');
	const [sort, setSort] = useState<'newest' | 'oldest'>('newest');
	const [page, setPage] = useState(1);
	const [selectedPayment, setSelectedPayment] = useState<AdminPaymentRow | null>(null);
	const [selectedAction, setSelectedAction] = useState<PaymentAction | null>(null);
	const [busyId, setBusyId] = useState('');
	const [actionError, setActionError] = useState('');
	const [feedback, setFeedback] = useState('');

	useEffect(() => {
		const timer = window.setTimeout(() => {
			setSearch(searchDraft.trim());
			setPage(1);
		}, SEARCH_DELAY);
		return () => window.clearTimeout(timer);
	}, [searchDraft]);

	const { data, loading, error, refetch } = useQuery(GET_ADMIN_PAYMENTS, {
		fetchPolicy: 'no-cache',
		notifyOnNetworkStatusChange: true,
	});
	const [updatePaymentStatus] = useMutation(UPDATE_PAYMENT_STATUS);
	const [deletePayment] = useMutation(DELETE_PAYMENT_BY_ADMIN);

	const payments = data?.getAllPaymentsByAdmin ?? EMPTY_PAYMENTS;
	const filteredPayments = useMemo(() => visiblePayments(payments, search, paymentStatus, paymentMethod, sort), [payments, paymentMethod, paymentStatus, search, sort]);
	const pageCount = Math.max(1, Math.ceil(filteredPayments.length / PAGE_SIZE));
	const paginatedPayments = filteredPayments.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
	const hasFilters = Boolean(search) || paymentStatus !== 'ALL' || paymentMethod !== 'ALL';
	const copy = actionCopy(selectedAction);

	function changePage(_: ChangeEvent<unknown>, nextPage: number) {
		setPage(nextPage);
		resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}

	function clearFilters() {
		setSearchDraft('');
		setSearch('');
		setPaymentStatus('ALL');
		setPaymentMethod('ALL');
		setSort('newest');
		setPage(1);
	}

	async function synchronize() {
		try {
			const refreshed = await refetch();
			const freshPayments = refreshed.data.getAllPaymentsByAdmin ?? [];
			const freshVisible = visiblePayments(freshPayments, search, paymentStatus, paymentMethod, sort);
			const lastPage = Math.max(1, Math.ceil(freshVisible.length / PAGE_SIZE));
			if (page > lastPage) setPage(lastPage);
		} catch {
			setActionError('The payment was changed, but the list could not be refreshed. Retry to synchronize it.');
		}
	}

	async function confirmAction() {
		if (!selectedAction || mutationLock.current) return;
		mutationLock.current = true;
		setBusyId(selectedAction.payment._id);
		setActionError('');
		setFeedback('');
		try {
			if (selectedAction.kind === 'DELETE') {
				const response = await deletePayment({ variables: { paymentId: selectedAction.payment._id } });
				if (!response.data?.deletePaymentByAdmin) throw new Error('The server did not confirm payment deletion.');
				setFeedback(`Payment ${selectedAction.payment._id} was soft-deleted.`);
			} else {
				const response = await updatePaymentStatus({ variables: { input: { paymentId: selectedAction.payment._id, paymentStatus: selectedAction.nextStatus } } });
				if (!response.data?.updatePaymentStatus) throw new Error('The server did not confirm the payment status change.');
				setFeedback(`Payment ${selectedAction.payment._id} was marked ${enumLabel(selectedAction.nextStatus).toLowerCase()}.`);
			}
			setSelectedAction(null);
			await synchronize();
		} catch (failure) {
			setActionError(failure instanceof Error ? failure.message : 'The payment action could not be completed.');
		} finally {
			mutationLock.current = false;
			setBusyId('');
		}
	}

	return (
		<div className="admin-payments-page">
			<header className="admin-page-header">
				<div>
					<Typography className="admin-page-kicker">Payment management</Typography>
					<Typography component="h1">Payments</Typography>
					<Typography>Review payment records and apply only the payment transitions supported by the backend.</Typography>
				</div>
				<span className={`admin-total-count${error && !data ? ' is-unavailable' : ''}`}>
					{error && !data ? 'Total unavailable' : loading && !data ? 'Loading payments' : `${filteredPayments.length} of ${payments.length} payments`}
				</span>
			</header>

			<section className="admin-payments-toolbar" aria-label="Payment filters">
				<TextField size="small" label="Search payment IDs" value={searchDraft} onChange={(event) => setSearchDraft(event.target.value)} slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchOutlined fontSize="small" /></InputAdornment> } }} />
				<TextField select size="small" label="Status" value={paymentStatus} onChange={(event) => { setPaymentStatus(event.target.value as typeof paymentStatus); setPage(1); }}>
					{statusOptions.map((option) => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}
				</TextField>
				<TextField select size="small" label="Method" value={paymentMethod} onChange={(event) => { setPaymentMethod(event.target.value as typeof paymentMethod); setPage(1); }}>
					{methodOptions.map((option) => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}
				</TextField>
				<TextField select size="small" label="Sort" value={sort} onChange={(event) => { setSort(event.target.value as typeof sort); setPage(1); }}>
					<MenuItem value="newest">Newest first</MenuItem>
					<MenuItem value="oldest">Oldest first</MenuItem>
				</TextField>
			</section>

			<div className="admin-members-feedback">
				{feedback ? <Alert severity="success">{feedback}</Alert> : null}
				{actionError && !selectedAction ? <Alert severity="error" action={<Button onClick={() => void refetch()}>Refresh list</Button>}>{actionError}</Alert> : null}
				{error && data ? <Alert severity="warning" action={<Button onClick={() => void refetch()}>Retry</Button>}>The latest payment data could not be refreshed.</Alert> : null}
			</div>

			<div ref={resultsRef} className="admin-members-results" aria-busy={loading}>
				{loading && !data ? <PaymentSkeleton /> : error && !data ? (
					<Alert severity="error" action={<Button onClick={() => void refetch()}>Retry</Button>}>Payments could not be loaded. Retry to continue.</Alert>
				) : paginatedPayments.length === 0 ? (
					<Paper className="admin-members-empty" elevation={0}>
						<Typography component="h2">{hasFilters ? 'No matching payments' : 'No payments yet'}</Typography>
						<Typography>{hasFilters ? 'Try another search or filter.' : 'Payment records will appear here when bookings are paid.'}</Typography>
						{hasFilters ? <Button onClick={clearFilters}>Clear filters</Button> : null}
					</Paper>
				) : (
					<Paper className="admin-members-table admin-payments-table" elevation={0}>
						<div className="admin-payments-table-header" aria-hidden="true"><span>Payment</span><span>Booking</span><span>Agent</span><span>Method</span><span>Amount</span><span>Status</span><span>Dates</span><span>Actions</span></div>
						<div className="admin-members-list">{paginatedPayments.map((payment) => <PaymentRow key={payment._id} payment={payment} busy={Boolean(busyId)} onDetails={() => setSelectedPayment(payment)} onAction={(action) => { setActionError(''); setSelectedAction(action); }} />)}</div>
					</Paper>
				)}
			</div>

			{!loading && !error && filteredPayments.length > PAGE_SIZE ? <div className="admin-members-pagination"><Pagination count={pageCount} page={Math.min(page, pageCount)} onChange={changePage} color="primary" /></div> : null}

			<Dialog open={Boolean(selectedPayment)} onClose={() => setSelectedPayment(null)} fullWidth maxWidth="md" className="admin-payment-detail-dialog">
				<DialogTitle>Payment Details</DialogTitle>
				<DialogContent>{selectedPayment ? <PaymentDetails payment={selectedPayment} /> : null}</DialogContent>
				<DialogActions><Button onClick={() => setSelectedPayment(null)}>Close</Button></DialogActions>
			</Dialog>

			<Dialog open={Boolean(selectedAction)} onClose={() => { if (!busyId) setSelectedAction(null); }} fullWidth maxWidth="sm" className="admin-payment-action-dialog">
				<DialogTitle>{copy.title}</DialogTitle>
				<DialogContent>
					<Typography>{copy.description}</Typography>
					{copy.refund ? <Alert severity="warning">No money is transferred by this action. The backend only records the internal status transition.</Alert> : null}
					{actionError ? <Alert severity="error">{actionError}</Alert> : null}
				</DialogContent>
				<DialogActions><Button disabled={Boolean(busyId)} onClick={() => setSelectedAction(null)}>Cancel</Button><Button variant="contained" color={copy.color} disabled={Boolean(busyId)} onClick={() => void confirmAction()}>{busyId ? 'Working...' : copy.confirm}</Button></DialogActions>
			</Dialog>
		</div>
	);
}
