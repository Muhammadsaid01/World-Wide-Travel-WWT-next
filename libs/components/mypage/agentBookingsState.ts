import { BookingStatus } from '../../enums/booking.enum';
import type { AgentBookingsInput } from '../../../apollo/user/query';

export const AGENT_BOOKINGS_PAGE_SIZE = 10;

/** Mirrors the agent transitions enforced by BookingService.updateBookingStatus. */
export const agentBookingTransitions: Record<BookingStatus, readonly BookingStatus[]> = {
	[BookingStatus.PENDING]: [BookingStatus.CONFIRMED, BookingStatus.REJECTED],
	[BookingStatus.CONFIRMED]: [BookingStatus.COMPLETED],
	[BookingStatus.COMPLETED]: [],
	[BookingStatus.CANCELLED]: [],
	[BookingStatus.REJECTED]: [],
};

export function agentBookingsInput(
	page: number,
	status: BookingStatus | '',
	text: string,
	direction: 'ASC' | 'DESC',
): AgentBookingsInput {
	return {
		page,
		limit: AGENT_BOOKINGS_PAGE_SIZE,
		sort: 'createdAt',
		direction,
		search: { ...(status ? { bookingStatus: status } : {}), ...(text.trim() ? { text: text.trim() } : {}) },
	};
}
