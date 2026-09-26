import { makeVar } from '@apollo/client';

import type { CustomJwtPayload } from '@/libs/types/customJwtPayload';

export const currentUserVar = makeVar<CustomJwtPayload | null>(null);

// Temporary, non-sensitive selection only. Refresh intentionally clears the draft.
export const bookingDraftVar = makeVar<import('@/libs/types/booking/booking-draft').BookingDraft | null>(null);

// Created booking summary only; never retain traveler/passport details here.
export const createdBookingVar = makeVar<import('@/libs/types/booking/booking').BookingHandoff | null>(null);
