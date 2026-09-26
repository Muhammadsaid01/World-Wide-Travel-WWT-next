import type { TravelerInput } from './traveler.input';
import { BookingStatus } from '../../enums/booking.enum';
import { Direction } from '../../enums/common.enum';

export interface BookingInput {
	travelers: Omit<TravelerInput, 'bookingId'>[];
	packageId: string;
	scheduleId: string;

	adultCount?: number;
	childCount?: number;
	infantCount?: number;

	couponCode?: string;

	contactName: string;
	contactPhone: string;

	currency: string;

	contactEmail?: string;
	specialRequest?: string;
}

interface BISearch {
	bookingStatus?: BookingStatus;
	memberId?: string;
	agentId?: string;
	packageId?: string;
	text?: string;
}

export interface BookingsInquiry {
	page: number;
	limit: number;

	sort?: string;
	direction?: Direction;
	search?: BISearch;
}

export interface UpdateBookingStatusInput {
	bookingId: string;
	bookingStatus: BookingStatus;
}

export interface CancelBookingInput {
	_id: string;
	reason?: string;
}
