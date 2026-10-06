import { gql, type TypedDocumentNode } from '@apollo/client';
import type { Agent } from '@/libs/types/agent/agent';
import type { UpdateAgentByAdmin } from '@/libs/types/agent/agent.update';
import type { Member } from '@/libs/types/member/member';
import type { MemberUpdateByAdmin } from '@/libs/types/member/member.update';

export type AdminMemberUpdateResult = Pick<
	Member,
	| '_id'
	| 'memberType'
	| 'memberStatus'
	| 'memberNick'
	| 'memberFullName'
	| 'memberPhone'
	| 'memberEmail'
	| 'memberImage'
	| 'updatedAt'
>;

export const UPDATE_MEMBER_BY_ADMIN: TypedDocumentNode<
	{ updateMemberByAdmin: AdminMemberUpdateResult },
	{ input: MemberUpdateByAdmin }
> = gql`
	mutation UpdateMemberByAdmin($input: MemberUpdateByAdmin!) {
		updateMemberByAdmin(input: $input) {
			_id
			memberType
			memberStatus
			memberNick
			memberFullName
			memberPhone
			memberEmail
			memberImage
			updatedAt
		}
	}
`;

export type AdminAgentUpdateResult = Pick<
	Agent,
	'_id' | 'memberId' | 'companyName' | 'agentStatus' | 'verificationStatus' | 'updatedAt'
>;

export const UPDATE_AGENT_BY_ADMIN: TypedDocumentNode<
	{ updateAgentByAdmin: AdminAgentUpdateResult },
	{ input: UpdateAgentByAdmin }
> = gql`
	mutation UpdateAgentByAdmin($input: UpdateAgentByAdmin!) {
		updateAgentByAdmin(input: $input) {
			_id
			memberId
			companyName
			agentStatus
			verificationStatus
			updatedAt
		}
	}
`;
