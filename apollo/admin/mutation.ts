import { gql, type TypedDocumentNode } from '@apollo/client';
import type { Agent } from '@/libs/types/agent/agent';
import type { UpdateAgentByAdmin } from '@/libs/types/agent/agent.update';
import type { BoardArticle } from '@/libs/types/article/board-article';
import type { BoardArticleUpdate } from '@/libs/types/article/board-article.update';
import type { Coupon } from '@/libs/types/booking/coupon';
import type { CouponInput } from '@/libs/types/booking/coupon.input';
import type { CouponUpdate } from '@/libs/types/booking/coupon.update';
import type { Member } from '@/libs/types/member/member';
import type { MemberUpdateByAdmin } from '@/libs/types/member/member.update';
import type { TravelPackage } from '@/libs/types/package/travel-package';
import type {
	DeleteTravelPackageInput,
	TravelPackageUpdate,
} from '@/libs/types/package/travel-package.update';
import type { Notice } from '@/libs/types/system/notice';
import type { NoticeInput } from '@/libs/types/system/notice.input';

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

export const CREATE_NOTICE: TypedDocumentNode<{ createNotice: Notice }, { input: NoticeInput }> = gql`
	mutation CreateNotice($input: NoticeInput!) {
		createNotice(input: $input) {
			_id
			adminId
			noticeTitle
			noticeContent
			noticeImages
			noticeViewCount
			noticePinned
			expireAt
			createdAt
			updatedAt
		}
	}
`;

export const DELETE_NOTICE: TypedDocumentNode<
	{ deleteNotice: Pick<Notice, '_id' | 'noticeTitle'> },
	{ noticeId: string }
> = gql`
	mutation DeleteNotice($noticeId: String!) {
		deleteNotice(noticeId: $noticeId) {
			_id
			noticeTitle
		}
	}
`;

type AdminCouponCreateResult = Pick<
	Coupon,
	'_id' | 'couponCode' | 'couponTitle' | 'couponType' | 'couponValue' | 'couponStatus' | 'createdAt'
>;

type AdminCouponUpdateResult = Pick<
	Coupon,
	'_id' | 'couponCode' | 'couponTitle' | 'couponType' | 'couponValue' | 'couponStatus' | 'updatedAt'
>;

type AdminCouponDeleteResult = Pick<Coupon, '_id' | 'couponCode' | 'couponTitle' | 'couponStatus'>;

export const CREATE_COUPON: TypedDocumentNode<
	{ createCoupon: AdminCouponCreateResult },
	{ input: CouponInput }
> = gql`
	mutation CreateCoupon($input: CouponInput!) {
		createCoupon(input: $input) {
			_id
			couponCode
			couponTitle
			couponType
			couponValue
			couponStatus
			createdAt
		}
	}
`;

export const UPDATE_COUPON: TypedDocumentNode<
	{ updateCoupon: AdminCouponUpdateResult },
	{ input: CouponUpdate }
> = gql`
	mutation UpdateCoupon($input: CouponUpdate!) {
		updateCoupon(input: $input) {
			_id
			couponCode
			couponTitle
			couponType
			couponValue
			couponStatus
			updatedAt
		}
	}
`;

export const DELETE_COUPON: TypedDocumentNode<
	{ deleteCoupon: AdminCouponDeleteResult },
	{ couponId: string }
> = gql`
	mutation DeleteCoupon($couponId: String!) {
		deleteCoupon(couponId: $couponId) {
			_id
			couponCode
			couponTitle
			couponStatus
		}
	}
`;
