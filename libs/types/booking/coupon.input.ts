import { Direction } from '@/libs/enums/common.enum';
import { CouponStatus, CouponType } from '../../enums/booking.enum';

export interface CouponInput {
	couponCode: string;
	couponTitle: string;
	couponDesc?: string;

	couponType: CouponType;
	couponValue: number;

	minAmount?: number;
	maxDiscount?: number;

	usageLimit?: number;
	perUserLimit: number;

	validFrom: string;
	validUntil: string;
}

export interface CouponSearch {
	text?: string;
	couponType?: CouponType;
	couponStatus?: CouponStatus;
}

export interface CouponInquiry {
	page: number;
	limit: number;

	sort?: string;
	direction?: Direction;
	search?: CouponSearch;
}

export interface UpdateCouponStatusInput {
	couponId: string;
	couponStatus: CouponStatus;
}

export interface ValidateCouponInput {
	couponCode: string;
	bookingAmount: number;
}