import type { Booking, BookingHandoff } from '@/libs/types/booking/booking';
import type { BookingInput, CancelBookingInput } from '@/libs/types/booking/booking.input';
import type { Payment } from '@/libs/types/booking/payment';
import type { PaymentInput } from '@/libs/types/booking/payment.input';
import type { BoardArticle } from '@/libs/types/article/board-article';
import type { BoardArticleInput } from '@/libs/types/article/board-article.input';
import type { CommentEntity } from '@/libs/types/article/comment';
import type { CommentInput } from '@/libs/types/article/comment.input';
import type { AgentRequest } from '@/libs/types/agent-request/agent-request';
import type {
	AgentRequestInput,
	AgentRequestRejectInput,
} from '@/libs/types/agent-request/agent-request.input';
import type { Notification } from '@/libs/types/system/notification';
import type { ReadNotificationInput } from '@/libs/types/system/notification.input';
import type { ReportEntity } from '@/libs/types/system/report';
import type { ReportInput } from '@/libs/types/system/report.input';
import type { PrivateConversation } from '@/libs/types/chat/private-conversation';
import type { PrivateConversationInput } from '@/libs/types/chat/private-conversation.input';
import type { PrivateMessage } from '@/libs/types/chat/private-message';
import type { PrivateMessageInput } from '@/libs/types/chat/private-message.input';
import { gql, type TypedDocumentNode } from '@apollo/client';

export const READ_NOTIFICATION: TypedDocumentNode<
	{ readNotification: Notification },
	{ input: ReadNotificationInput }
> = gql`
	mutation ReadNotification($input: ReadNotificationInput!) {
		readNotification(input: $input) {
			_id
			isRead
			readAt
			updatedAt
		}
	}
`;

export const READ_ALL_NOTIFICATIONS: TypedDocumentNode<{ readAllNotifications: boolean }, Record<string, never>> = gql`
	mutation ReadAllNotifications {
		readAllNotifications
	}
`;

export const CREATE_REPORT: TypedDocumentNode<
	{
		createReport: Pick<
			ReportEntity,
			| '_id'
			| 'reporterId'
			| 'targetId'
			| 'targetType'
			| 'reportType'
			| 'reportDesc'
			| 'reportStatus'
			| 'createdAt'
			| 'updatedAt'
		>;
	},
	{ input: ReportInput }
> = gql`
	mutation CreateReport($input: ReportInput!) {
		createReport(input: $input) {
			_id
			reporterId
			targetId
			targetType
			reportType
			reportDesc
			reportStatus
			createdAt
			updatedAt
		}
	}
`;

export const LOGIN = gql`
	mutation Login($input: LoginInput!) {
		login(input: $input) {
			_id
			memberType
			memberStatus
			memberAuthType
			memberNick
			memberFullName
			memberPhone
			memberEmail
			memberImage
			memberAddress
			memberCountry
			memberCity
			memberDesc
			memberBirthDate
			memberLanguage
			memberPoint
			memberRank
			accessToken
		}
	}
`;

export const SIGN_UP = gql`
	mutation Signup($input: MemberInput!) {
		signup(input: $input) {
			_id
			memberType
			memberStatus
			memberAuthType
			memberNick
			memberFullName
			memberPhone
			memberEmail
			memberImage
			memberAddress
			memberCountry
			memberCity
			memberDesc
			memberBirthDate
			memberLanguage
			memberPoint
			memberRank
			accessToken
		}
	}
`;

export const CREATE_AGENT_REQUEST: TypedDocumentNode<
	{ createAgentRequest: AgentRequest },
	{ input: AgentRequestInput }
> = gql`
	mutation CreateAgentRequest($input: AgentRequestInput!) {
		createAgentRequest(input: $input) {
			_id
			memberId
			companyName
			businessNumber
			licenseNumber
			agentDescription
			requestStatus
			rejectReason
			reviewedBy
			reviewedAt
			createdAt
			updatedAt
		}
	}
`;

const ADMIN_AGENT_REQUEST_FIELDS = gql`
	fragment AdminAgentRequestFields on AgentRequest {
		_id
		memberId
		companyName
		businessNumber
		licenseNumber
		agentDescription
		requestStatus
		rejectReason
		reviewedBy
		reviewedAt
		createdAt
		updatedAt
	}
`;

export const APPROVE_AGENT_REQUEST_BY_ADMIN: TypedDocumentNode<
	{ approveAgentRequestByAdmin: AgentRequest },
	{ agentRequestId: string }
