import { gql, type TypedDocumentNode } from '@apollo/client';
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
