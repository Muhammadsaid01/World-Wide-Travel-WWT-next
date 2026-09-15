import { ScheduleStatus } from '../../enums/package.enum';

export interface PackageSchedule {
	_id: string;
	packageId: string;

	startDate: string;
	endDate: string;

	availableSeats: number;
	scheduleStatus: ScheduleStatus;

	createdAt: string;
	updatedAt: string;
}