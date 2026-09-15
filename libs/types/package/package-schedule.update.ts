import { ScheduleStatus } from '../../enums/package.enum';

export interface PackageScheduleUpdate {
	_id: string;
	packageId: string;

	startDate?: string;
	endDate?: string;

	availableSeats?: number;
	scheduleStatus?: ScheduleStatus;
}

export interface PackageScheduleUpdateByAdmin {
	startDate?: string;
	endDate?: string;

	availableSeats?: number;
	scheduleStatus?: ScheduleStatus;
}