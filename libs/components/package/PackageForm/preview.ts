import type { Values } from './formState';
export function formatPrice(price: string, currency: string): string {
	if (!price.trim() || !Number.isFinite(Number(price)) || Number(price) < 0) return 'Price not set';
	const code = currency.trim().toUpperCase();
	if (/^[A-Z]{3}$/.test(code)) {
		try {
			return new Intl.NumberFormat('en-US', { style: 'currency', currency: code, maximumFractionDigits: 20 }).format(
				Number(price),
			);
		} catch {
			/* Preserve free-text currencies supported by the API. */
		}
	}
	return [code, Number(price).toLocaleString('en-US', { maximumFractionDigits: 20 })].filter(Boolean).join(' ');
}
export function nonnegativePrice(value: string): string {
	return value.trim() && (!Number.isFinite(Number(value)) || Number(value) < 0) ? '' : value;
}
export function durationLabel(values: Values): string {
	return [
		values.packageDays.trim() && `${values.packageDays} Days`,
		values.packageNights.trim() && `${values.packageNights} Nights`,
	]
		.filter(Boolean)
		.join(' / ');
}
export function groupLabel(values: Values): string {
	if (values.minPeople.trim() && values.maxPeople.trim()) return `${values.minPeople}–${values.maxPeople} Travelers`;
	if (values.maxPeople.trim()) return `Up to ${values.maxPeople} Travelers`;
	return values.minPeople.trim() ? `Minimum ${values.minPeople} Travelers` : '';
}
export function enumLabel(value: string): string {
	return value ? value.charAt(0) + value.slice(1).toLowerCase() : '';
}
