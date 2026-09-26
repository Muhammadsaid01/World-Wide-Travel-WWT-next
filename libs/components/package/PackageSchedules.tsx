import type { QueryResult } from '@apollo/client';
import type { PackageSchedule } from '@/libs/types/package/package-schedule';
import { Alert, Button, Chip, Paper, Skeleton, Stack, Typography } from '@mui/material';
import CalendarMonthOutlined from '@mui/icons-material/CalendarMonthOutlined';
import PeopleOutline from '@mui/icons-material/PeopleOutlined';
import { ScheduleStatus } from '@/libs/enums/package.enum';

const dateFormatter = new Intl.DateTimeFormat('en-US', {
	month: 'short',
	day: '2-digit',
	year: 'numeric',
	timeZone: 'UTC',
});

export function formatScheduleDate(value: string) {
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? 'Date unavailable' : dateFormatter.format(date);
}

interface PackageSchedulesProps {
	query: Pick<
		QueryResult<
			{
				getPackageSchedules: Pick<
					PackageSchedule,
					'_id' | 'startDate' | 'endDate' | 'availableSeats' | 'scheduleStatus'
				>[];
			},
			{ packageId: string }
		>,
		'data' | 'loading' | 'error' | 'refetch'
	>;
	selectedScheduleId: string | null;
	onSelectSchedule: (scheduleId: string) => void;
}

export default function PackageSchedules({ query, selectedScheduleId, onSelectSchedule }: PackageSchedulesProps) {
	const { data, loading, error, refetch } = query;

	return (
		<section className="detail-section" aria-labelledby="available-dates-title" aria-busy={loading}>
			<h2 id="available-dates-title">Available Dates</h2>
			{loading ? (
				<Stack spacing={2} role="status" aria-label="Loading available dates">
					<Skeleton variant="rounded" height={116} />
					<Skeleton variant="rounded" height={116} />
				</Stack>
			) : error || !data ? (
				<Alert
					severity="error"
					action={
						<Button
							color="inherit"
							onClick={() => {
								void refetch().catch(() => undefined);
							}}
						>
							Retry
						</Button>
					}
				>
					Available dates could not be loaded. Please try again.
				</Alert>
			) : data.getPackageSchedules.length === 0 ? (
				<Alert severity="info">No available dates at the moment. Please check back later for new departures.</Alert>
			) : (
				<Stack spacing={2}>
					{data.getPackageSchedules.map((schedule) => {
						const available = schedule.scheduleStatus === ScheduleStatus.OPEN && schedule.availableSeats > 0;
						const selected = selectedScheduleId === schedule._id;
						return (
							<Paper
								key={schedule._id}
								variant="outlined"
								sx={{
									p: { xs: 2, sm: 2.5 },
									borderRadius: 2,
									borderColor: selected ? 'primary.main' : 'divider',
									bgcolor: selected ? 'action.selected' : 'background.paper',
									boxShadow: selected ? (theme) => `inset 0 0 0 1px ${theme.palette.primary.main}` : 'none',
								}}
							>
								<Stack
									direction={{ xs: 'column', sm: 'row' }}
									spacing={2}
									sx={{ alignItems: { xs: 'stretch', sm: 'center' }, justifyContent: 'space-between' }}
								>
									<Stack spacing={1.5} sx={{ minWidth: 0 }}>
										<Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
											<CalendarMonthOutlined color="primary" />
											<Typography
												component="div"
												variant="subtitle2"
												sx={{ color: 'primary.main', overflowWrap: 'anywhere' }}
											>
												<time dateTime={schedule.startDate}>{formatScheduleDate(schedule.startDate)}</time> →{' '}
												<time dateTime={schedule.endDate}>{formatScheduleDate(schedule.endDate)}</time>
											</Typography>
										</Stack>
										<Stack direction="row" spacing={1} useFlexGap sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
											<PeopleOutline fontSize="small" color="action" />
											<Typography variant="body2" color="text.secondary">
												{schedule.availableSeats} {schedule.availableSeats === 1 ? 'seat' : 'seats'} available
											</Typography>
											<Chip
												size="small"
												label={available ? 'Available' : 'Unavailable'}
												color={available ? 'success' : 'default'}
												variant="outlined"
											/>
										</Stack>
									</Stack>
									<Button
										variant={selected ? 'contained' : 'outlined'}
										disabled={!available}
										aria-pressed={selected}
										aria-label={`${selected ? 'Selected' : 'Select'} dates ${formatScheduleDate(schedule.startDate)} to ${formatScheduleDate(schedule.endDate)}`}
										onClick={() => onSelectSchedule(schedule._id)}
										sx={{ flexShrink: 0, minHeight: 44 }}
									>
										{selected ? 'Selected' : 'Select Date'}
									</Button>
								</Stack>
							</Paper>
						);
					})}
				</Stack>
			)}
		</section>
	);
}
