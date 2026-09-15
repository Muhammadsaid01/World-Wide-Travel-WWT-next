import type { Booking } from '../../types/booking/booking';
import type { Coupon } from '../../types/booking/coupon';
import type { Member, TotalCounter } from '../../types/member/member';

export interface CouponUsage {
	_id: string;

	couponId: string;
	memberId: string;
	bookingId: string;

	discountAmount: number;

	createdAt: string;
	updatedAt: string;
	usedAt: string;

	couponData?: Coupon;
	bookingData?: Booking;
	memberData?: Member;
}

export interface CouponUsages {
	list: CouponUsage[];
	metaCounter?: TotalCounter[];
}