import {
	MemberLanguage,
	MemberStatus,
	MemberType,
} from '../../enums/member.enum';

export interface MemberUpdate {
	_id: string;

	memberFullName?: string;

	memberAddress?: string;
	memberCountry?: string;
	memberCity?: string;
	memberDesc?: string;

	memberPhone?: string;
	memberEmail?: string;
	memberImage?: string;

	memberLanguage?: MemberLanguage;
}

export interface MemberUpdateByAdmin {
	memberId: string;

	memberType?: MemberType;
	memberStatus?: MemberStatus;

	memberFullName?: string;
	memberPhone?: string;
	memberEmail?: string;
	memberImage?: string;

	memberAddress?: string;
	memberCountry?: string;
	memberCity?: string;
	memberDesc?: string;

	memberLanguage?: MemberLanguage;
}