import { Direction } from '../../enums/common.enum';

interface FISearch {
	followerId?: string;
	followingId?: string;
}

export interface FollowInquiry {
	page: number;
	limit: number;

	sort?: string;
	direction?: Direction;
	search?: FISearch;
}