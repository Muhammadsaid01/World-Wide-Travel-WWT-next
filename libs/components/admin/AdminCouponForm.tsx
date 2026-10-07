import { MenuItem, TextField, Typography } from '@mui/material';
import { CouponStatus, CouponType } from '@/libs/enums/booking.enum';

export interface AdminCouponFormValues {
	couponCode: string;
	couponTitle: string;
	couponDesc: string;
	couponType: CouponType;
	couponValue: string;
	minAmount: string;
	maxDiscount: string;
	usageLimit: string;
	perUserLimit: string;
	validFrom: string;
	validUntil: string;
	couponStatus: CouponStatus;
}

export type AdminCouponFormErrors = Partial<Record<keyof AdminCouponFormValues, string>>;

interface AdminCouponFormProps {
	values: AdminCouponFormValues;
	errors: AdminCouponFormErrors;
	disabled: boolean;
	isEdit: boolean;
	onChange: (next: AdminCouponFormValues) => void;
}

export default function AdminCouponForm({ values, errors, disabled, isEdit, onChange }: AdminCouponFormProps) {
	function setValue<Key extends keyof AdminCouponFormValues>(key: Key, value: AdminCouponFormValues[Key]) {
		onChange({ ...values, [key]: value });
	}

	return (
		<div className="admin-coupon-form">
			<TextField
				label="Coupon Code"
				value={values.couponCode}
				disabled={disabled}
				slotProps={{ htmlInput: { readOnly: isEdit } }}
				helperText={
					errors.couponCode || (isEdit ? 'Coupon codes cannot be changed after creation.' : 'Normalized by the server.')
				}
				error={Boolean(errors.couponCode)}
				onChange={(event) => setValue('couponCode', event.target.value)}
				fullWidth
			/>
			<TextField
				label="Title"
				value={values.couponTitle}
				disabled={disabled}
				helperText={errors.couponTitle}
				error={Boolean(errors.couponTitle)}
				onChange={(event) => setValue('couponTitle', event.target.value)}
				fullWidth
			/>
			<TextField
				className="admin-coupon-form-wide"
				label="Description"
				value={values.couponDesc}
				disabled={disabled}
				helperText={errors.couponDesc}
				error={Boolean(errors.couponDesc)}
				onChange={(event) => setValue('couponDesc', event.target.value)}
				multiline
				minRows={2}
				fullWidth
			/>
			<TextField
				select
				label="Coupon Type"
				value={values.couponType}
				disabled={disabled}
				onChange={(event) => {
					const couponType = event.target.value as CouponType;
					onChange({ ...values, couponType, maxDiscount: couponType === CouponType.FIXED ? '' : values.maxDiscount });
				}}
				fullWidth
			>
				<MenuItem value={CouponType.FIXED}>Fixed amount</MenuItem>
				<MenuItem value={CouponType.PERCENT}>Percentage</MenuItem>
			</TextField>
			<TextField
				label={values.couponType === CouponType.PERCENT ? 'Coupon Value (%)' : 'Coupon Value'}
				type="number"
				value={values.couponValue}
				disabled={disabled}
				helperText={errors.couponValue}
				error={Boolean(errors.couponValue)}
				onChange={(event) => setValue('couponValue', event.target.value)}
				slotProps={{ htmlInput: { min: 0, step: 'any' } }}
				fullWidth
			/>
			<TextField
				label="Minimum Amount"
				type="number"
				value={values.minAmount}
				disabled={disabled}
				helperText={errors.minAmount || 'Optional'}
				error={Boolean(errors.minAmount)}
				onChange={(event) => setValue('minAmount', event.target.value)}
				slotProps={{ htmlInput: { min: 0, step: 'any' } }}
				fullWidth
			/>
			<TextField
				label="Maximum Discount"
				type="number"
				value={values.maxDiscount}
				disabled={disabled || values.couponType === CouponType.FIXED}
				helperText={
					errors.maxDiscount ||
					(values.couponType === CouponType.PERCENT
						? 'Required for percentage coupons.'
						: 'Not used for fixed coupons.')
				}
				error={Boolean(errors.maxDiscount)}
				onChange={(event) => setValue('maxDiscount', event.target.value)}
				slotProps={{ htmlInput: { min: 0, step: 'any' } }}
				fullWidth
			/>
			<TextField
				label="Usage Limit"
				type="number"
				value={values.usageLimit}
				disabled={disabled}
				helperText={errors.usageLimit || 'Use 0 for unlimited.'}
				error={Boolean(errors.usageLimit)}
				onChange={(event) => setValue('usageLimit', event.target.value)}
				slotProps={{ htmlInput: { min: 0, step: 1 } }}
				fullWidth
			/>
			<TextField
				label="Per User Limit"
				type="number"
				value={values.perUserLimit}
				disabled={disabled}
				helperText={errors.perUserLimit}
				error={Boolean(errors.perUserLimit)}
				onChange={(event) => setValue('perUserLimit', event.target.value)}
				slotProps={{ htmlInput: { min: 1, step: 1 } }}
				fullWidth
			/>
			<TextField
				label="Valid From"
				type="datetime-local"
				value={values.validFrom}
				disabled={disabled}
				helperText={errors.validFrom}
				error={Boolean(errors.validFrom)}
				onChange={(event) => setValue('validFrom', event.target.value)}
				slotProps={{ inputLabel: { shrink: true } }}
				fullWidth
			/>
			<TextField
				label="Valid Until"
				type="datetime-local"
				value={values.validUntil}
				disabled={disabled}
				helperText={errors.validUntil}
				error={Boolean(errors.validUntil)}
				onChange={(event) => setValue('validUntil', event.target.value)}
				slotProps={{ inputLabel: { shrink: true } }}
				fullWidth
			/>
			{isEdit ? (
				<TextField
					select
					className="admin-coupon-form-wide"
					label="Persisted Status"
					value={values.couponStatus}
					disabled={disabled}
					onChange={(event) => setValue('couponStatus', event.target.value as CouponStatus)}
					fullWidth
				>
					<MenuItem value={CouponStatus.ACTIVE}>Active</MenuItem>
					<MenuItem value={CouponStatus.DISABLED}>Disabled</MenuItem>
					<MenuItem value={CouponStatus.EXPIRED}>Expired</MenuItem>
				</TextField>
			) : null}
			<Typography className="admin-coupon-form-note">
				Dates use your local time and are submitted as ISO timestamps. Server validation remains authoritative.
			</Typography>
		</div>
	);
}
