import { MenuItem, TextField } from '@mui/material';
import { PackageCategory, PackageLevel, PackageType, TransportType } from '@/libs/enums/package.enum';
import { Errors, FieldName, Values, fieldLabels, integerMinimums, numericFields, requiredFields } from './formState';
export interface FieldsProps {
	values: Values;
	errors: Errors;
	disabled: boolean;
	onChange: (key: FieldName, value: string) => void;
}
const options: Partial<Record<FieldName, Record<string, string>>> = {
	packageType: PackageType,
	packageCategory: PackageCategory,
	packageLevel: PackageLevel,
	transportType: TransportType,
};
export default function PackageFields({ fields, ...props }: FieldsProps & { fields: FieldName[] }) {
	return (
		<div className="package-form-fields">
			{fields.map((key) => {
				const choices = options[key];
				const multiline = key === 'packageDesc';
				const wide = ['packageTitle', 'packageShortDesc', 'packageDesc', 'meetingPoint'].includes(key);
				return (
					<TextField
						key={key}
						className={wide ? 'full-width' : undefined}
						fullWidth
						label={`${fieldLabels[key]}${requiredFields.includes(key) ? '' : ' (optional)'}`}
						required={requiredFields.includes(key)}
						value={props.values[key]}
						disabled={props.disabled}
						select={Boolean(choices)}
						type={numericFields.some((field) => field === key) ? 'number' : 'text'}
						multiline={multiline}
						minRows={multiline ? 5 : undefined}
						error={Boolean(props.errors[key])}
						helperText={props.errors[key] || (key === 'packageLevel' ? 'Choose the package tier.' : undefined)}
						slotProps={{ htmlInput: { step: key in integerMinimums ? 1 : 'any' } }}
						onChange={(event) => props.onChange(key, event.target.value)}
					>
						{choices && !requiredFields.includes(key) && <MenuItem value="">Use default</MenuItem>}
						{choices &&
							Object.values(choices).map((value) => (
								<MenuItem key={value} value={value}>
									{value.charAt(0) + value.slice(1).toLowerCase()}
								</MenuItem>
							))}
					</TextField>
				);
			})}
		</div>
	);
}
