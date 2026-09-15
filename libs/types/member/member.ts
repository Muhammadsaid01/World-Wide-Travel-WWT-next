import type { AgentProfileData } from '../../types/agent/agent';
import type { MeFollowed } from '../../types/community/follow';
import type { MeLiked } from '../../types/community/like';

import {
	MemberAuthType,
	MemberLanguage,
	MemberRank,
	MemberStatus,
	MemberType,
} from '../../enums/member.enum';

export interface Member {
	_id: string;

	memberType: MemberType;
	memberStatus: MemberStatus;
	memberAuthType: MemberAuthType;

	memberNick: string;
	memberFullName?: string;
	memberPhone?: string;
	memberEmail?: string;
	memberImage?: string;

	memberAddress?: string;
	memberCountry?: string;
	memberCity?: string;
	memberDesc?: string;

	memberBirthDate?: string;

	memberLanguage: MemberLanguage;
	memberPoint: number;
	memberRank: MemberRank;

	memberViewCount: number;
	memberLikeCount: number;
	memberCommentCount: number;
	memberReviewCount: number;
	memberBookingCount: number;
	memberFollowerCount: number;
	memberFollowingCount: number;
	memberTravelMatePosts: number;

	memberOnline: boolean;

	memberDeletedAt?: string;

	createdAt: string;
	updatedAt: string;

	accessToken?: string;

	agentData?: AgentProfileData;

	/** From aggregation */
	meLiked?: MeLiked[];
	meFollowed?: MeFollowed[];
}

export interface TotalCounter {
	total?: number;
}

export interface Members {
	list: Member[];
	metaCounter?: TotalCounter[];
}