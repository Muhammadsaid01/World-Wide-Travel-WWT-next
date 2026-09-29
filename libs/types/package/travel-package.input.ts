import { Direction } from '../../enums/common.enum';
import {
	PackageCategory,
	PackageLevel,
	PackageStatus,
	PackageType,
	TransportType,
} from '../../enums/package.enum';

export interface TravelPackageInput {
	packageTitle: string;
	packageDesc: string;
	packageShortDesc?: string;

	packageType?: PackageType;
	packageCategory: PackageCategory;
	packageLevel?: PackageLevel;

	destinationCountry: string;
	destinationCity: string;

	packageDays: number;
	packageNights: number;

	meetingPoint?: string;
	latitude?: number;
	longitude?: number;

	packagePrice: number;
	currency?: string;

	minPeople?: number;
	maxPeople: number;

	transportType?: TransportType;

	packageImages: string[];
}

export interface PeriodsRange {
	start: string;
	end: string;
}

export interface PricesRange {
	start: number;
	end: number;
}

interface TPISearch {
	agentId?: string;
	packageStatus?: PackageStatus;
	packageCategory?: PackageCategory;

	destinationCountry?: string;
	destinationCity?: string;

	pricesRange?: PricesRange;
	periodsRange?: PeriodsRange;

	text?: string;
}

export interface TravelPackagesInquiry {
	page: number;
	limit: number;

	sort?: string;
	direction?: Direction;
	search?: TPISearch;
}

export interface UpdatePackageStatusInput {
	packageId: string;
	packageStatus: PackageStatus;
}

interface ATPISearch {
	packageStatus?: PackageStatus;
}

export interface AgentTravelPackagesInquiry {
	page: number;
	limit: number;

	sort?: string;
	direction?: Direction;
	search?: ATPISearch;
}

interface ALTPISearch {
	packageStatus?: PackageStatus;
	destinationCountryList?: string[];
}

export interface AllTravelPackagesInquiry {
	page: number;
	limit: number;

	sort?: string;
	direction?: Direction;

	search: ALTPISearch;
}

export interface OrdinaryInquiry {
	page: number;
	limit: number;
}