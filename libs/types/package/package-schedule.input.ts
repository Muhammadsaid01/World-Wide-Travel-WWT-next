import { ScheduleStatus } from '../../enums/package.enum';

export interface PackageScheduleInput {
	packageId: string;

	startDate: string;
	endDate: string;

	availableSeats: number;
	scheduleStatus?: ScheduleStatus;
}

export interface DeletePackageScheduleInput {
	_id: string;
}