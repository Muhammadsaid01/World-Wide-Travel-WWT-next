import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { TextField } from '@mui/material';

export interface PaymentFormHandle {
	validate: () => boolean;
	clear: () => void;
}

// Values live only in these inputs; the parent receives validation results, never credentials.
const PaymentForm = forwardRef<PaymentFormHandle>(function PaymentForm(_, ref) {
	const name = useRef<HTMLInputElement>(null);
	const number = useRef<HTMLInputElement>(null);
	const expiry = useRef<HTMLInputElement>(null);
	const cvc = useRef<HTMLInputElement>(null);
	const [errors, setErrors] = useState<string[]>([]);
	useImperativeHandle(ref, () => ({
		clear() {
			[name, number, expiry, cvc].forEach((field) => {
				if (field.current) field.current.value = '';
			});
			setErrors([]);
		},
		validate() {
			if (name.current) name.current.value = name.current.value.trim();
			const digits = number.current?.value.replace(/\s/g, '') ?? '';
			const date = expiry.current?.value ?? '';
			const month = Number(date.slice(0, 2));
			const year = 2000 + Number(date.slice(3));
			const now = new Date();
			const validDate =
				/^\d{2}\/\d{2}$/.test(date) &&
				month >= 1 &&
				month <= 12 &&
				(year > now.getFullYear() || (year === now.getFullYear() && month >= now.getMonth() + 1));
			const next = [
				name.current?.value ? '' : 'Enter the cardholder name.',
				/^\d{13,19}$/.test(digits) ? '' : 'Enter 13–19 digits.',
				validDate ? '' : 'Enter a valid, unexpired MM/YY date.',
				/^\d{3,4}$/.test(cvc.current?.value ?? '') ? '' : 'Enter 3 or 4 digits.',
			];
			setErrors(next);
			const first = next.findIndex(Boolean);
			if (first >= 0) [name, number, expiry, cvc][first].current?.focus();
			return first === -1;
		},
	}));
	return (
		<div className="payment-card-fields">
			<TextField
				className="payment-card-field"
				label="Cardholder Name"
				inputRef={name}
				autoComplete="off"
				required
				error={Boolean(errors[0])}
				helperText={errors[0]}
				onBlur={() => {
					if (name.current) name.current.value = name.current.value.trim();
				}}
			/>
			<TextField
				className="payment-card-field"
				label="Card Number"
				inputRef={number}
				autoComplete="off"
				required
				error={Boolean(errors[1])}
				helperText={errors[1]}
				slotProps={{ htmlInput: { inputMode: 'numeric', maxLength: 23 } }}
				onChange={(event) => {
					event.target.value = event.target.value
						.replace(/\D/g, '')
						.slice(0, 19)
						.replace(/(.{4})/g, '$1 ')
						.trim();
				}}
			/>
			<TextField
				className="payment-card-field"
				label="Expiry Date"
				placeholder="MM/YY"
				inputRef={expiry}
				autoComplete="off"
				required
				error={Boolean(errors[2])}
				helperText={errors[2]}
				slotProps={{ htmlInput: { inputMode: 'numeric', maxLength: 5 } }}
				onChange={(event) => {
					const value = event.target.value.replace(/\D/g, '').slice(0, 4);
					event.target.value = value.length > 2 ? `${value.slice(0, 2)}/${value.slice(2)}` : value;
				}}
			/>
			<TextField
				className="payment-card-field"
				label="CVC"
				type="password"
				inputRef={cvc}
				autoComplete="off"
				required
				error={Boolean(errors[3])}
				helperText={errors[3]}
				slotProps={{ htmlInput: { inputMode: 'numeric', maxLength: 4 } }}
				onChange={(event) => {
					event.target.value = event.target.value.replace(/\D/g, '').slice(0, 4);
				}}
			/>
		</div>
	);
});
export default PaymentForm;
