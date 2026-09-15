import { Direction } from '../../enums/common.enum';

export interface CouponUsageInput {
	couponId: string;
	bookingId: string;
	discountAmount: number;
}

export interface CouponUsageInquiry {
	page: number;
	limit: number;

	sort?: string;
	direction?: Direction;
}