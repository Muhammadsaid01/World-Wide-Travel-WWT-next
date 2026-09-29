import { TextField, Typography } from '@mui/material';
import type { FieldsProps } from './PackageFields';
import { durationLabel, formatPrice, groupLabel, nonnegativePrice } from './preview';
export default function PricingStep({
	values,
	errors,
	disabled,
	onChange,
	scheduleCount,
}: FieldsProps & { scheduleCount: number }) {
	const duration = durationLabel(values);
	const group = groupLabel(values);
	return (
		<div className="pricing-layout">
			<section className="pricing-form">
				<Typography component="h3">Package Price</Typography>
				<p>This is the base price for one traveler.</p>
				<div className="pricing-fields">
					<TextField
						label="Currency (optional)"
						value={values.currency}
						disabled={disabled}
						onChange={(event) => onChange('currency', event.target.value)}
						helperText={errors.currency || 'Leave blank to use the default currency.'}
						error={Boolean(errors.currency)}
						fullWidth
					/>
					<TextField
						className="pricing-amount"
						label="Price per Person"
						type="number"
						required
						value={values.packagePrice}
						disabled={disabled}
						onChange={(event) => onChange('packagePrice', nonnegativePrice(event.target.value))}
						slotProps={{ htmlInput: { min: 0, step: 'any', inputMode: 'decimal' } }}
						onKeyDown={(event) => {
							if (event.key === '-') event.preventDefault();
						}}
						helperText={errors.packagePrice}
						error={Boolean(errors.packagePrice)}
						fullWidth
					/>
				</div>
			</section>
			<aside className="price-preview" aria-label="Price preview">
				<div className="preview-eyebrow">Price Preview</div>
				<div className="price-preview-body">
					<Typography component="h3">{values.packageTitle.trim() || 'Untitled Package'}</Typography>
					<ul className="preview-facts">
						{duration && <li>{duration}</li>}
						{group && <li>{group}</li>}
						{scheduleCount > 0 && (
							<li>
								{scheduleCount} Departure {scheduleCount === 1 ? 'Schedule' : 'Schedules'}
							</li>
						)}
					</ul>
					<div className="preview-price">
						<span>Base Package Price</span>
						<p>
							<strong>{formatPrice(values.packagePrice, values.currency)}</strong>
							{values.packagePrice.trim() && Number(values.packagePrice) >= 0 && <small> / person</small>}
						</p>
						{!values.currency.trim() && <small>Default currency</small>}
					</div>
				</div>
			</aside>
		</div>
	);
}
