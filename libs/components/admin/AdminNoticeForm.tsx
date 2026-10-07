import { Checkbox, FormControlLabel, TextField } from '@mui/material';

export interface AdminNoticeFormValues {
	noticeTitle: string;
	noticeContent: string;
	noticePinned: boolean;
}

interface AdminNoticeFormProps {
	values: AdminNoticeFormValues;
	errors: Partial<Record<'noticeTitle' | 'noticeContent', string>>;
	disabled?: boolean;
	onChange: (values: AdminNoticeFormValues) => void;
}

export default function AdminNoticeForm({ values, errors, disabled, onChange }: AdminNoticeFormProps) {
	return (
		<div className="admin-notice-form">
			<TextField
				autoFocus
				fullWidth
				required
				label="Title"
				value={values.noticeTitle}
				error={Boolean(errors.noticeTitle)}
				helperText={errors.noticeTitle || `${values.noticeTitle.length}/300 characters`}
				slotProps={{ htmlInput: { minLength: 3, maxLength: 300 } }}
				disabled={disabled}
				onChange={(event) => onChange({ ...values, noticeTitle: event.target.value })}
			/>
			<TextField
				fullWidth
				required
				multiline
				minRows={7}
				label="Content"
				value={values.noticeContent}
				error={Boolean(errors.noticeContent)}
				helperText={errors.noticeContent || `${values.noticeContent.length}/10,000 characters`}
				slotProps={{ htmlInput: { minLength: 10, maxLength: 10000 } }}
				disabled={disabled}
				onChange={(event) => onChange({ ...values, noticeContent: event.target.value })}
			/>
			<FormControlLabel
				control={
					<Checkbox
						checked={values.noticePinned}
						disabled={disabled}
						onChange={(event) => onChange({ ...values, noticePinned: event.target.checked })}
					/>
				}
				label="Pin this notice above regular notices"
			/>
		</div>
	);
}
