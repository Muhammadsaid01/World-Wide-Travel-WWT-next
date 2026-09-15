import { Direction } from '../../enums/common.enum';
import { TravelMateJoinStatus } from '../../enums/community.enum';

export interface TravelMateJoinInput {
	travelMatePostId: string;
	message?: string;
}

interface TMJSearch {
	travelMatePostId?: string;
	memberId?: string;
	joinStatus?: TravelMateJoinStatus;
}

export interface TravelMateJoinsInquiry {
	page: number;
	limit: number;

	sort?: string;
	direction?: Direction;
	search?: TMJSearch;
}

export interface UpdateTravelMateJoinStatusInput {
	joinId: string;
	joinStatus: TravelMateJoinStatus;
}