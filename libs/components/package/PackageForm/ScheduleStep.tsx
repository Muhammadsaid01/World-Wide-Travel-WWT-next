import { Alert, Button, MenuItem, TextField, Typography } from '@mui/material';
import Add from '@mui/icons-material/Add';
import { ScheduleStatus } from '@/libs/enums/package.enum';
import type { ScheduleValues } from './formState';
export default function ScheduleStep({
	items,
	errors,
	disabled,
	onChange,
}: {
	items: ScheduleValues[];
	errors: string[];
	disabled: boolean;
	onChange: (items: ScheduleValues[]) => void;
}) {
	const update = (index: number, value: Partial<ScheduleValues>) =>
		onChange(items.map((item, i) => (i === index ? { ...item, ...value } : item)));
	return (
		<div className="package-form-entries">
			{!items.length && (
				<Typography color="text.secondary">
					No schedules added. Add departure dates, or continue without a schedule.
				</Typography>
			)}
			{items.map((item, index) => (
				<section className="package-form-entry" key={index}>
					<header>
						<Typography component="h3">Schedule {index + 1}</Typography>
						<Button color="error" disabled={disabled} onClick={() => onChange(items.filter((_, i) => i !== index))}>
							Remove Schedule
						</Button>
					</header>
					<div className="package-form-fields">
						<TextField
							label="Start Date"
							required
							type="date"
							slotProps={{ inputLabel: { shrink: true } }}
							value={item.startDate}
							disabled={disabled}
							onChange={(e) => update(index, { startDate: e.target.value })}
						/>
						<TextField
							label="End Date"
							required
							type="date"
							slotProps={{ inputLabel: { shrink: true } }}
							value={item.endDate}
							disabled={disabled}
							onChange={(e) => update(index, { endDate: e.target.value })}
						/>
						<TextField
							label="Available Seats"
							required
							type="number"
							slotProps={{ htmlInput: { min: 0, step: 1 } }}
							value={item.availableSeats}
							disabled={disabled}
							onChange={(e) => update(index, { availableSeats: e.target.value })}
						/>
						<TextField
							label="Schedule Status (optional)"
							select
							value={item.scheduleStatus}
							disabled={disabled}
							onChange={(e) => update(index, { scheduleStatus: e.target.value as ScheduleStatus | '' })}
						>
							<MenuItem value="">Use default</MenuItem>
							{Object.values(ScheduleStatus).map((status) => (
								<MenuItem key={status} value={status}>
									{status}
								</MenuItem>
							))}
						</TextField>
					</div>
					{errors[index] && <Alert severity="error">{errors[index]}</Alert>}
				</section>
			))}
			<Button
				variant="outlined"
				startIcon={<Add />}
				disabled={disabled}
				onClick={() => onChange([...items, { startDate: '', endDate: '', availableSeats: '', scheduleStatus: '' }])}
			>
				Add Schedule
			</Button>
		</div>
	);
}
