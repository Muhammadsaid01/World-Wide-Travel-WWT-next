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
import { useTranslation } from 'react-i18next';

type Counts = Required<Pick<BookingInput, 'adultCount' | 'childCount' | 'infantCount'>>;
const travelerTypes = [
	['adultCount', 'detail.adults'],
	['childCount', 'detail.children'],
	['infantCount', 'detail.infants'],
] as const;

interface Props {
	item: PackageDetailData;
	selectedScheduleId: string | null;
	schedule?: Pick<PackageSchedule, '_id' | 'startDate' | 'endDate' | 'availableSeats' | 'scheduleStatus'>;
	schedulesReady: boolean;
}

export default function PackageBookingCard({ item, selectedScheduleId, schedule, schedulesReady }: Props) {
	const { t, i18n } = useTranslation('packages');
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
	const money = (value: number) =>
		`${item.currency} ${value.toLocaleString(i18n.language, { maximumFractionDigits: 2 })}`;

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
		<aside className="detail-booking" aria-label={t('detail.bookingInfo')}>
			<Stack spacing={2.5}>
				<div>
					<Typography variant="body2" color="text.secondary">
						{t('detail.pricePerTraveler')}
					</Typography>
					<strong className="detail-price">{money(item.packagePrice)}</strong>
				</div>
				<div>
					<Typography variant="subtitle2">{t('detail.selectedDate')}</Typography>
					{schedule ? (
						<Typography variant="body2" color="text.secondary">
							{formatScheduleDate(schedule.startDate, i18n.language)} →{' '}
							{formatScheduleDate(schedule.endDate, i18n.language)}
						</Typography>
					) : (
						<Typography variant="body2" color="text.secondary">
							{t('detail.selectDateHint')}
						</Typography>
					)}
				</div>
				{schedule && !available && (
					<Alert severity="info">{t('detail.departureUnavailable')}</Alert>
				)}
				<Divider />
				<div>
					<Typography variant="subtitle2" sx={{ mb: 1 }}>
						{t('detail.travelers')}
					</Typography>
					{travelerTypes.map(([field, labelKey]) => {
						const label = t(labelKey);
						return (
						<Stack
							key={field}
							direction="row"
							spacing={1}
							sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1 }}
						>
							<Typography variant="body2">{label}</Typography>
							<Stack direction="row" sx={{ alignItems: 'center' }}>
								<IconButton
									aria-label={t('detail.removeTraveler', { type: label })}
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
									aria-label={t('detail.addTraveler', { type: label })}
									disabled={!available || peopleCount >= capacity}
									onClick={() => changeCount(field, 1)}
									sx={{ width: 44, height: 44 }}
								>
									<Add fontSize="small" />
								</IconButton>
							</Stack>
						</Stack>
						);
					})}
					<Typography variant="caption" color="text.secondary">
						{t('detail.groupRange', { min: minimum, max: item.maxPeople })}
						{schedule ? ` ${t('detail.seatsAvailable', { count: schedule.availableSeats })}` : ''}
					</Typography>
					{available && peopleCount < minimum && (
						<Alert severity="info">
							{t('detail.minimumTravelers', { count: minimum })}
						</Alert>
					)}
					{peopleCount > capacity && schedule && (
					<Alert severity="warning">{t('detail.reduceTravelers', { count: capacity })}</Alert>
					)}
				</div>
				<Divider />
				<div aria-live="polite">
					<Typography variant="body2" color="text.secondary">
						{peopleCount} × {money(item.packagePrice)}
					</Typography>
					<Typography variant="h6" color="primary" sx={{ overflowWrap: 'anywhere' }}>
						{t('detail.total')}: {money(total)}
					</Typography>
				</div>
				<Button fullWidth variant="contained" disabled={!valid} onClick={handleContinueBooking}>
					{t('detail.continueBooking')}
				</Button>
			</Stack>
		</aside>
	);
}
