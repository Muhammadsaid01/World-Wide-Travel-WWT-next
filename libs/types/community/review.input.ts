import { Direction } from '../../enums/common.enum';
import { ReviewStatus } from '../../enums/community.enum';

export interface ReviewInput {
	bookingId: string;

	reviewRating: number;
	reviewTitle?: string;
	reviewContent: string;
}

interface RISearch {
	reviewStatus?: ReviewStatus;

	packageId?: string;
	agentId?: string;
	memberId?: string;

	text?: string;
}

export interface ReviewsInquiry {
	page: number;
	limit: number;

	sort?: string;
	direction?: Direction;
	search?: RISearch;
}

export interface UpdateReviewStatusInput {
	reviewId: string;
	reviewStatus: ReviewStatus;
}