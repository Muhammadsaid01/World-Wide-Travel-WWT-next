import { useState } from 'react';
import {
	Alert,
	Button,
	Divider,
	InputAdornment,
	Paper,
	TextField,
	Typography,
} from '@mui/material';
import CalendarMonthOutlined from '@mui/icons-material/CalendarMonthOutlined';
import PeopleAltOutlined from '@mui/icons-material/PeopleAltOutlined';
import PlaceOutlined from '@mui/icons-material/PlaceOutlined';

export interface TravelMateFormValues {
	departureCountry?: string;
	departureCity?: string;
	destinationCountry: string;
	destinationCity: string;
	travelDate: string;
	maxMembers: number;
	matePostTitle: string;
	matePostContent: string;
}

type Draft = Omit<TravelMateFormValues, 'maxMembers'> & { maxMembers: string };
type Errors = Partial<Record<keyof Draft, string>>;

const emptyDraft: Draft = {
	departureCountry: '',
	departureCity: '',
	destinationCountry: '',
	destinationCity: '',
	travelDate: '',
	maxMembers: '2',
	matePostTitle: '',
	matePostContent: '',
};

function createDraft(initialValues?: TravelMateFormValues): Draft {
	if (!initialValues) return emptyDraft;
	return {
		...initialValues,
		departureCountry: initialValues.departureCountry ?? '',
		departureCity: initialValues.departureCity ?? '',
		travelDate: initialValues.travelDate.slice(0, 10),
		maxMembers: String(initialValues.maxMembers),
	};
}

function validate(draft: Draft, minimumCapacity: number): Errors {
	const errors: Errors = {};
	const title = draft.matePostTitle.trim();
	const content = draft.matePostContent.trim();
	const maximum = Number(draft.maxMembers);

	if (!title) errors.matePostTitle = 'Enter a title.';
	else if (title.length < 3 || title.length > 200) errors.matePostTitle = 'Use between 3 and 200 characters.';
	if (!draft.destinationCountry.trim()) errors.destinationCountry = 'Enter the destination country.';
	if (!draft.destinationCity.trim()) errors.destinationCity = 'Enter the destination city.';
	if (!draft.travelDate) errors.travelDate = 'Choose a travel date.';
	if (!Number.isInteger(maximum) || maximum < minimumCapacity) {
		errors.maxMembers =
			minimumCapacity > 2
				? `The group already has ${minimumCapacity} travelers.`
				: 'The group must allow at least 2 travelers.';
	}
	if (!content) errors.matePostContent = 'Tell travelers about the trip.';
	else if (content.length < 10 || content.length > 5000)
		errors.matePostContent = 'Use between 10 and 5,000 characters.';

	return errors;
}

