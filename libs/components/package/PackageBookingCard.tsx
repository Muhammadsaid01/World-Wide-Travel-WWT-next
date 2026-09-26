import { useState } from 'react';
import { useRouter } from 'next/router';
import { Alert, Button, Divider, IconButton, Stack, Typography } from '@mui/material';
import Add from '@mui/icons-material/Add';
import Remove from '@mui/icons-material/Remove';
import { bookingDraftVar } from '@/apollo/store';
import type { PackageDetailData } from '@/apollo/user/query';
import type { PackageSchedule } from '@/libs/types/package/package-schedule';
import type { BookingInput } from '@/libs/types/booking/booking.input';
import { ScheduleStatus } from '@/libs/enums/package.enum';
import { formatScheduleDate } from './PackageSchedules';

type Counts = Required<Pick<BookingInput, 'adultCount' | 'childCount' | 'infantCount'>>;
const travelerTypes = [
	['adultCount', 'Adults'],
	['childCount', 'Children'],
	['infantCount', 'Infants'],
] as const;

interface Props {
	item: PackageDetailData;
	selectedScheduleId: string | null;
	schedule?: Pick<PackageSchedule, '_id' | 'startDate' | 'endDate' | 'availableSeats' | 'scheduleStatus'>;
	schedulesReady: boolean;
}

export default function PackageBookingCard({ item, selectedScheduleId, schedule, schedulesReady }: Props) {
	const router = useRouter();
	const minimum = Math.max(1, item.minPeople);
	const capacity = Math.max(0, Math.min(item.maxPeople, schedule?.availableSeats ?? 0));
	const available =
		schedulesReady &&
		schedule?.scheduleStatus === ScheduleStatus.OPEN &&
		schedule._id === selectedScheduleId &&
		capacity >= minimum;
	const [counts, setCounts] = useState<Counts>({
		adultCount: Math.min(minimum, capacity),
		childCount: 0,
		infantCount: 0,
	});
	const peopleCount = counts.adultCount + counts.childCount + counts.infantCount;
	// Match BookingService: all three traveler categories pay the same package price.
	const total =
		item.packagePrice * counts.adultCount +
		item.packagePrice * counts.childCount +
		item.packagePrice * counts.infantCount;
	const valid =
		available && peopleCount >= minimum && peopleCount <= capacity && Number.isFinite(total) && item.packagePrice >= 0;
	const money = (value: number) => `${item.currency} ${value.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;

	function changeCount(field: keyof Counts, change: number) {
		setCounts((previous) => {
			const next = previous[field] + change;
			const nextTotal = previous.adultCount + previous.childCount + previous.infantCount + change;
			if (!available || next < 0 || nextTotal > capacity) return previous;
			return { ...previous, [field]: next };
		});
	}

	function handleContinueBooking() {
		if (!valid || !selectedScheduleId) return;
		bookingDraftVar({
			packageId: item._id,
			scheduleId: selectedScheduleId,
			...counts,
			peopleCount,
			currency: item.currency,
		});
		void router.push('/booking');
	}

	return (
		<aside className="detail-booking" aria-label="Booking information">
			<Stack spacing={2.5}>
				<div>
					<Typography variant="body2" color="text.secondary">
						Price per traveler
					</Typography>
					<strong className="detail-price">{money(item.packagePrice)}</strong>
				</div>
				<div>
					<Typography variant="subtitle2">Selected Date</Typography>
					{schedule ? (
						<Typography variant="body2" color="text.secondary">
							{formatScheduleDate(schedule.startDate)} → {formatScheduleDate(schedule.endDate)}
						</Typography>
					) : (
						<Typography variant="body2" color="text.secondary">
							Select an available date to continue.
						</Typography>
					)}
				</div>
				{schedule && !available && (
					<Alert severity="info">This departure is unavailable or has too few seats for the minimum group size.</Alert>
				)}
				<Divider />
				<div>
					<Typography variant="subtitle2" sx={{ mb: 1 }}>
						Travelers
					</Typography>
					{travelerTypes.map(([field, label]) => (
						<Stack
							key={field}
							direction="row"
							spacing={1}
							sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1 }}
						>
							<Typography variant="body2">{label}</Typography>
							<Stack direction="row" sx={{ alignItems: 'center' }}>
								<IconButton
									aria-label={`Remove ${label.toLowerCase()}`}
									disabled={!available || counts[field] === 0}
									onClick={() => changeCount(field, -1)}
									sx={{ width: 44, height: 44 }}
								>
									<Remove fontSize="small" />
								</IconButton>
								<Typography component="span" aria-live="polite" sx={{ minWidth: 24, textAlign: 'center' }}>
									{counts[field]}
								</Typography>
								<IconButton
									aria-label={`Add ${label.toLowerCase()}`}
									disabled={!available || peopleCount >= capacity}
									onClick={() => changeCount(field, 1)}
									sx={{ width: 44, height: 44 }}
								>
									<Add fontSize="small" />
								</IconButton>
							</Stack>
						</Stack>
					))}
					<Typography variant="caption" color="text.secondary">
						Package group size: {minimum}–{item.maxPeople} travelers.
						{schedule ? ` ${schedule.availableSeats} seats available.` : ''}
					</Typography>
					{available && peopleCount < minimum && (
						<Alert severity="info">
							Select at least {minimum} {minimum === 1 ? 'traveler' : 'travelers'}.
						</Alert>
					)}
					{peopleCount > capacity && schedule && (
						<Alert severity="warning">Reduce the traveler count to {capacity} or fewer.</Alert>
					)}
				</div>
				<Divider />
				<div aria-live="polite">
					<Typography variant="body2" color="text.secondary">
						{peopleCount} × {money(item.packagePrice)}
					</Typography>
					<Typography variant="h6" color="primary" sx={{ overflowWrap: 'anywhere' }}>
						Total: {money(total)}
					</Typography>
				</div>
				<Button fullWidth variant="contained" disabled={!valid} onClick={handleContinueBooking}>
					Continue Booking
				</Button>
			</Stack>
		</aside>
	);
}