> = gql`
	mutation ApproveAgentRequestByAdmin($agentRequestId: String!) {
		approveAgentRequestByAdmin(agentRequestId: $agentRequestId) {
			...AdminAgentRequestFields
		}
	}
	${ADMIN_AGENT_REQUEST_FIELDS}
`;

export const REJECT_AGENT_REQUEST_BY_ADMIN: TypedDocumentNode<
	{ rejectAgentRequestByAdmin: AgentRequest },
	{ agentRequestId: string; input: AgentRequestRejectInput }
> = gql`
	mutation RejectAgentRequestByAdmin($agentRequestId: String!, $input: AgentRequestRejectInput!) {
		rejectAgentRequestByAdmin(agentRequestId: $agentRequestId, input: $input) {
			...AdminAgentRequestFields
		}
	}
	${ADMIN_AGENT_REQUEST_FIELDS}
`;

export const CREATE_BOOKING: TypedDocumentNode<{ createBooking: BookingHandoff }, { input: BookingInput }> = gql`
	mutation CreateBooking($input: BookingInput!) {
		createBooking(input: $input) {
			_id
			bookingCode
			memberId
			bookingStatus
			peopleCount
			totalPrice
			discountAmount
			finalPrice
			currency
		}
	}
`;

export const CREATE_PAYMENT: TypedDocumentNode<
	{
		createPayment: Pick<
			Payment,
			'_id' | 'bookingId' | 'paymentMethod' | 'paymentStatus' | 'paymentAmount' | 'currency'
		>;
	},
	{ input: PaymentInput }
> = gql`
	mutation CreatePayment($input: PaymentInput!) {
		createPayment(input: $input) {
			_id
			bookingId
			paymentMethod
			paymentStatus
			paymentAmount
			currency
		}
	}
`;

export const CANCEL_BOOKING: TypedDocumentNode<
	{
		cancelBooking: Pick<Booking, '_id' | 'bookingStatus' | 'cancelledAt'>;
	},
	{ input: CancelBookingInput }
> = gql`
	mutation CancelBooking($input: CancelBookingInput!) {
		cancelBooking(input: $input) {
			_id
			bookingStatus
			cancelledAt
		}
	}
`;

export const UPDATE_MEMBER: TypedDocumentNode<
	{ updateMember: Pick<import('@/libs/types/member/member').Member, '_id' | 'accessToken'> },
	{ input: import('@/libs/types/member/member.update').MemberUpdate }
> = gql`
	mutation UpdateMember($input: MemberUpdate!) {
		updateMember(input: $input) {
			_id
			accessToken
		}
	}
`;
export const UPLOAD_PROFILE_IMAGE: TypedDocumentNode<{ imageUploader: string }, { file: File }> = gql`
	mutation UploadProfileImage($file: Upload!) {
		imageUploader(file: $file, target: "member")
	}
`;

export const CREATE_BOARD_ARTICLE: TypedDocumentNode<
	{
		createBoardArticle: Pick<
			BoardArticle,
			'_id' | 'articleTitle' | 'articleCategory' | 'articleContent' | 'articleImages' | 'articleStatus' | 'createdAt'
		>;
	},
	{ input: BoardArticleInput }
> = gql`
	mutation CreateBoardArticle($input: BoardArticleInput!) {
		createBoardArticle(input: $input) {
			_id
			articleTitle
			articleCategory
			articleContent
			articleImages
			articleStatus
			createdAt
		}
	}
`;

export const LIKE_TARGET_BOARD_ARTICLE: TypedDocumentNode<
	{ likeTargetBoardArticle: Pick<BoardArticle, '_id' | 'articleLikeCount'> },
	{ articleId: string }
> = gql`
	mutation LikeTargetBoardArticle($articleId: String!) {
		likeTargetBoardArticle(articleId: $articleId) {
			_id
			articleLikeCount
		}
	}
`;

export const CREATE_COMMENT: TypedDocumentNode<
	{
		createComment: Pick<
			CommentEntity,
			| '_id'
			| 'articleId'
			| 'memberId'
			| 'parentCommentId'
			| 'commentContent'
			| 'commentLikeCount'
			| 'commentStatus'
			| 'createdAt'
		>;
	},
	{ input: CommentInput }
> = gql`
	mutation CreateComment($input: CommentInput!) {
		createComment(input: $input) {
			_id
			articleId
			memberId
			parentCommentId
			commentContent
			commentLikeCount
			commentStatus
			createdAt
		}
	}
`;

