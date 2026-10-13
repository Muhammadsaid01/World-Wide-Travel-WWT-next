import { GET_PUBLIC_COUPONS } from '@/apollo/user/query';
import { CouponType } from '@/libs/enums/booking.enum';
import { useQuery } from '@apollo/client';
import CardGiftcardOutlined from '@mui/icons-material/CardGiftcardOutlined';
import { Alert, Button, Skeleton } from '@mui/material';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

export default function CouponSection() {
	const { t, i18n } = useTranslation(['home', 'common']);
	const query = useQuery(GET_PUBLIC_COUPONS, {
		variables: { input: { page: 1, limit: 2, sort: 'validUntil', direction: 'ASC' } },
		fetchPolicy: 'network-only',
	});
	const coupons = query.data?.getPublicCoupons.list ?? [];
	return (
		<section className="home-section home-offers-section" aria-labelledby="home-offers-title">
			<div className="home-section-heading"><div>
				<span className="home-section-kicker">{t('offers.eyebrow')}</span><h2 id="home-offers-title">{t('offers.title')}</h2>
			</div></div>
			{query.loading ? (
				<div className="home-offers" aria-label={t('offers.loading')}><Skeleton variant="rounded" height={170} /><Skeleton variant="rounded" height={170} /></div>
			) : query.error ? (
				<Alert severity="info" action={<Button onClick={() => void query.refetch()}>{t('actions.retry', { ns: 'common' })}</Button>}>{t('offers.error')}</Alert>
			) : coupons.length === 0 ? (
				<div className="home-empty-state">{t('offers.empty')}</div>
			) : (
				<div className="home-offers">
					{coupons.map((coupon) => (
						<article key={coupon.couponCode}>
							<CardGiftcardOutlined />
							<div><span className="home-offer-code">{coupon.couponCode}</span><h3>{coupon.couponTitle}</h3>
								<strong>{t(coupon.couponType === CouponType.PERCENT ? 'offers.percentOff' : 'offers.amountOff', { value: coupon.couponValue.toLocaleString(i18n.language) })}</strong>
								{coupon.couponDesc && <p>{coupon.couponDesc}</p>}
								<small>{t('offers.minimum', { amount: coupon.minAmount.toLocaleString(i18n.language), date: new Date(coupon.validUntil).toLocaleDateString(i18n.language) })}</small>
							</div>
							<Button component={Link} href="/package" variant="contained">{t('offers.explore')}</Button>
						</article>
					))}
				</div>
			)}
		</section>
	);
}
