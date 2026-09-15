import {
	PackageCategory,
	PackageLevel,
	PackageStatus,
	PackageType,
	TransportType,
} from '../../enums/package.enum';

export interface TravelPackageUpdate {
	_id: string;

	packageTitle?: string;
	packageDesc?: string;
	packageShortDesc?: string;

	packageType?: PackageType;
	packageCategory?: PackageCategory;
	packageStatus?: PackageStatus;
	packageLevel?: PackageLevel;

	destinationCountry?: string;
	destinationCity?: string;

	packageDays?: number;
	packageNights?: number;

	meetingPoint?: string;
	latitude?: number;
	longitude?: number;

	packagePrice?: number;
	currency?: string;

	minPeople?: number;
	maxPeople?: number;

	transportType?: TransportType;

	packageImages?: string[];
}

export interface DeleteTravelPackageInput {
	_id: string;
}