export default function TravelMateForm({
	mode,
	initialValues,
	minimumCapacity = 2,
	submitting,
	submitError,
	onSubmit,
	onCancel,
}: {
	mode: 'create' | 'edit';
	initialValues?: TravelMateFormValues;
	minimumCapacity?: number;
	submitting: boolean;
	submitError?: string;
	onSubmit: (values: TravelMateFormValues) => void;
	onCancel: () => void;
}) {
	const [draft, setDraft] = useState<Draft>(() => createDraft(initialValues));
	const [errors, setErrors] = useState<Errors>({});
	const title = mode === 'create' ? 'Create Travel Mate' : 'Edit Travel Mate';
	const description =
		mode === 'create'
			? 'Share your trip plan and meet travelers heading the same way.'
			: 'Update the information travelers use to understand your trip.';

	function update<K extends keyof Draft>(field: K, value: Draft[K]) {
		setDraft((current) => ({ ...current, [field]: value }));
		if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }));
	}

	function submit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const nextErrors = validate(draft, minimumCapacity);
		setErrors(nextErrors);
		if (Object.keys(nextErrors).length) return;

		onSubmit({
			departureCountry: draft.departureCountry?.trim() || undefined,
			departureCity: draft.departureCity?.trim() || undefined,
			destinationCountry: draft.destinationCountry.trim(),
			destinationCity: draft.destinationCity.trim(),
			travelDate: new Date(`${draft.travelDate}T00:00:00.000Z`).toISOString(),
			maxMembers: Number(draft.maxMembers),
			matePostTitle: draft.matePostTitle.trim(),
			matePostContent: draft.matePostContent.trim(),
		});
	}

	return (
		<div className="travel-mate-form-shell">
			<header className="travel-mate-form-heading">
				<Typography component="h1">{title}</Typography>
				<Typography color="text.secondary">{description}</Typography>
			</header>
			<div className="travel-mate-form-columns">
				<Paper component="form" variant="outlined" className="travel-mate-form" onSubmit={submit} noValidate>
					<section>
						<div className="travel-mate-form-section-title">
							<PlaceOutlined />
							<div>
								<Typography component="h2">Trip route</Typography>
								<Typography color="text.secondary">Add where the trip starts and where you are going.</Typography>
							</div>
						</div>
						<div className="travel-mate-form-grid">
							<TextField
								label="Departure country (optional)"
								value={draft.departureCountry}
								onChange={(event) => update('departureCountry', event.target.value)}
								slotProps={{ htmlInput: { maxLength: 100 } }}
							/>
							<TextField
								label="Departure city (optional)"
								value={draft.departureCity}
								onChange={(event) => update('departureCity', event.target.value)}
								slotProps={{ htmlInput: { maxLength: 100 } }}
							/>
							<TextField
								required
								label="Destination country"
								value={draft.destinationCountry}
								onChange={(event) => update('destinationCountry', event.target.value)}
								error={Boolean(errors.destinationCountry)}
								helperText={errors.destinationCountry}
								slotProps={{ htmlInput: { maxLength: 100 } }}
							/>
							<TextField
								required
								label="Destination city"
								value={draft.destinationCity}
								onChange={(event) => update('destinationCity', event.target.value)}
								error={Boolean(errors.destinationCity)}
								helperText={errors.destinationCity}
								slotProps={{ htmlInput: { maxLength: 100 } }}
							/>
						</div>
					</section>

					<Divider />

					<section>
						<div className="travel-mate-form-section-title">
							<CalendarMonthOutlined />
							<div>
								<Typography component="h2">Date and group size</Typography>
								<Typography color="text.secondary">Set the departure date and total capacity, including you.</Typography>
							</div>
						</div>
						<div className="travel-mate-form-grid">
							<TextField
								required
								type="date"
								label="Travel date"
								value={draft.travelDate}
								onChange={(event) => update('travelDate', event.target.value)}
								error={Boolean(errors.travelDate)}
								helperText={errors.travelDate}
								slotProps={{ inputLabel: { shrink: true } }}
							/>
							<TextField
								required
								type="number"
								label="Maximum travelers"
								value={draft.maxMembers}
								onChange={(event) => update('maxMembers', event.target.value)}
								error={Boolean(errors.maxMembers)}
								helperText={
									errors.maxMembers ||
									(minimumCapacity > 2
										? `At least ${minimumCapacity} travelers are already approved, including you.`
										: 'The creator is included in this number.')
								}
								slotProps={{
									htmlInput: { min: minimumCapacity, step: 1 },
									input: { startAdornment: <InputAdornment position="start"><PeopleAltOutlined /></InputAdornment> },
								}}
							/>
						</div>
					</section>

					<Divider />

					<section>
						<Typography component="h2">Trip details</Typography>
						<TextField
							required
							fullWidth
							label="Post title"
							placeholder="Give travelers a clear summary of the trip"
							value={draft.matePostTitle}
							onChange={(event) => update('matePostTitle', event.target.value)}
							error={Boolean(errors.matePostTitle)}
							helperText={errors.matePostTitle || `${draft.matePostTitle.length}/200`}
							slotProps={{ htmlInput: { maxLength: 200 } }}
						/>
						<TextField
							required
							fullWidth
							multiline
							minRows={8}
							label="About the trip"
							placeholder="Describe the plan, pace, and the kind of travel mate you hope to meet."
							value={draft.matePostContent}
							onChange={(event) => update('matePostContent', event.target.value)}
							error={Boolean(errors.matePostContent)}
							helperText={errors.matePostContent || `${draft.matePostContent.length}/5000`}
							slotProps={{ htmlInput: { maxLength: 5000 } }}
						/>
					</section>

					{submitError && <Alert severity="error">{submitError}</Alert>}
					<div className="travel-mate-form-actions">
						<Button type="button" variant="outlined" disabled={submitting} onClick={onCancel}>
							Cancel
						</Button>
						<Button type="submit" variant="contained" disabled={submitting}>
							{submitting ? 'Saving…' : mode === 'create' ? 'Create Travel Mate' : 'Save Changes'}
						</Button>
					</div>
				</Paper>

				<Paper component="aside" variant="outlined" className="travel-mate-form-guide">
					<Typography component="h2">Before you publish</Typography>
					<ul>
						<li>Use the real destination and date so travelers can plan accurately.</li>
						<li>The group size includes you as the trip creator.</li>
						<li>Join requests remain pending until you approve them.</li>
					</ul>
				</Paper>
			</div>
		</div>
	);
}
