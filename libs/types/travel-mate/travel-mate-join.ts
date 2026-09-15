import { TravelMateJoinStatus } from '../../enums/community.enum';

import type { Member, TotalCounter } from '../../types/member/member';
import type { TravelMatePost } from '../../types/travel-mate/travel-mate-post';

export interface TravelMateJoin {
	_id: string;

	travelMatePostId: string;
	memberId: string;

	joinStatus: TravelMateJoinStatus;

	memberData?: Member;

	message?: string;

	createdAt: string;
	updatedAt: string;

	travelMatePostData?: TravelMatePost;
}

export interface TravelMateJoins {
	list: TravelMateJoin[];
	metaCounter?: TotalCounter[];
}