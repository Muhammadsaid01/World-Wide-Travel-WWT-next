import type { TravelPackageInput } from '../../../types/package/travel-package.input';
import type { ItineraryInput } from '../../../types/package/itinerary.input';
import type { PackageScheduleInput } from '../../../types/package/package-schedule.input';
import type { ItineraryValues, ScheduleValues } from './formState';

// Keep confirmed progress in the form, so a failed dependent write never recreates the package.
export interface PublishProgress {
	packageId: string;
	itineraries: number;
	schedules: number;
}
export interface PublishOperations {
	createPackage: (input: TravelPackageInput) => Promise<string>;
	createItinerary: (input: ItineraryInput) => Promise<string>;
	createSchedule: (input: PackageScheduleInput) => Promise<string>;
}
export async function publishPackage(
	input: TravelPackageInput,
	itineraries: ItineraryValues[],
	schedules: ScheduleValues[],
	progress: PublishProgress,
	operations: PublishOperations,
) {
	if (!progress.packageId) progress.packageId = await operations.createPackage(input);
	if (!progress.packageId) throw new Error('Package creation was not confirmed by the server.');
	while (progress.itineraries < itineraries.length) {
		const item = itineraries[progress.itineraries];
		const id = await operations.createItinerary({
			packageId: progress.packageId,
			dayNumber: Number(item.dayNumber),
			title: item.title.trim(),
			description: item.description.trim(),
		});
		if (!id) throw new Error('Itinerary creation was not confirmed by the server.');
		progress.itineraries++;
	}
	while (progress.schedules < schedules.length) {
		const item = schedules[progress.schedules];
		const id = await operations.createSchedule({
			packageId: progress.packageId,
			startDate: item.startDate,
			endDate: item.endDate,
			availableSeats: Number(item.availableSeats),
			...(item.scheduleStatus ? { scheduleStatus: item.scheduleStatus } : {}),
		});
		if (!id) throw new Error('Schedule creation was not confirmed by the server.');
		progress.schedules++;
	}
}