export const LIKE_TARGET_COMMENT: TypedDocumentNode<
	{ likeTargetComment: Pick<CommentEntity, '_id' | 'commentLikeCount'> },
	{ commentId: string }
> = gql`
	mutation LikeTargetComment($commentId: String!) {
		likeTargetComment(commentId: $commentId) {
			_id
			commentLikeCount
		}
	}
`;

export const DELETE_COMMENT: TypedDocumentNode<
	{ deleteComment: Pick<CommentEntity, '_id' | 'articleId' | 'memberId'> },
	{ commentId: string }
> = gql`
	mutation DeleteComment($commentId: String!) {
		deleteComment(commentId: $commentId) {
			_id
			articleId
			memberId
		}
	}
`;

export const UPLOAD_ARTICLE_IMAGE: TypedDocumentNode<{ imageUploader: string }, { file: File }> = gql`
	mutation UploadArticleImage($file: Upload!) {
		imageUploader(file: $file, target: "article")
	}
`;

export const DELETE_TRAVEL_MATE_POST: TypedDocumentNode<
 { deleteTravelMatePost: { _id: string } }, { postId: string }
> = gql`
 mutation DeleteTravelMatePost($postId: String!) {
  deleteTravelMatePost(postId: $postId) { _id }
 }
`;

export const CREATE_TRAVEL_MATE_POST: TypedDocumentNode<
	{ createTravelMatePost: Pick<import('@/libs/types/travel-mate/travel-mate-post').TravelMatePost, '_id'> },
	{ input: import('@/libs/types/travel-mate/travel-mate-post.input').TravelMatePostInput }
> = gql`
	mutation CreateTravelMatePost($input: TravelMatePostInput!) {
		createTravelMatePost(input: $input) {
			_id
		}
	}
`;

export const UPDATE_TRAVEL_MATE_POST: TypedDocumentNode<
	{ updateTravelMatePost: Pick<import('@/libs/types/travel-mate/travel-mate-post').TravelMatePost, '_id'> },
	{ input: import('@/libs/types/travel-mate/travel-mate-post.update').TravelMatePostUpdate }
> = gql`
	mutation UpdateTravelMatePost($input: TravelMatePostUpdate!) {
		updateTravelMatePost(input: $input) {
			_id
		}
	}
`;

export const JOIN_TRAVEL_MATE: TypedDocumentNode<
	{ joinTravelMate: import('./query').TravelMateJoinItem },
	{ input: import('@/libs/types/travel-mate/travel-mate-join.input').TravelMateJoinInput }
> = gql`
	mutation JoinTravelMate($input: TravelMateJoinInput!) {
		joinTravelMate(input: $input) {
			_id
			memberId
			travelMatePostId
			joinStatus
		}
	}
`;

export const APPROVE_TRAVEL_MATE_JOIN: TypedDocumentNode<
	{ approveTravelMateJoin: import('./query').TravelMateJoinItem },
	{ joinId: string }
> = gql`
	mutation ApproveTravelMateJoin($joinId: String!) {
		approveTravelMateJoin(joinId: $joinId) {
			_id
			memberId
			travelMatePostId
			joinStatus
		}
	}
`;
export const REJECT_TRAVEL_MATE_JOIN: TypedDocumentNode<
	{ rejectTravelMateJoin: import('./query').TravelMateJoinItem },
	{ joinId: string }
> = gql`
	mutation RejectTravelMateJoin($joinId: String!) {
		rejectTravelMateJoin(joinId: $joinId) {
			_id
			memberId
			travelMatePostId
			joinStatus
		}
	}
`;

export const LEAVE_TRAVEL_MATE: TypedDocumentNode<
	{ leaveTravelMate: import('./query').TravelMateJoinItem },
	{ joinId: string }
> = gql`
	mutation LeaveTravelMate($joinId: String!) {
		leaveTravelMate(joinId: $joinId) {
			_id
			memberId
			travelMatePostId
			joinStatus
		}
	}
`;

export const TOGGLE_SAVED_PACKAGE: TypedDocumentNode<{ likeTargetPackage: { _id: string } }, { packageId: string }> =
	gql`
		mutation ToggleSavedPackage($packageId: String!) {
			likeTargetPackage(packageId: $packageId) {
				_id
			}
		}
	`;

