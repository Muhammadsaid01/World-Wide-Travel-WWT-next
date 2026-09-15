import { Direction } from '../../enums/common.enum';
import { TravelMatePostStatus } from '../../enums/community.enum';

export interface TravelMatePostInput {
	departureCountry?: string;
	departureCity?: string;

	destinationCountry: string;
	destinationCity: string;

	travelDate: string;

	maxMembers: number;

	matePostTitle: string;
	matePostContent: string;
}

interface TMPSearch {
	destinationCountry?: string;
	destinationCity?: string;

	matePostStatus?: TravelMatePostStatus;

	memberId?: string;
	text?: string;
}

export interface TravelMatePostsInquiry {
	page: number;
	limit: number;

	sort?: string;
	direction?: Direction;
	search?: TMPSearch;
}

export interface UpdateTravelMatePostStatusInput {
	postId: string;
	matePostStatus: TravelMatePostStatus;
}