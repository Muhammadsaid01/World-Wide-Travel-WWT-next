import { gql, type TypedDocumentNode } from '@apollo/client';
import type { Agent } from '@/libs/types/agent/agent';
import type { UpdateAgentByAdmin } from '@/libs/types/agent/agent.update';
import type { BoardArticle } from '@/libs/types/article/board-article';
import type { BoardArticleUpdate } from '@/libs/types/article/board-article.update';
import type { Member } from '@/libs/types/member/member';
import type { MemberUpdateByAdmin } from '@/libs/types/member/member.update';
import type { TravelPackage } from '@/libs/types/package/travel-package';
import type {
	DeleteTravelPackageInput,
	TravelPackageUpdate,
} from '@/libs/types/package/travel-package.update';

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

export type AdminPackageMutationResult = Pick<
	TravelPackage,
	'_id' | 'packageTitle' | 'packageStatus' | 'updatedAt'
>;

export const UPDATE_TRAVEL_PACKAGE_BY_ADMIN: TypedDocumentNode<
	{ updateTravelPackageByAdmin: AdminPackageMutationResult },
	{ input: TravelPackageUpdate }
> = gql`
	mutation UpdateTravelPackageByAdmin($input: TravelPackageUpdate!) {
		updateTravelPackageByAdmin(input: $input) {
			_id
			packageTitle
			packageStatus
			updatedAt
		}
	}
`;

export const DELETE_TRAVEL_PACKAGE_BY_ADMIN: TypedDocumentNode<
	{ deleteTravelPackageByAdmin: AdminPackageMutationResult },
	{ input: DeleteTravelPackageInput }
> = gql`
	mutation DeleteTravelPackageByAdmin($input: DeleteTravelPackageInput!) {
		deleteTravelPackageByAdmin(input: $input) {
			_id
			packageTitle
			packageStatus
			updatedAt
		}
	}
`;

export type AdminArticleMutationResult = Pick<
	BoardArticle,
	'_id' | 'articleTitle' | 'articleStatus' | 'updatedAt'
>;

export const UPDATE_BOARD_ARTICLE_BY_ADMIN: TypedDocumentNode<
	{ updateBoardArticleByAdmin: AdminArticleMutationResult },
	{ input: BoardArticleUpdate }
> = gql`
	mutation UpdateBoardArticleByAdmin($input: BoardArticleUpdate!) {
		updateBoardArticleByAdmin(input: $input) {
			_id
			articleTitle
			articleStatus
			updatedAt
		}
	}
`;
