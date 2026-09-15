import { CouponStatus, CouponType } from '../../enums/booking.enum';

export interface CouponUpdate {
	couponId: string;

	couponTitle?: string;
	couponDesc?: string;

	couponType?: CouponType;
	couponValue?: number;

	minAmount?: number;
	maxDiscount?: number;

	usageLimit?: number;
	perUserLimit?: number;

	validFrom?: string;
	validUntil?: string;

	couponStatus?: CouponStatus;
}