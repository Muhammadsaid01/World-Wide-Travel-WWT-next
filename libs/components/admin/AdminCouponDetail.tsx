import { type ChangeEvent, useMemo, useState } from 'react';
import { useQuery } from '@apollo/client';
import { Alert, Button, Dialog, DialogContent, DialogTitle, Pagination, Skeleton, Typography } from '@mui/material';
import { GET_ADMIN_COUPON_USAGES, type AdminCouponRow, type AdminCouponUsagesInput } from '@/apollo/admin/query';
import { formatScheduleDate } from '../package/PackageSchedules';

const PAGE_SIZE = 10;

function formatNumber(value: number) {
	return new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(value);
}

function memberLabel(item: {
	memberId: string;
	memberData?: { memberFullName?: string; memberNick: string; memberEmail?: string } | null;
}) {
	return item.memberData?.memberFullName?.trim() || item.memberData?.memberNick?.trim() || item.memberId;
}

function bookingLabel(item: { bookingId: string; bookingData?: { bookingCode: string; contactName: string } | null }) {
	return item.bookingData?.bookingCode?.trim() || item.bookingData?.contactName?.trim() || item.bookingId;
}

export default function AdminCouponDetail({
	open,
	coupon,
	onClose,
}: {
	open: boolean;
	coupon: AdminCouponRow | null;
	onClose: () => void;
}) {
	const [page, setPage] = useState(1);

	const input = useMemo<AdminCouponUsagesInput>(
		() => ({ page, limit: PAGE_SIZE, sort: 'usedAt', direction: 'DESC' }),
		[page],
	);
	const { data, loading, error, refetch } = useQuery(GET_ADMIN_COUPON_USAGES, {
		variables: { couponId: coupon?._id ?? '', input },
		skip: !open || !coupon?._id,
		fetchPolicy: 'no-cache',
		notifyOnNetworkStatusChange: true,
	});

	const usages = data?.getCouponUsages.list ?? [];
	const total = data?.getCouponUsages.metaCounter?.[0]?.total ?? 0;
	const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

	function changePage(_: ChangeEvent<unknown>, nextPage: number) {
		setPage(nextPage);
	}

	function closeDialog() {
		setPage(1);
		onClose();
	}

	return (
		<Dialog open={open} onClose={closeDialog} fullWidth maxWidth="md" className="admin-coupon-usage-dialog">
			<DialogTitle>
				Usage History
				{coupon ? (
					<span>
						{coupon.couponCode} · {coupon.couponTitle}
					</span>
				) : null}
			</DialogTitle>
			<DialogContent>
				{loading && !data ? (
					<div className="admin-coupon-usage-skeleton" aria-label="Loading coupon usage history">
						{Array.from({ length: 4 }, (_, index) => (
							<Skeleton key={index} variant="rounded" height={66} />
						))}
					</div>
				) : error && !data ? (
					<Alert severity="error" action={<Button onClick={() => void refetch()}>Retry</Button>}>
						Usage history could not be loaded.
					</Alert>
				) : usages.length === 0 ? (
					<div className="admin-coupon-usage-empty">
						<Typography component="h3">No coupon usage yet</Typography>
						<Typography>This coupon has no recorded booking usage.</Typography>
					</div>
				) : (
					<>
						{error ? (
							<Alert severity="warning" action={<Button onClick={() => void refetch()}>Retry</Button>}>
								The latest usage data could not be refreshed.
							</Alert>
						) : null}
						<div className="admin-coupon-usage-list" aria-busy={loading}>
							<div className="admin-coupon-usage-header" aria-hidden="true">
								<span>Member</span>
								<span>Booking</span>
								<span>Discount</span>
								<span>Used</span>
							</div>
							{usages.map((usage) => (
								<article className="admin-coupon-usage-row" key={usage._id}>
									<div data-label="Member">
										<strong>{memberLabel(usage)}</strong>
										<span>{usage.memberData?.memberEmail || usage.memberId}</span>
									</div>
									<div data-label="Booking">
										<strong>{bookingLabel(usage)}</strong>
										<span>{usage.bookingData?.contactName || usage.bookingId}</span>
									</div>
									<div data-label="Discount">
										<strong>{formatNumber(usage.discountAmount)}</strong>
									</div>
									<div data-label="Used">
										<strong>{formatScheduleDate(usage.usedAt)}</strong>
									</div>
								</article>
							))}
						</div>
						{total > PAGE_SIZE ? (
							<div className="admin-coupon-usage-pagination">
								<Pagination count={pageCount} page={Math.min(page, pageCount)} onChange={changePage} color="primary" />
							</div>
						) : null}
					</>
				)}
				<div className="admin-coupon-usage-close">
					<Button onClick={closeDialog}>Close</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
