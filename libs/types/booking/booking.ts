import { BookingStatus } from '../../enums/booking.enum';

import type { Agent } from '../../types/agent/agent';
import type { Member, TotalCounter } from '../../types/member/member';
import type { PackageSchedule } from '../../types/package/package-schedule';
import type { TravelPackage } from '../../types/package/travel-package';

export interface Booking {
	_id: string;
	bookingCode: string;

	memberId: string;
	packageId: string;
	scheduleId: string;
	agentId: string;

	bookingStatus: BookingStatus;

	adultCount: number;
	childCount: number;
	infantCount: number;
	peopleCount: number;

	totalPrice: number;
	discountAmount: number;
	finalPrice: number;

	currency: string;

	couponId?: string;

	contactName: string;
	contactPhone: string;
	contactEmail?: string;

	specialRequest?: string;

	cancelledAt?: string;
	bookingDeletedAt?: string;

	createdAt: string;
	updatedAt: string;

	/** Aggregate lookup fields */
	customerData?: Member;
	packageData?: TravelPackage;
	scheduleData?: PackageSchedule;
	agentData?: Agent;
	memberData?: Member;
}

export interface Bookings {
	list: Booking[];
	metaCounter?: TotalCounter[];
}