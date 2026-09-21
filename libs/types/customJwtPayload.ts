import type { JwtPayload } from 'jwt-decode';

import {
	MemberAuthType,
	MemberLanguage,
	MemberRank,
	MemberStatus,
	MemberType,
} from '../enums/member.enum';

export interface CustomJwtPayload extends JwtPayload {
	_id: string;

	memberType: MemberType;
	memberStatus: MemberStatus;
	memberAuthType: MemberAuthType;

	memberNick: string;
	memberFullName: string;

	memberAddress: string | null;
	memberCountry: string | null;
	memberCity: string | null;
	memberDesc: string | null;

	memberBirthDate: string | null;

	memberPhone: string | null;
	memberEmail: string | null;
	memberImage: string | null;

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

	memberLastLogin: string | null;
	memberDeletedAt: string | null;

	createdAt: string;
	updatedAt: string;

	__v?: number;
}