export const SUBSCRIBE_MEMBER: TypedDocumentNode<{ subscribe: { _id: string } }, { input: string }> = gql`
	mutation SubscribeMember($input: String!) {
		subscribe(input: $input) {
			_id
		}
	}
`;
export const UNSUBSCRIBE_MEMBER: TypedDocumentNode<{ unsubscribe: { _id: string } }, { input: string }> = gql`
	mutation UnsubscribeMember($input: String!) {
		unsubscribe(input: $input) {
			_id
		}
	}
`;

export const DELETE_MEMBER: TypedDocumentNode<
	{ deleteMember: Pick<import('@/libs/types/member/member').Member, '_id' | 'memberStatus' | 'memberDeletedAt'> },
	Record<string, never>
> = gql`
	mutation DeleteMember {
		deleteMember {
			_id
			memberStatus
			memberDeletedAt
		}
	}
`;

export const CREATE_CONVERSATION: TypedDocumentNode<
	{ createConversation: PrivateConversation },
	{ input: PrivateConversationInput }
> = gql`
	mutation CreateConversation($input: PrivateConversationInput!) {
		createConversation(input: $input) {
			_id
			memberOneId
			memberTwoId
			createdAt
			updatedAt
		}
	}
`;

export const SEND_PRIVATE_MESSAGE: TypedDocumentNode<
	{ sendMessage: PrivateMessage },
	{ input: PrivateMessageInput }
> = gql`
	mutation SendPrivateMessage($input: PrivateMessageInput!) {
		sendMessage(input: $input) {
			_id
			conversationId
			senderId
			receiverId
			messageType
			messageContent
			messageImages
			messageStatus
			readAt
			createdAt
			updatedAt
		}
	}
`;

export const MARK_CONVERSATION_AS_READ: TypedDocumentNode<
	{ markConversationAsRead: boolean },
	{ conversationId: string }
> = gql`
	mutation MarkConversationAsRead($conversationId: String!) {
		markConversationAsRead(conversationId: $conversationId)
	}
`;

export const CREATE_TRAVEL_PACKAGE: TypedDocumentNode<
	{ createTravelPackage: { _id: string } },
	{ input: import('@/libs/types/package/travel-package.input').TravelPackageInput }
> = gql`
	mutation CreateTravelPackage($input: TravelPackageInput!) {
		createTravelPackage(input: $input) {
			_id
		}
	}
`;
export const UPLOAD_PACKAGE_IMAGE: TypedDocumentNode<{ imageUploader: string }, { file: File }> = gql`
	mutation UploadPackageImage($file: Upload!) {
		imageUploader(file: $file, target: "package")
	}
`;

export const CREATE_PACKAGE_ITINERARY: TypedDocumentNode<
	{ createItinerary: { _id: string } },
	{ input: import('@/libs/types/package/itinerary.input').ItineraryInput }
> = gql`
	mutation CreatePackageItinerary($input: ItineraryInput!) {
		createItinerary(input: $input) {
			_id
		}
	}
`;

export const CREATE_PACKAGE_SCHEDULE: TypedDocumentNode<
{ createPackageSchedule: { _id: string } },{ input: import('@/libs/types/package/package-schedule.input').PackageScheduleInput }> = gql`
	mutation CreatePackageSchedule($input: PackageScheduleInput!) {
		createPackageSchedule(input: $input) {
			_id
		}
	}
`;

export const CREATE_PACKAGE_INCLUDE: TypedDocumentNode<
 { createPackageInclude: { _id: string } },
 { input: import('@/libs/types/package/package-include.input').PackageIncludeInput }
> = gql`mutation CreatePackageInclude($input: PackageIncludeInput!) {
 createPackageInclude(input: $input) { _id }
}`;

export const CREATE_PACKAGE_EXCLUDE: TypedDocumentNode<
 { createPackageExclude: { _id: string } },
 { input: import('@/libs/types/package/package-exclude.input').PackageExcludeInput }
> = gql`mutation CreatePackageExclude($input: PackageExcludeInput!) {
 createPackageExclude(input: $input) { _id }
}`;

export const CREATE_PACKAGE_TAG: TypedDocumentNode<
 { createPackageTag: { _id: string } },
 { input: import('@/libs/types/package/package-tag.input').PackageTagInput }
> = gql`mutation CreatePackageTag($input: PackageTagInput!) {
 createPackageTag(input: $input) { _id }
}`;

export const CREATE_PACKAGE_POLICY: TypedDocumentNode<
 { createPackagePolicy: { _id: string } },
 { input: import('@/libs/types/package/package-policy.input').PackagePolicyInput }
