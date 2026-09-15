import { Direction } from '@/libs/enums/common.enum';
import {
	MemberAuthType,
	MemberLanguage,
	MemberStatus,
	MemberType,
} from '@/libs/enums/member.enum';

export interface MemberInput {
	memberNick: string;
	memberFullName: string;

	memberPhone?: string;
	memberEmail?: string;

	memberPassword: string;

	memberAuthType?: MemberAuthType;
	memberLanguage?: MemberLanguage;
}

export interface LoginInput {
	memberNick: string;
	memberPassword: string;
}

interface MISearch {
	memberStatus?: MemberStatus;
	memberType?: MemberType;
	text?: string;
}

export interface MembersInquiry {
	page: number;
	limit: number;

	sort?: string;
	direction?: Direction;
	search?: MISearch;
}

export interface UpdateMemberStatusInput {
	_id: string;
	memberStatus: MemberStatus;
}

export interface UpdateMemberTypeInput {
	_id: string;
	memberType: MemberType;
}