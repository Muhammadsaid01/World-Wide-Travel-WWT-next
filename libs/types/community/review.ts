import { ReviewStatus } from '../../enums/community.enum';

import type { Booking } from '../../types/booking/booking';
import type { MeLiked } from '../../types/community/like';
import type { Member, TotalCounter } from '../../types/member/member';
import type { TravelPackage } from '../../types/package/travel-package';

export interface Review {
	_id: string;

	bookingId: string;
	packageId: string;
	memberId: string;
	agentId: string;

	reviewTitle?: string;
	reviewContent: string;
	reviewRating: number;

	reviewImages: string[];
	reviewLikes: number;

	reviewStatus: ReviewStatus;

	reviewDeletedAt?: string;

	createdAt: string;
	updatedAt: string;

	memberData?: Member;
	packageData?: TravelPackage;
	bookingData?: Booking;
	meLiked?: MeLiked[];
}

export interface Reviews {
	list: Review[];
	metaCounter?: TotalCounter[];
}