> = gql`mutation CreatePackagePolicy($input: PackagePolicyInput!) {
 createPackagePolicy(input: $input) { _id }
}`;


export const UPDATE_PACKAGE_POLICY: TypedDocumentNode<
	{ updatePackagePolicy: { _id: string } },
	{ policyId: string; input: import('@/libs/types/package/package-policy.update').PackagePolicyUpdate }
> = gql`
	mutation UpdatePackagePolicy($policyId: String!, $input: PackagePolicyUpdate!) {
		updatePackagePolicy(policyId: $policyId, input: $input) {
			_id
			cancelPolicy
			refundPolicy
		}
	}
`;

export const UPDATE_TRAVEL_PACKAGE: TypedDocumentNode<
	{ updateTravelPackage: { _id: string } },
	{ input: import('@/libs/types/package/travel-package.update').TravelPackageUpdate }
> = gql`
	mutation UpdateTravelPackage($input: TravelPackageUpdate!) {
		updateTravelPackage(input: $input) {
			_id
			packageTitle
			packageStatus
		}
	}
`;

export const UPDATE_PACKAGE_ITINERARY: TypedDocumentNode<
	{ updateItinerary: { _id: string } },
	{ input: import('@/libs/types/package/itinerary.update').ItineraryUpdate }
> = gql`
	mutation UpdatePackageItinerary($input: ItineraryUpdate!) {
		updateItinerary(input: $input) {
			_id
			dayNumber
			title
			description
		}
	}
`;

export const UPDATE_PACKAGE_SCHEDULE: TypedDocumentNode<
	{ updatePackageSchedule: { _id: string } },
	{ input: import('@/libs/types/package/package-schedule.update').PackageScheduleUpdate }
> = gql`
	mutation UpdatePackageSchedule($input: PackageScheduleUpdate!) {
		updatePackageSchedule(input: $input) {
			_id
			startDate
			endDate
			availableSeats
			scheduleStatus
		}
	}
`;

export const DELETE_PACKAGE_SCHEDULE: TypedDocumentNode<
	{ deletePackageSchedule: { _id: string } },
	{ input: { _id: string } }
> = gql`
	mutation DeletePackageSchedule($input: DeletePackageScheduleInput!) {
		deletePackageSchedule(input: $input) {
			_id
		}
	}
`;

export const DELETE_PACKAGE_ITINERARY: TypedDocumentNode<
	{ deleteItinerary: { _id: string } },
	{ input: { _id: string } }
> = gql`
	mutation DeletePackageItinerary($input: DeleteItineraryInput!) {
		deleteItinerary(input: $input) {
			_id
		}
	}
`;

export const DELETE_PACKAGE_INCLUDE: TypedDocumentNode<
	{ deletePackageInclude: { _id: string } },
	{ input: { _id: string } }
> = gql`
	mutation DeletePackageInclude($input: DeletePackageIncludeInput!) {
		deletePackageInclude(input: $input) {
			_id
		}
	}
`;

export const DELETE_PACKAGE_EXCLUDE: TypedDocumentNode<
	{ deletePackageExclude: { _id: string } },
	{ input: { _id: string } }
> = gql`
	mutation DeletePackageExclude($input: DeletePackageExcludeInput!) {
		deletePackageExclude(input: $input) {
			_id
		}
	}
`;

export const DELETE_PACKAGE_TAG: TypedDocumentNode<{ deletePackageTag: { _id: string } }, { input: { _id: string } }> =
	gql`
		mutation DeletePackageTag($input: DeletePackageTagInput!) {
			deletePackageTag(input: $input) {
				_id
			}
		}
	`;

export const DELETE_PACKAGE_POLICY: TypedDocumentNode<
	{ deletePackagePolicy: { _id: string } },
	{ input: { _id: string } }
> = gql`
	mutation DeletePackagePolicy($input: DeletePackagePolicyInput!) {
		deletePackagePolicy(input: $input) {
			_id
		}
	}
`;

export const UPDATE_BOOKING_STATUS: TypedDocumentNode<
 { updateBookingStatus: Pick<Booking, '_id' | 'bookingStatus'> },
 { input: import('@/libs/types/booking/booking.input').UpdateBookingStatusInput }
> = gql`
 mutation UpdateBookingStatus($input: UpdateBookingStatusInput!) {
  updateBookingStatus(input: $input) { _id bookingStatus }
 }
`;
