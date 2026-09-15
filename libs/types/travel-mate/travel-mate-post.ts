import { TravelMatePostStatus } from '../../enums/community.enum';

import type { Member, TotalCounter } from '../../types/member/member';

export interface TravelMatePost {
	_id: string;
	memberId: string;

	departureCountry?: string;
	departureCity?: string;

	destinationCountry: string;
	destinationCity: string;

	travelDate: string;

	maxMembers: number;
	currentMembers: number;

	matePostTitle: string;
	matePostContent: string;

	matePostStatus: TravelMatePostStatus;

	matePostDeletedAt?: string;

	createdAt: string;
	updatedAt: string;

	matePostViewCount?: number;

	/** From aggregation */
	memberData?: Member;
}

export interface TravelMatePosts {
	list: TravelMatePost[];
	metaCounter?: TotalCounter[];
}