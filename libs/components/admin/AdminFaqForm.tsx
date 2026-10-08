import { FAQ_CATEGORY_OPTIONS, type FaqFormErrors, type FaqFormValues } from '@/libs/components/cs/faqState';
import { FaqCategory, FaqStatus } from '@/libs/enums/system.enum';
import { MenuItem, TextField } from '@mui/material';

export default function AdminFaqForm({
	values,
	errors,
	disabled,
	onChange,
}: {
	values: FaqFormValues;
	errors: FaqFormErrors;
	disabled?: boolean;
	onChange: (values: FaqFormValues) => void;
}) {
	return (
		<div className="admin-faq-form">
			<TextField
				select
				fullWidth
				required
				label="Category"
				value={values.faqCategory}
				error={Boolean(errors.faqCategory)}
				helperText={errors.faqCategory}
				disabled={disabled}
				onChange={(event) => onChange({ ...values, faqCategory: event.target.value as FaqCategory })}
			>
				{FAQ_CATEGORY_OPTIONS.map((option) => (
					<MenuItem key={option.value} value={option.value}>
						{option.label}
					</MenuItem>
				))}
			</TextField>
			<TextField
				select
				fullWidth
				required
				label="Status"
				value={values.faqStatus}
				error={Boolean(errors.faqStatus)}
				helperText={errors.faqStatus || 'Only published FAQs appear in the public Help Center.'}
				disabled={disabled}
				onChange={(event) => onChange({ ...values, faqStatus: event.target.value as FaqStatus })}
			>
				<MenuItem value={FaqStatus.DRAFT}>Draft</MenuItem>
				<MenuItem value={FaqStatus.PUBLISHED}>Published</MenuItem>
			</TextField>
			<TextField
				autoFocus
				fullWidth
				required
				label="Question"
				value={values.faqQuestion}
				error={Boolean(errors.faqQuestion)}
				helperText={errors.faqQuestion || `${values.faqQuestion.length}/300 characters`}
				slotProps={{ htmlInput: { minLength: 3, maxLength: 300 } }}
				disabled={disabled}
				onChange={(event) => onChange({ ...values, faqQuestion: event.target.value })}
			/>
			<TextField
				fullWidth
				required
				multiline
				minRows={7}
				label="Answer"
				value={values.faqAnswer}
				error={Boolean(errors.faqAnswer)}
				helperText={errors.faqAnswer || `${values.faqAnswer.length}/5,000 characters`}
				slotProps={{ htmlInput: { minLength: 5, maxLength: 5000 } }}
				disabled={disabled}
				onChange={(event) => onChange({ ...values, faqAnswer: event.target.value })}
			/>
			<TextField
				fullWidth
				required
				type="number"
				label="Display Order"
				value={values.faqOrder}
				error={Boolean(errors.faqOrder)}
				helperText={errors.faqOrder || 'Lower numbers appear first in the public Help Center.'}
				slotProps={{ htmlInput: { min: 0, max: 100000, step: 1 } }}
				disabled={disabled}
				onChange={(event) => onChange({ ...values, faqOrder: event.target.value })}
			/>
		</div>
	);
}
