import { Alert, Button, TextField, Typography } from '@mui/material';
import Add from '@mui/icons-material/Add';
import type { ItineraryValues } from './formState';
export default function ItineraryStep({
	items,
	errors,
	disabled,
	onChange,
}: {
	items: ItineraryValues[];
	errors: string[];
	disabled: boolean;
	onChange: (items: ItineraryValues[]) => void;
}) {
	const update = (index: number, key: keyof ItineraryValues, value: string) =>
		onChange(items.map((item, i) => (i === index ? { ...item, [key]: value } : item)));
	return (
		<div className="package-form-entries">
			{!items.length && (
				<Typography color="text.secondary">
					No itinerary days added. Add the days you want to include, or continue without an itinerary.
				</Typography>
			)}
			{items.map((item, index) => (
				<section className="package-form-entry" key={index}>
					<header>
						<Typography component="h3">Day {item.dayNumber || index + 1}</Typography>
						<Button color="error" disabled={disabled} onClick={() => onChange(items.filter((_, i) => i !== index))}>
							Remove Day
						</Button>
					</header>
					<div className="package-form-fields">
						<TextField
							label="Day Number"
							required
							type="number"
							value={item.dayNumber}
							disabled={disabled}
							onChange={(e) => update(index, 'dayNumber', e.target.value)}
						/>
						<TextField
							label="Title"
							required
							value={item.title}
							disabled={disabled}
							onChange={(e) => update(index, 'title', e.target.value)}
						/>
						<TextField
							className="full-width"
							label="Description"
							required
							multiline
							minRows={4}
							value={item.description}
							disabled={disabled}
							onChange={(e) => update(index, 'description', e.target.value)}
						/>
					</div>
					{errors[index] && <Alert severity="error">{errors[index]}</Alert>}
				</section>
			))}
			<Button
				variant="outlined"
				startIcon={<Add />}
				disabled={disabled}
				onClick={() =>
					onChange([
						...items,
						{
							dayNumber: String(Math.max(0, ...items.map((item) => Number(item.dayNumber) || 0)) + 1),
							title: '',
							description: '',
						},
					])
				}
			>
				Add Day
			</Button>
		</div>
	);
}
