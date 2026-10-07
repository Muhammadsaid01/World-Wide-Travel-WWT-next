import { GET_PUBLIC_COUPONS } from '@/apollo/user/query';
import { CouponType } from '@/libs/enums/booking.enum';
import { useQuery } from '@apollo/client';
import CardGiftcardOutlined from '@mui/icons-material/CardGiftcardOutlined';
import { Alert, Button, Skeleton } from '@mui/material';
import Link from 'next/link';

function formatCouponValue(type: CouponType, value: number) {
	return type === CouponType.PERCENT ? `${value}% off` : `${value.toLocaleString('en-US')} off`;
}

export default function CouponSection() {
	const query = useQuery(GET_PUBLIC_COUPONS, {
		variables: { input: { page: 1, limit: 2, sort: 'validUntil', direction: 'ASC' } },
		fetchPolicy: 'network-only',
	});
	const coupons = query.data?.getPublicCoupons.list ?? [];
	return (
		<section className="home-section home-offers-section" aria-labelledby="home-offers-title">
			<div className="home-section-heading"><div>
				<span className="home-section-kicker">Make your journey go further</span><h2 id="home-offers-title">Special Offers</h2>
			</div></div>
			{query.loading ? (
				<div className="home-offers" aria-label="Loading special offers"><Skeleton variant="rounded" height={170} /><Skeleton variant="rounded" height={170} /></div>
			) : query.error ? (
				<Alert severity="info" action={<Button onClick={() => void query.refetch()}>Retry</Button>}>Offers are temporarily unavailable.</Alert>
			) : coupons.length === 0 ? (
				<div className="home-empty-state">No public offers are available right now.</div>
			) : (
				<div className="home-offers">
					{coupons.map((coupon) => (
						<article key={coupon.couponCode}>
							<CardGiftcardOutlined />
							<div><span className="home-offer-code">{coupon.couponCode}</span><h3>{coupon.couponTitle}</h3>
								<strong>{formatCouponValue(coupon.couponType, coupon.couponValue)}</strong>
								{coupon.couponDesc && <p>{coupon.couponDesc}</p>}
								<small>Minimum {coupon.minAmount.toLocaleString('en-US')} · Valid until {new Date(coupon.validUntil).toLocaleDateString()}</small>
							</div>
							<Button component={Link} href="/package" variant="contained">Explore</Button>
						</article>
					))}
				</div>
			)}
		</section>
	);
}
