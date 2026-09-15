import type { TotalCounter } from '@/libs/types/member/member';
import { CouponStatus, CouponType } from '../../enums/booking.enum';

export interface Coupon {
	_id: string;

	couponCode: string;
	couponTitle: string;
	couponDesc?: string;

	couponType: CouponType;
	couponValue: number;

	minAmount: number;
	maxDiscount?: number;

	usageLimit: number;
	usedCount: number;
	perUserLimit: number;

	validFrom: string;
	validUntil: string;

	couponStatus: CouponStatus;

	couponDeletedAt?: string;

	createdAt: string;
	updatedAt: string;
}

export interface Coupons {
	list: Coupon[];
	metaCounter?: TotalCounter[];
}

export interface CouponValidation {
	valid: boolean;
	couponId: string;
	couponCode: string;
	discountAmount: number;
	finalPrice: number;
	message: string;
}

export interface PublicCoupon {
	couponCode: string;
	couponTitle: string;
	couponDesc?: string;

	couponType: CouponType;
	couponValue: number;

	minAmount: number;
	maxDiscount?: number;

	validUntil: string;
}

export interface PublicCoupons {
	list: PublicCoupon[];
	metaCounter?: TotalCounter[];
}