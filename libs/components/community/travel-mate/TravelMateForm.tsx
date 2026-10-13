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
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';

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

function validate(draft: Draft, minimumCapacity: number, t: TFunction): Errors {
	const errors: Errors = {};
	const title = draft.matePostTitle.trim();
	const content = draft.matePostContent.trim();
	const maximum = Number(draft.maxMembers);

	if (!title) errors.matePostTitle = t('mates.titleRequired');
	else if (title.length < 3 || title.length > 200) errors.matePostTitle = t('mates.titleLength');
	if (!draft.destinationCountry.trim()) errors.destinationCountry = t('mates.countryRequired');
	if (!draft.destinationCity.trim()) errors.destinationCity = t('mates.cityRequired');
	if (!draft.travelDate) errors.travelDate = t('mates.dateRequired');
	if (!Number.isInteger(maximum) || maximum < minimumCapacity) {
		errors.maxMembers =
			minimumCapacity > 2
				? t('mates.groupExisting', { count: minimumCapacity })
				: t('mates.groupMinimum');
	}
	if (!content) errors.matePostContent = t('mates.contentRequired');
	else if (content.length < 10 || content.length > 5000)
		errors.matePostContent = t('mates.contentLength');

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
	const { t } = useTranslation(['community', 'common']);
	const [draft, setDraft] = useState<Draft>(() => createDraft(initialValues));
	const [errors, setErrors] = useState<Errors>({});
	const title = t(mode === 'create' ? 'mates.create' : 'mates.edit');
	const description =
		mode === 'create'
			? t('mates.formCreateDescription')
			: t('mates.formEditDescription');

	function update<K extends keyof Draft>(field: K, value: Draft[K]) {
		setDraft((current) => ({ ...current, [field]: value }));
		if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }));
	}

	function submit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const nextErrors = validate(draft, minimumCapacity, t);
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
								<Typography component="h2">{t('mates.route')}</Typography>
								<Typography color="text.secondary">{t('mates.routeDescription')}</Typography>
							</div>
						</div>
						<div className="travel-mate-form-grid">
							<TextField
								label={t('mates.departureCountry')}
								value={draft.departureCountry}
								onChange={(event) => update('departureCountry', event.target.value)}
								slotProps={{ htmlInput: { maxLength: 100 } }}
							/>
							<TextField
								label={t('mates.departureCity')}
								value={draft.departureCity}
								onChange={(event) => update('departureCity', event.target.value)}
								slotProps={{ htmlInput: { maxLength: 100 } }}
							/>
							<TextField
								required
								label={t('mates.destinationCountry')}
								value={draft.destinationCountry}
								onChange={(event) => update('destinationCountry', event.target.value)}
								error={Boolean(errors.destinationCountry)}
								helperText={errors.destinationCountry}
								slotProps={{ htmlInput: { maxLength: 100 } }}
							/>
							<TextField
								required
								label={t('mates.destinationCity')}
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
								<Typography component="h2">{t('mates.dateGroup')}</Typography>
								<Typography color="text.secondary">{t('mates.dateGroupDescription')}</Typography>
							</div>
						</div>
						<div className="travel-mate-form-grid">
							<TextField
								required
								type="date"
								label={t('mates.travelDate')}
								value={draft.travelDate}
								onChange={(event) => update('travelDate', event.target.value)}
								error={Boolean(errors.travelDate)}
								helperText={errors.travelDate}
								slotProps={{ inputLabel: { shrink: true } }}
							/>
							<TextField
								required
								type="number"
								label={t('mates.maximumTravelers')}
								value={draft.maxMembers}
								onChange={(event) => update('maxMembers', event.target.value)}
								error={Boolean(errors.maxMembers)}
								helperText={
									errors.maxMembers ||
									(minimumCapacity > 2
										? t('mates.approvedMinimum', { count: minimumCapacity })
										: t('mates.creatorIncluded'))
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
					<Typography component="h2">{t('mates.tripDetails')}</Typography>
						<TextField
							required
							fullWidth
							label={t('mates.postTitle')}
							placeholder={t('mates.postTitlePlaceholder')}
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
							label={t('mates.about')}
							placeholder={t('mates.aboutPlaceholder')}
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
							{t('actions.cancel', { ns: 'common' })}
						</Button>
						<Button type="submit" variant="contained" disabled={submitting}>
							{submitting ? t('mates.saving') : mode === 'create' ? t('mates.create') : t('mates.saveChanges')}
						</Button>
					</div>
				</Paper>

				<Paper component="aside" variant="outlined" className="travel-mate-form-guide">
					<Typography component="h2">{t('mates.beforePublish')}</Typography>
					<ul>
						<li>{t('mates.guideDestination')}</li>
						<li>{t('mates.guideCapacity')}</li>
						<li>{t('mates.guideRequests')}</li>
					</ul>
				</Paper>
			</div>
		</div>
	);
}
