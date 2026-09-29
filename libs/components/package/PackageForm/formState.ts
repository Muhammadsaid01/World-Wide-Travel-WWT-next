import type { PackageDetailData } from '@/apollo/user/query';
import { Itinerary } from '@/libs/types/package/itinerary';
import { PackageSchedule } from '@/libs/types/package/package-schedule';
import { PackageCategory, PackageLevel, PackageType, ScheduleStatus, TransportType } from '../../../enums/package.enum';
import type { TravelPackageInput } from '../../../types/package/travel-package.input';


export type FieldName = Exclude<keyof TravelPackageInput, 'packageImages'>;
export type Values = Record<FieldName, string>;
export const initialValues: Values = {
	packageTitle: '',
	packageDesc: '',
	packageShortDesc: '',
	packageType: '',
	packageCategory: '',
	packageLevel: '',
	destinationCountry: '',
	destinationCity: '',
	packageDays: '',
	packageNights: '',
	meetingPoint: '',
	latitude: '',
	longitude: '',
	packagePrice: '',
	currency: '',
	minPeople: '',
	maxPeople: '',
	transportType: '',
};
export const numericFields = [
	'packageDays',
	'packageNights',
	'latitude',
	'longitude',
	'packagePrice',
	'minPeople',
	'maxPeople',
] as const;
export const requiredFields: FieldName[] = [
	'packageTitle',
	'packageDesc',
	'packageCategory',
	'destinationCountry',
	'destinationCity',
	'packageDays',
	'packageNights',
	'packagePrice',
	'maxPeople',
];
export const integerMinimums = { packageDays: 1, packageNights: 0, minPeople: 1, maxPeople: 1 } as const;

export type Errors = Partial<Record<FieldName | 'packageImages', string>>;
export type ItineraryValues = { dayNumber: string; title: string; description: string };
export type ScheduleValues = {
	startDate: string;
	endDate: string;
	availableSeats: string;
	scheduleStatus: ScheduleStatus | '';
};
export function validatePackage(values: Values, images: string[]): Errors {
	const nextErrors: Errors = {};
	for (const key of requiredFields) if (!values[key].trim()) nextErrors[key] = 'This field is required.';
	if (values.packageTitle.trim().length < 3 || values.packageTitle.trim().length > 100)
		nextErrors.packageTitle = 'Use 3–100 characters.';
	if (values.packageDesc.trim().length < 10 || values.packageDesc.trim().length > 3000)
		nextErrors.packageDesc = 'Use 10–3000 characters.';
	for (const key of numericFields)
		if (values[key].trim() && !Number.isFinite(Number(values[key]))) nextErrors[key] = 'Enter a valid number.';
	for (const [key, minimum] of Object.entries(integerMinimums) as [keyof typeof integerMinimums, number][]) {
		if (
			values[key].trim() &&
			(!Number.isInteger(Number(values[key])) || Number(values[key]) < minimum || Number(values[key]) > 2147483647)
		)
			nextErrors[key] = `Enter a whole number from ${minimum} to 2147483647.`;
	}
	if (values.packagePrice.trim() && Number(values.packagePrice) < 0)
		nextErrors.packagePrice = 'Price cannot be negative.';
	if (values.minPeople && values.maxPeople && Number(values.minPeople) > Number(values.maxPeople))
		nextErrors.minPeople = 'Minimum travelers cannot exceed maximum travelers.';
	if (!images.length) nextErrors.packageImages = 'Upload at least one package image.';
	return nextErrors;
}
export function buildPackageInput(values: Values, images: string[]): TravelPackageInput {
	const input: TravelPackageInput = {
		packageTitle: values.packageTitle.trim(),
		packageDesc: values.packageDesc.trim(),
		packageCategory: values.packageCategory as PackageCategory,
		destinationCountry: values.destinationCountry.trim(),
		destinationCity: values.destinationCity.trim(),
		packageDays: Number(values.packageDays),
		packageNights: Number(values.packageNights),
		packagePrice: Number(values.packagePrice),
		maxPeople: Number(values.maxPeople),
		packageImages: images,
	};
	for (const key of ['packageShortDesc', 'meetingPoint', 'currency'] as const)
		if (values[key].trim()) input[key] = values[key].trim();
	for (const key of ['latitude', 'longitude', 'minPeople'] as const)
		if (values[key].trim()) input[key] = Number(values[key]);
	if (values.packageType) input.packageType = values.packageType as PackageType;
	if (values.packageLevel) input.packageLevel = values.packageLevel as PackageLevel;
	if (values.transportType) input.transportType = values.transportType as TransportType;
	return input;
}
export const stepFields: (FieldName | 'packageImages')[][] = [
	[
		'packageTitle',
		'packageShortDesc',
		'packageDesc',
		'packageType',
		'packageCategory',
		'packageLevel',
		'packageImages',
	],
	['destinationCountry', 'destinationCity', 'meetingPoint', 'latitude', 'longitude'],
	['packageDays', 'packageNights', 'minPeople', 'maxPeople', 'transportType'],
	[],
	[],
	['packagePrice', 'currency'],
];
export const fieldLabels: Record<FieldName, string> = {
	packageTitle: 'Package Title',
	packageShortDesc: 'Short Description',
	packageDesc: 'Full Description',
	packageType: 'Package Type',
	packageCategory: 'Category',
	packageLevel: 'Package Level',
	destinationCountry: 'Country',
	destinationCity: 'City',
	meetingPoint: 'Meeting Point',
	latitude: 'Latitude',
	longitude: 'Longitude',
	packageDays: 'Days',
	packageNights: 'Nights',
	minPeople: 'Minimum Travelers',
	maxPeople: 'Maximum Travelers',
	transportType: 'Transport',
	packagePrice: 'Package Price',
	currency: 'Currency',
};
const validInt = (value: string, minimum: number) =>
	value.trim() !== '' && Number.isInteger(Number(value)) && Number(value) >= minimum && Number(value) <= 2147483647;
