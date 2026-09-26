import type { BookingInput } from './booking.input';

export type BookingDraft = Required<
	Pick<BookingInput, 'packageId' | 'scheduleId' | 'adultCount' | 'childCount' | 'infantCount' | 'currency'>
> & { peopleCount: number };
