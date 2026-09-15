import {
	PackageCategory,
	PackageLevel,
	PackageStatus,
	PackageType,
	TransportType,
} from '../../enums/package.enum';

import type { Agent } from '../../types/agent/agent';
import type { MeLiked } from '../../types/community/like';
import type { TotalCounter } from '../../types/member/member';

export interface TravelPackage {
	_id: string;
	agentId: string;

	packageTitle: string;
	packageSlug: string;
	packageDesc: string;
	packageShortDesc?: string;

	packageType: PackageType;
	packageCategory: PackageCategory;
	packageLevel: PackageLevel;

	destinationCountry: string;
	destinationCity: string;

	packageDays: number;
	packageNights: number;

	meetingPoint?: string;
	latitude?: number;
	longitude?: number;

	packagePrice: number;
	currency: string;

	minPeople: number;
	maxPeople: number;

	transportType: TransportType;
	packageStatus: PackageStatus;

	packageImages: string[];

	packageViewCount: number;
	packageLikeCount: number;
	packageBookingCount: number;

	packageRating: number;
	packageReviewCount: number;
	packageRank: number;

	soldAt?: string;
	deletedAt?: string;

	createdAt: string;
	updatedAt: string;

	/** From aggregation */
	agentData?: Agent;
	meLiked?: MeLiked[];
}

export interface TravelPackages {
	list: TravelPackage[];
	metaCounter?: TotalCounter[];
}