export function validateItineraries(items: ItineraryValues[]): string[] {
	return items.map((item, i) => {
		if (!validInt(item.dayNumber, 1)) return 'Enter a valid whole day number (1–2147483647).';
		if (items.some((other, j) => j !== i && Number(other.dayNumber) === Number(item.dayNumber)))
			return 'Each day number must be unique.';
		if (item.title.trim().length < 2 || item.title.trim().length > 100) return 'Use 2–100 characters for the title.';
		if (item.description.trim().length < 5 || item.description.trim().length > 2000)
			return 'Use 5–2000 characters for the description.';
		return '';
	});
}
export function validateSchedules(items: ScheduleValues[]): string[] {
	return items.map((item, i) => {
		if (
			!item.startDate ||
			!item.endDate ||
			!Number.isFinite(Date.parse(item.startDate)) ||
			!Number.isFinite(Date.parse(item.endDate))
		)
			return 'Enter valid start and end dates.';
		if (Date.parse(item.startDate) >= Date.parse(item.endDate)) return 'Start date must be earlier than end date.';
		if (items.some((other, j) => j !== i && other.startDate === item.startDate && other.endDate === item.endDate))
			return 'Each schedule must have a unique date range.';
		if (!validInt(item.availableSeats, 0)) return 'Enter a whole number of seats (0–2147483647).';
		return '';
	});
}



export function packageToValues(pkg: PackageDetailData): Values {
        return {
                packageTitle: pkg.packageTitle ?? '',
                packageDesc: pkg.packageDesc ?? '',
                packageShortDesc: pkg.packageShortDesc ?? '',
                packageType: pkg.packageType ?? '',
                packageCategory: pkg.packageCategory ?? '',
                packageLevel: pkg.packageLevel ?? '',
                destinationCountry: pkg.destinationCountry ?? '',
                destinationCity: pkg.destinationCity ?? '',
                packageDays: pkg.packageDays != null ? String(pkg.packageDays) : '',
                packageNights: pkg.packageNights != null ? String(pkg.packageNights) : '',
                meetingPoint: pkg.meetingPoint ?? '',
                latitude: pkg.latitude != null ? String(pkg.latitude) : '',
                longitude: pkg.longitude != null ? String(pkg.longitude) : '',
                packagePrice: pkg.packagePrice != null ? String(pkg.packagePrice) : '',
                currency: pkg.currency ?? '',
                minPeople: pkg.minPeople != null ? String(pkg.minPeople) : '',
                maxPeople: pkg.maxPeople != null ? String(pkg.maxPeople) : '',
                transportType: pkg.transportType ?? '',
        };
}

export function itinerariesToValues(
        items: Pick<Itinerary, 'dayNumber' | 'title' | 'description'>[],
): ItineraryValues[] {
        return items.map((item) => ({
                dayNumber: String(item.dayNumber),
                title: item.title ?? '',
                description: item.description ?? '',
        }));
}

export function schedulesToValues(
        items: Pick<PackageSchedule, 'startDate' | 'endDate' | 'availableSeats' | 'scheduleStatus'>[],
): ScheduleValues[] {
        return items.map((item) => ({
                startDate: String(item.startDate),
                endDate: String(item.endDate),
                availableSeats: String(item.availableSeats),
                scheduleStatus: item.scheduleStatus ?? '',
        }));
}