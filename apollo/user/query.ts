import type { Direction } from '@/libs/enums/common.enum';
import type { Agent } from '@/libs/types/agent/agent';
import type { AgentRequest } from '@/libs/types/agent-request/agent-request';
import type { AgentRequestsInquiry } from '@/libs/types/agent-request/agent-request.input';
import type { Booking, BookingHandoff } from '@/libs/types/booking/booking';
import type { BookingsInquiry } from '@/libs/types/booking/booking.input';
import type { CouponValidation } from '@/libs/types/booking/coupon';
import type { ValidateCouponInput } from '@/libs/types/booking/coupon.input';
import type { MeLiked } from '@/libs/types/community/like';
import type { CommentEntity } from '@/libs/types/article/comment';
import type { Payment } from '@/libs/types/booking/payment';
import type { Traveler } from '@/libs/types/booking/traveler';
import type { Review } from '@/libs/types/community/review';
import type { ReviewsInquiry } from '@/libs/types/community/review.input';
import type { Member } from '@/libs/types/member/member';
import type { Itinerary } from '@/libs/types/package/itinerary';
import type { PackageExclude } from '@/libs/types/package/package-exclude';
import type { PackageInclude } from '@/libs/types/package/package-include';
import type { PackagePolicy } from '@/libs/types/package/package-policy';
import type { PackageSchedule } from '@/libs/types/package/package-schedule';
import type { PackageTag } from '@/libs/types/package/package-tag';
import type { TravelPackage } from '@/libs/types/package/travel-package';
import type { TravelPackagesInquiry } from '@/libs/types/package/travel-package.input';
import type { Notice } from '@/libs/types/system/notice';
import type { NoticesInquiry } from '@/libs/types/system/notice.input';
import type { Notification } from '@/libs/types/system/notification';
import type { NotificationsInquiry } from '@/libs/types/system/notification.input';
import { gql, type TypedDocumentNode } from '@apollo/client';

type GraphQLDirection = keyof typeof Direction;

export type NotificationQueryInput = Omit<NotificationsInquiry, 'direction'> & {
	direction?: GraphQLDirection;
};

export type NoticeQueryInput = Omit<NoticesInquiry, 'direction'> & {
	direction?: GraphQLDirection;
};

export type NotificationItem = Notification;
export type NoticeItem = Notice;

const NOTIFICATION_FIELDS = gql`
	fragment NotificationFields on Notification {
		_id
		receiverId
		senderId
		notificationType
		notificationTitle
		notificationMessage
		referenceType
		referenceId
		isRead
		readAt
		createdAt
		updatedAt
	}
`;

export const GET_MY_NOTIFICATIONS: TypedDocumentNode<
	{
		getMyNotifications: {
			list: NotificationItem[];
			metaCounter?: { total?: number | null }[] | null;
		};
	},
	{ input: NotificationQueryInput }
> = gql`
	query GetMyNotifications($input: NotificationsInquiry!) {
		getMyNotifications(input: $input) {
			list {
				...NotificationFields
			}
			metaCounter {
				total
			}
		}
	}
	${NOTIFICATION_FIELDS}
`;

export const GET_UNREAD_NOTIFICATION_COUNT: TypedDocumentNode<
	{ getMyNotifications: { metaCounter?: { total?: number | null }[] | null } },
	{ input: NotificationQueryInput }
> = gql`
	query GetUnreadNotificationCount($input: NotificationsInquiry!) {
		getMyNotifications(input: $input) {
			metaCounter {
				total
			}
		}
	}
`;

export const GET_NOTICES: TypedDocumentNode<
	{
		getNotices: {
			list: NoticeItem[];
			metaCounter?: { total?: number | null }[] | null;
		};
	},
	{ input: NoticeQueryInput }
> = gql`
	query GetNotices($input: NoticesInquiry!) {
		getNotices(input: $input) {
			list {
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
			metaCounter {
				total
			}
		}
	}
`;

export type PackageListItem = Pick<
	TravelPackage,
	| '_id'
	| 'packageTitle'
	| 'destinationCountry'
	| 'destinationCity'
	| 'packageImages'
	| 'packageDays'
	| 'packageNights'
	| 'packagePrice'
	| 'currency'
	| 'packageRating'
	| 'packageReviewCount'
>;

// GraphQL serializes enum names, not the numeric values of the shared TS enum.
export type PackageListInput = Omit<TravelPackagesInquiry, 'direction'> & {
	direction?: keyof typeof Direction;
};

export const GET_TRAVEL_PACKAGES: TypedDocumentNode<
	{
		getTravelPackages: {
			list: PackageListItem[];
			metaCounter?: { total?: number | null }[] | null;
		};
	},
	{ input: PackageListInput }
> = gql`
	query GetTravelPackages($input: TravelPackagesInquiry!) {
		getTravelPackages(input: $input) {
			list {
				_id
				packageTitle
				destinationCountry
				destinationCity
				packageImages
				packageDays
				packageNights
				packagePrice
				currency
				packageRating
				packageReviewCount
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_PACKAGE_SCHEDULES: TypedDocumentNode<
	{
		getPackageSchedules: Pick<PackageSchedule, '_id' | 'startDate' | 'endDate' | 'availableSeats' | 'scheduleStatus'>[];
	},
	{ packageId: string }
> = gql`
	query GetPackageSchedules($packageId: String!) {
		getPackageSchedules(packageId: $packageId) {
			_id
			startDate
			endDate
			availableSeats
			scheduleStatus
		}
	}
`;

type PublicMember = Pick<Member, 'memberNick' | 'memberImage'>;
export type PackageDetailData = PackageListItem &
	Pick<
		TravelPackage,
		| 'packageDesc'
		| 'packageCategory'
		| 'packageType'
		| 'packageLevel'
		| 'packageStatus'
		| 'minPeople'
		| 'maxPeople'
		| 'meetingPoint'
		| 'latitude'
		| 'longitude'
		| 'transportType'
	> & {
		packageShortDesc?: string | null;
		agentData?:
			| (Pick<
					Agent,
					| '_id'
					| 'memberId'
					| 'companyName'
					| 'verificationStatus'
					| 'agentRating'
					| 'agentReviewCount'
					| 'agentPackageCount'
			  > & {
					memberData?: (PublicMember & Pick<Member, '_id'> & { memberFullName?: string | null }) | null;
			  })
			| null;
	};
export const GET_TRAVEL_PACKAGE: TypedDocumentNode<{ getTravelPackage: PackageDetailData | null }, { input: string }> =
	gql`
		query GetTravelPackage($input: String!) {
			getTravelPackage(input: $input) {
				_id
				packageTitle
				packageDesc
				packageShortDesc
				packageCategory
				packageType
				packageLevel
				packageStatus
				destinationCountry
				destinationCity
				packageImages
				packageDays
				packageNights
				packagePrice
				minPeople
				maxPeople
				meetingPoint
				latitude
				longitude
				transportType
				currency
				packageRating
				packageReviewCount
				agentData {
					_id
					memberId
					companyName
					verificationStatus
					agentRating
					agentReviewCount
					agentPackageCount
					memberData {
						_id
						memberFullName
						memberNick
						memberImage
					}
				}
			}
		}
	`;
export const GET_PACKAGE_TAGS: TypedDocumentNode<
	{
		getPackageTags: Pick<PackageTag, '_id' | 'tagName'>[];
	},
	{ packageId: string }
> = gql`
	query GetPackageTags($packageId: String!) {
		getPackageTags(packageId: $packageId) {
			_id
			tagName
		}
	}
`;
export const GET_PACKAGE_REVIEWS: TypedDocumentNode<
	{
		getPackageReviews: {
			list: (Pick<Review, '_id' | 'reviewContent' | 'reviewRating' | 'createdAt'> & {
				reviewTitle?: string | null;
				memberData?: PublicMember | null;
			})[];
			metaCounter?: { total?: number | null }[] | null;
		};
	},
	{ packageId: string; input: Pick<ReviewsInquiry, 'page' | 'limit'> }
> = gql`
	query GetPackageReviews($packageId: String!, $input: ReviewsInquiry!) {
		getPackageReviews(packageId: $packageId, input: $input) {
			list {
				_id
				reviewTitle
				reviewContent
				reviewRating
				createdAt
				memberData {
					memberNick
					memberImage
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_PACKAGE_ITINERARIES: TypedDocumentNode<
	{ getItineraries: Pick<Itinerary, '_id' | 'dayNumber' | 'title' | 'description'>[] },
	{ packageId: string }
> = gql`
	query GetPackageItineraries($packageId: String!) {
		getItineraries(packageId: $packageId) {
			_id
			dayNumber
			title
			description
		}
	}
`;

export const GET_PACKAGE_INCLUSIONS: TypedDocumentNode<
	{
		getPackageIncludes: Pick<PackageInclude, '_id' | 'content'>[];
		getPackageExcludes: Pick<PackageExclude, '_id' | 'title'>[];
	},
	{ packageId: string }
> = gql`
	query GetPackageInclusions($packageId: String!) {
		getPackageIncludes(packageId: $packageId) {
			_id
			content
		}
		getPackageExcludes(packageId: $packageId) {
			_id
			title
		}
	}
`;

export const GET_PACKAGE_POLICY: TypedDocumentNode<
	{ getPackagePolicy: Pick<PackagePolicy, '_id' | 'cancelPolicy' | 'refundPolicy'>[] },
	{ packageId: string }
> = gql`
	query GetPackagePolicy($packageId: String!) {
		getPackagePolicy(packageId: $packageId) {
			_id
			cancelPolicy
			refundPolicy
		}
	}
`;

export const VALIDATE_COUPON: TypedDocumentNode<{ validateCoupon: CouponValidation }, { input: ValidateCouponInput }> =
	gql`
		query ValidateCoupon($input: ValidateCouponInput!) {
			validateCoupon(input: $input) {
				valid
				couponId
				couponCode
				discountAmount
				finalPrice
				message
			}
		}
	`;

export type PaymentBooking = BookingHandoff & {
	packageData?: Pick<
		TravelPackage,
		'_id' | 'packageTitle' | 'packageImages' | 'destinationCity' | 'destinationCountry'
	> | null;
	scheduleData?: Pick<PackageSchedule, 'startDate' | 'endDate'> | null;
};
export type BookingDetail = Omit<PaymentBooking, 'packageData'> &
	Pick<
		Booking,
		'packageId' | 'createdAt' | 'contactName' | 'contactPhone' | 'contactEmail' | 'specialRequest' | 'cancelledAt'
	> & {
		agentData?: Pick<Agent, 'companyName'> | null;
		memberData?: Pick<Member, 'memberNick' | 'memberImage'> | null;
		packageData?:
			(NonNullable<PaymentBooking['packageData']> & Pick<TravelPackage, 'packageDays' | 'packageNights'>) | null;
	};
export const GET_MY_BOOKING: TypedDocumentNode<{ getMyBooking: BookingDetail }, { bookingId: string }> = gql`
	query GetMyBooking($bookingId: String!) {
		getMyBooking(bookingId: $bookingId) {
			_id
			bookingCode
			packageId
			createdAt
			contactName
			contactPhone
			contactEmail
			specialRequest
			cancelledAt
			agentData {
				companyName
			}
			memberData {
				memberNick
				memberImage
			}
			memberId
			bookingStatus
			peopleCount
			totalPrice
			discountAmount
			finalPrice
			packageData {
				_id
				packageTitle
				packageDays
				packageNights
				packageImages
				destinationCity
				destinationCountry
			}
			scheduleData {
				startDate
				endDate
			}
			currency
		}
	}
`;

export const GET_MY_PAYMENTS: TypedDocumentNode<
	{
		getMyPayments: Pick<
			Payment,
			'_id' | 'bookingId' | 'paymentMethod' | 'paymentStatus' | 'paymentAmount' | 'currency'
		>[];
	},
	Record<string, never>
> = gql`
	query GetMyPayments {
		getMyPayments {
			_id
			bookingId
			paymentMethod
			paymentStatus
			paymentAmount
			currency
		}
	}
`;

// Direction is a numeric TS enum, but GraphQL variables use its registered names.
export type MyBookingsInput = Omit<BookingsInquiry, 'direction' | 'search'> & {
	direction?: keyof typeof Direction;
	search?: Pick<NonNullable<BookingsInquiry['search']>, 'bookingStatus' | 'text'>;
};
export const GET_MY_BOOKINGS: TypedDocumentNode<
	{
		getMyBookings: { list: PaymentBooking[]; metaCounter?: { total: number }[] | null };
	},
	{ input: MyBookingsInput }
> = gql`
	query GetMyBookings($input: BookingsInquiry!) {
		getMyBookings(input: $input) {
			list {
				_id
				bookingCode
				memberId
				bookingStatus
				peopleCount
				totalPrice
				discountAmount
				finalPrice
				currency
				packageData {
					_id
					packageTitle
					packageImages
					destinationCity
					destinationCountry
				}
				scheduleData {
					startDate
					endDate
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_MY_TRAVELERS_BY_BOOKING: TypedDocumentNode<
	{
		getMyTravelersByBooking: Pick<Traveler, '_id' | 'firstName' | 'lastName'>[];
	},
	{ bookingId: string }
> = gql`
	query GetMyTravelersByBooking($bookingId: String!) {
		getMyTravelersByBooking(bookingId: $bookingId) {
			_id
			firstName
			lastName
		}
	}
`;

export type ProfileMember = Pick<
	Member,
	| '_id'
	| 'memberNick'
	| 'memberFullName'
	| 'memberEmail'
	| 'memberPhone'
	| 'memberAddress'
	| 'memberLanguage'
	| 'memberType'
	| 'memberStatus'
	| 'memberImage'
	| 'memberDesc'
	| 'memberCity'
	| 'memberCountry'
	| 'memberFollowerCount'
	| 'memberFollowingCount'
> & { agentData?: Pick<import('@/libs/types/agent/agent').AgentProfileData, '_id'> | null };
export const GET_MY_PROFILE: TypedDocumentNode<{ getMyProfile: ProfileMember }, Record<string, never>> = gql`
	query GetMyProfile {
		getMyProfile {
			_id
			memberNick
			memberFullName
			memberEmail
			memberPhone
			memberAddress
			memberLanguage
			memberType
			memberStatus
			memberImage
			memberDesc
			memberCity
			memberCountry
			memberFollowerCount
			memberFollowingCount
			agentData {
				_id
			}
		}
	}
`;
export const GET_PROFILE_ARTICLES: TypedDocumentNode<
	{
		getMyBoardArticles: {
			list: Pick<
				import('@/libs/types/article/board-article').BoardArticle,
				'_id' | 'articleTitle' | 'articleLikeCount' | 'articleViewCount' | 'articleCommentCount'
			>[];
			metaCounter?: { total: number }[] | null;
		};
	},
	Record<string, never>
> = gql`
	query GetProfileArticles {
		getMyBoardArticles(input: { page: 1, limit: 1, sort: "createdAt", direction: DESC }) {
			list {
				_id
				articleTitle
				articleLikeCount
				articleViewCount
				articleCommentCount
			}
			metaCounter {
				total
			}
		}
	}
`;
export const GET_PROFILE_TRAVEL_MATES: TypedDocumentNode<
	{
		getMyTravelMatePosts: {
			list: Pick<
				import('@/libs/types/travel-mate/travel-mate-post').TravelMatePost,
				'_id' | 'matePostTitle' | 'matePostStatus'
			>[];
			metaCounter?: { total: number }[] | null;
		};
	},
	Record<string, never>
> = gql`
	query GetProfileTravelMates {
		getMyTravelMatePosts(input: { page: 1, limit: 1, sort: "createdAt", direction: DESC }) {
			list {
				_id
				matePostTitle
				matePostStatus
			}
			metaCounter {
				total
			}
		}
	}
`;

export type MyArticleItem = Pick<
	import('@/libs/types/article/board-article').BoardArticle,
	| '_id'
	| 'articleTitle'
	| 'articleImages'
	| 'articleCategory'
	| 'articleStatus'
	| 'articleLikeCount'
	| 'articleCommentCount'
	| 'articleViewCount'
	| 'createdAt'
	| 'updatedAt'
>;
export type MyArticlesInput = Omit<
	import('@/libs/types/article/board-article.input').BoardArticlesInquiry,
	'direction' | 'search'
> & {
	direction?: keyof typeof Direction;
	search?: Pick<
		NonNullable<import('@/libs/types/article/board-article.input').BoardArticlesInquiry['search']>,
		'text' | 'articleStatus' | 'articleCategory'
	>;
};
export const GET_MY_ARTICLES: TypedDocumentNode<
	{ getMyBoardArticles: { list: MyArticleItem[]; metaCounter?: { total: number }[] | null } },
	{ input: MyArticlesInput }
> = gql`
	query GetMyArticles($input: BoardArticlesInquiry!) {
		getMyBoardArticles(input: $input) {
			list {
				_id
				articleTitle
				articleImages
				articleCategory
				articleStatus
				articleLikeCount
				articleCommentCount
				articleViewCount
				createdAt
				updatedAt
			}
			metaCounter {
				total
			}
		}
	}
`;

export type MyTravelMateItem = Pick<
	import('@/libs/types/travel-mate/travel-mate-post').TravelMatePost,
	| '_id'
	| 'memberId'
	| 'matePostTitle'
	| 'matePostStatus'
	| 'destinationCity'
	| 'destinationCountry'
	| 'travelDate'
	| 'currentMembers'
	| 'maxMembers'
>;
export type MyTravelMatesInput = Omit<
	import('@/libs/types/travel-mate/travel-mate-post.input').TravelMatePostsInquiry,
	'direction'
> & { direction?: keyof typeof Direction };
export const GET_MY_TRAVEL_MATES: TypedDocumentNode<
	{ getMyTravelMatePosts: { list: MyTravelMateItem[]; metaCounter?: { total: number }[] | null } },
	{ input: MyTravelMatesInput }
> = gql`
	query GetMyTravelMates($input: TravelMatePostsInquiry!) {
		getMyTravelMatePosts(input: $input) {
			list {
				_id
				memberId
				matePostTitle
				matePostStatus
				destinationCity
				destinationCountry
				travelDate
				currentMembers
				maxMembers
			}
			metaCounter {
				total
			}
		}
	}
`;

export type TravelMateMember = Pick<
	Member,
	| '_id'
	| 'memberNick'
	| 'memberFullName'
	| 'memberImage'
	| 'memberCity'
	| 'memberCountry'
	| 'memberDesc'
	| 'memberFollowerCount'
	| 'memberFollowingCount'
>;
export type TravelMateDetail = Omit<
	import('@/libs/types/travel-mate/travel-mate-post').TravelMatePost,
	'memberData'
> & { memberData?: TravelMateMember | null };
export type TravelMateJoinItem = Pick<
	import('@/libs/types/travel-mate/travel-mate-join').TravelMateJoin,
	'_id' | 'memberId' | 'travelMatePostId' | 'joinStatus'
>;
export type TravelMateJoinsInput = Omit<
	import('@/libs/types/travel-mate/travel-mate-join.input').TravelMateJoinsInquiry,
	'direction'
> & { direction?: keyof typeof Direction };
export const GET_TRAVEL_MATE_DETAIL: TypedDocumentNode<{ getTravelMatePost: TravelMateDetail }, { postId: string }> =
	gql`
		query GetTravelMateDetail($postId: String!) {
			getTravelMatePost(postId: $postId) {
				_id
				memberId
				departureCountry
				departureCity
				destinationCountry
				destinationCity
				travelDate
				maxMembers
				currentMembers
				matePostTitle
				matePostContent
				matePostStatus
				matePostDeletedAt
				createdAt
				updatedAt
				matePostViewCount
				memberData {
					_id
					memberNick
					memberFullName
					memberImage
					memberCity
					memberCountry
					memberDesc
					memberFollowerCount
					memberFollowingCount
				}
			}
		}
	`;
export const GET_TRAVEL_MATE_PARTICIPANTS: TypedDocumentNode<
	{
		getTravelMateParticipants: {
			list: (TravelMateJoinItem & {
				memberData?: Pick<TravelMateMember, '_id' | 'memberNick' | 'memberFullName' | 'memberImage'> | null;
			})[];
			metaCounter?: { total: number }[] | null;
		};
	},
	{ input: TravelMateJoinsInput }
> = gql`
	query GetTravelMateParticipants($input: TravelMateJoinsInquiry!) {
		getTravelMateParticipants(input: $input) {
			list {
				_id
				memberId
				travelMatePostId
				joinStatus
				memberData {
					_id
					memberNick
					memberFullName
					memberImage
				}
			}
			metaCounter {
				total
			}
		}
	}
`;
export const GET_MY_TRAVEL_MATE_JOIN: TypedDocumentNode<
	{ getMyJoinedTravelMates: { list: TravelMateJoinItem[] } },
	{ input: TravelMateJoinsInput }
> = gql`
	query GetMyTravelMateJoin($input: TravelMateJoinsInquiry!) {
		getMyJoinedTravelMates(input: $input) {
			list {
				_id
				memberId
				travelMatePostId
				joinStatus
			}
		}
	}
`;
export type CommunityTravelMateItem = MyTravelMateItem &
	Pick<
		import('@/libs/types/travel-mate/travel-mate-post').TravelMatePost,
		'matePostContent' | 'matePostViewCount' | 'createdAt'
	> & {
		memberData?: Pick<Member, '_id' | 'memberNick' | 'memberFullName' | 'memberImage' | 'memberType'> | null;
	};
export const GET_MORE_TRAVEL_MATES: TypedDocumentNode<
	{
		getTravelMatePosts: {
			list: CommunityTravelMateItem[];
			metaCounter?: { total: number }[] | null;
		};
	},
	{ input: MyTravelMatesInput }
> = gql`
	query GetMoreTravelMates($input: TravelMatePostsInquiry!) {
		getTravelMatePosts(input: $input) {
			list {
				_id
				memberId
				matePostTitle
				matePostStatus
				destinationCity
				destinationCountry
				travelDate
				currentMembers
				maxMembers
				matePostContent
				matePostViewCount
				createdAt
				memberData {
					_id
					memberNick
					memberFullName
					memberImage
					memberType
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export type CommunityArticleItem = Pick<
	import('@/libs/types/article/board-article').BoardArticle,
	| '_id'
	| 'articleTitle'
	| 'articleContent'
	| 'articleImages'
	| 'articleCategory'
	| 'articleViewCount'
	| 'articleLikeCount'
	| 'articleCommentCount'
	| 'createdAt'
> & {
	memberData?: Pick<Member, '_id' | 'memberNick' | 'memberFullName' | 'memberImage' | 'memberType'> | null;
};
export type CommunityArticlesInput = Omit<
	import('@/libs/types/article/board-article.input').BoardArticlesInquiry,
	'direction' | 'search'
> & {
	direction?: keyof typeof Direction;
	search?: Pick<
		NonNullable<import('@/libs/types/article/board-article.input').BoardArticlesInquiry['search']>,
		'text' | 'articleCategory'
	>;
};
export const GET_COMMUNITY_ARTICLES: TypedDocumentNode<
	{
		getBoardArticles: {
			list: CommunityArticleItem[];
			metaCounter?: { total: number }[] | null;
		};
	},
	{ input: CommunityArticlesInput }
> = gql`
	query GetCommunityArticles($input: BoardArticlesInquiry!) {
		getBoardArticles(input: $input) {
			list {
				_id
				articleTitle
				articleContent
				articleImages
				articleCategory
				articleViewCount
				articleLikeCount
				articleCommentCount
				createdAt
				memberData {
					_id
					memberNick
					memberFullName
					memberImage
					memberType
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export type CommunityArticleDetail = Pick<
	import('@/libs/types/article/board-article').BoardArticle,
	| '_id'
	| 'articleTitle'
	| 'articleContent'
	| 'articleImages'
	| 'articleCategory'
	| 'articleViewCount'
	| 'articleLikeCount'
	| 'articleCommentCount'
	| 'createdAt'
> & {
	memberData?: Pick<Member, '_id' | 'memberNick' | 'memberFullName' | 'memberImage' | 'memberType'> | null;
	meLiked?: MeLiked[] | null;
};
export const GET_COMMUNITY_ARTICLE_DETAIL: TypedDocumentNode<
	{ getBoardArticle: CommunityArticleDetail | null },
	{ articleId: string }
> = gql`
	query GetCommunityArticleDetail($articleId: String!) {
		getBoardArticle(articleId: $articleId) {
			_id
			articleTitle
			articleContent
			articleImages
			articleCategory
			articleViewCount
			articleLikeCount
			articleCommentCount
			createdAt
			memberData {
				_id
				memberNick
				memberFullName
				memberImage
				memberType
			}
			meLiked {
				memberId
				targetId
				targetType
				meLiked
			}
		}
	}
`;

export type CommunityCommentItem = Pick<
	CommentEntity,
	'_id' | 'articleId' | 'memberId' | 'parentCommentId' | 'commentContent' | 'commentLikeCount' | 'commentStatus' | 'createdAt'
> & {
	memberData?: Pick<Member, '_id' | 'memberNick' | 'memberFullName' | 'memberImage' | 'memberType'> | null;
	meLiked?: MeLiked[] | null;
};
export type CommunityCommentsInput = {
	page: number;
	limit: number;
	sort?: string;
	direction?: keyof typeof Direction;
	search?: {
		articleId?: string;
		parentCommentId?: string;
	};
};
export const GET_COMMENTS_BY_ARTICLE: TypedDocumentNode<
	{
		getCommentsByArticle: {
			list: CommunityCommentItem[];
			metaCounter?: { total?: number | null }[] | null;
		};
	},
	{ input: CommunityCommentsInput }
> = gql`
	query GetCommentsByArticle($input: CommentsInquiry!) {
		getCommentsByArticle(input: $input) {
			list {
				_id
				articleId
				memberId
				parentCommentId
				commentContent
				commentLikeCount
				commentStatus
				createdAt
				memberData {
					_id
					memberNick
					memberFullName
					memberImage
					memberType
				}
				meLiked {
					memberId
					targetId
					targetType
					meLiked
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export type IncomingTravelMateJoin = TravelMateJoinItem & {
	message?: string | null;
	createdAt: import('@/libs/types/travel-mate/travel-mate-join').TravelMateJoin['createdAt'];
	memberData?: Pick<Member, '_id' | 'memberNick' | 'memberFullName' | 'memberImage'> | null;
	travelMatePostData?: Pick<
		import('@/libs/types/travel-mate/travel-mate-post').TravelMatePost,
		'_id' | 'memberId' | 'matePostTitle' | 'matePostStatus' | 'travelDate' | 'currentMembers' | 'maxMembers'
	> | null;
};
export const GET_MY_INCOMING_TRAVEL_MATE_JOIN_REQUESTS: TypedDocumentNode<
	{ getMyIncomingTravelMateJoinRequests: { list: IncomingTravelMateJoin[]; metaCounter?: { total: number }[] | null } },
	{ input: TravelMateJoinsInput }
> = gql`
	query GetMyIncomingTravelMateJoinRequests($input: TravelMateJoinsInquiry!) {
		getMyIncomingTravelMateJoinRequests(input: $input) {
			list {
				_id
				memberId
				travelMatePostId
				joinStatus
				message
				createdAt
				memberData {
					_id
					memberNick
					memberFullName
					memberImage
				}
				travelMatePostData {
					_id
					memberId
					matePostTitle
					matePostStatus
					travelDate
					currentMembers
					maxMembers
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export type SavedPackageItem = PackageListItem & Pick<TravelPackage, 'packageStatus' | 'deletedAt'>;
export const GET_SAVED_PACKAGES: TypedDocumentNode<
	{ getFavorities: { list: SavedPackageItem[]; metaCounter?: { total: number }[] | null } },
	{ input: import('@/libs/types/package/travel-package.input').OrdinaryInquiry }
> = gql`
	query GetSavedPackages($input: OrdinaryInquiry!) {
		getFavorities(input: $input) {
			list {
				_id
				packageTitle
				packageStatus
				deletedAt
				destinationCountry
				destinationCity
				packageImages
				packageDays
				packageNights
				packagePrice
				currency
				packageRating
				packageReviewCount
			}
			metaCounter {
				total
			}
		}
	}
`;

export type ConnectionMember = Pick<
	Member,
	| '_id'
	| 'memberNick'
	| 'memberFullName'
	| 'memberImage'
	| 'memberCountry'
	| 'memberCity'
	| 'memberFollowerCount'
	| 'memberFollowingCount'
>;
export type ConnectionItem = {
	_id: string;
	meFollowed?: Pick<import('@/libs/types/community/follow').MeFollowed, 'myFollowing'>[] | null;
	followerData?: ConnectionMember | null;
	followingData?: ConnectionMember | null;
};
export type ConnectionResult = { list: ConnectionItem[]; metaCounter?: { total?: number | null }[] | null };
type ConnectionInput = Pick<import('@/libs/types/community/follow.input').FollowInquiry, 'page' | 'limit' | 'search'>;
export const GET_MEMBER_FOLLOWERS: TypedDocumentNode<
	{ getMemberFollowers: ConnectionResult },
	{ input: ConnectionInput }
> = gql`
	query GetMemberFollowers($input: FollowInquiry!) {
		getMemberFollowers(input: $input) {
			list {
				_id
				meFollowed {
					myFollowing
				}
				followerData {
					_id
					memberNick
					memberFullName
					memberImage
					memberCountry
					memberCity
					memberFollowerCount
					memberFollowingCount
				}
			}
			metaCounter {
				total
			}
		}
	}
`;
export const GET_MEMBER_FOLLOWINGS: TypedDocumentNode<
	{ getMemberFollowings: ConnectionResult },
	{ input: ConnectionInput }
> = gql`
	query GetMemberFollowings($input: FollowInquiry!) {
		getMemberFollowings(input: $input) {
			list {
				_id
				meFollowed {
					myFollowing
				}
				followingData {
					_id
					memberNick
					memberFullName
					memberImage
					memberCountry
					memberCity
					memberFollowerCount
					memberFollowingCount
				}
			}
			metaCounter {
				total
			}
		}
	}
`;
export const GET_CONNECTION_COUNTS: TypedDocumentNode<
	{
		getMemberFollowers: Pick<ConnectionResult, 'metaCounter'>;
		getMemberFollowings: Pick<ConnectionResult, 'metaCounter'>;
	},
	{ followers: ConnectionInput; following: ConnectionInput }
> = gql`
	query GetConnectionCounts($followers: FollowInquiry!, $following: FollowInquiry!) {
		getMemberFollowers(input: $followers) {
			metaCounter {
				total
			}
		}
		getMemberFollowings(input: $following) {
			metaCounter {
				total
			}
		}
	}
`;

export type AgentListItem = Pick<
	Agent,
	| '_id'
	| 'companyName'
	| 'officeAddress'
	| 'agentDesc'
	| 'verificationStatus'
	| 'agentRating'
	| 'agentReviewCount'
	| 'agentPackageCount'
> & {
	memberData?: Pick<
		Member,
		'_id' | 'memberNick' | 'memberFullName' | 'memberImage' | 'memberCountry' | 'memberCity' | 'memberLanguage'
	> | null;
};
export type AgentListInput = Omit<import('@/libs/types/agent/agent.input').AgentsInquiry, 'direction'> & {
	direction?: keyof typeof Direction;
};
export const GET_AGENTS: TypedDocumentNode<
	{ getAgents: { list: AgentListItem[]; metaCounter?: { total?: number | null }[] | null } },
	{ input: AgentListInput }
> = gql`
	query GetAgents($input: AgentsInquiry!) {
		getAgents(input: $input) {
			list {
				_id
				companyName
				officeAddress
				agentDesc
				verificationStatus
				agentRating
				agentReviewCount
				agentPackageCount
				memberData {
					_id
					memberNick
					memberFullName
					memberImage
					memberCountry
					memberCity
					memberLanguage
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export type AgentDetailData = Pick<
	Agent,
	| '_id'
	| 'memberId'
	| 'companyName'
	| 'licenseNumber'
	| 'officeAddress'
	| 'companyPhone'
	| 'companyEmail'
	| 'agentDesc'
	| 'agentStatus'
	| 'verificationStatus'
	| 'agentRating'
	| 'agentReviewCount'
	| 'agentFollowerCount'
	| 'agentPackageCount'
	| 'agentBookingCount'
	| 'agentRank'
	| 'agentApprovedAt'
> & {
	memberData?: Pick<
		Member,
		| '_id'
		| 'memberNick'
		| 'memberFullName'
		| 'memberImage'
		| 'memberCountry'
		| 'memberCity'
		| 'memberLanguage'
		| 'memberDesc'
		| 'memberFollowerCount'
		| 'memberFollowingCount'
		| 'memberViewCount'
	> | null;
};
export const GET_AGENT: TypedDocumentNode<{ getAgent: AgentDetailData | null }, { agentId: string }> = gql`
	query GetAgent($agentId: String!) {
		getAgent(agentId: $agentId) {
			_id
			memberId
			companyName
			licenseNumber
			officeAddress
			companyPhone
			companyEmail
			agentDesc
			agentStatus
			verificationStatus
			agentRating
			agentReviewCount
			agentFollowerCount
			agentPackageCount
			agentBookingCount
			agentRank
			agentApprovedAt
			memberData {
				_id
				memberNick
				memberFullName
				memberImage
				memberCountry
				memberCity
				memberLanguage
				memberDesc
				memberFollowerCount
				memberFollowingCount
				memberViewCount
			}
		}
	}
`;
export const GET_MEMBER_FOLLOW_STATE: TypedDocumentNode<
	{
		getMember: Pick<Member, '_id' | 'memberFollowerCount' | 'memberFollowingCount'> & {
			meFollowed?: Pick<import('@/libs/types/community/follow').MeFollowed, 'myFollowing'>[] | null;
		};
	},
	{ memberId: string }
> = gql`
	query GetMemberFollowState($memberId: String!) {
		getMember(memberId: $memberId) {
			_id
			memberFollowerCount
			memberFollowingCount
			meFollowed {
				myFollowing
			}
		}
	}
`;

export const GET_PUBLIC_MEMBER_ARTICLES: TypedDocumentNode<
	{
		getBoardArticles: {
			list: Pick<
				import('@/libs/types/article/board-article').BoardArticle,
				'_id' | 'articleTitle' | 'articleViewCount' | 'articleLikeCount' | 'articleCommentCount'
			>[];
			metaCounter?: { total?: number | null }[] | null;
		};
	},
	{
		input: Omit<import('@/libs/types/article/board-article.input').BoardArticlesInquiry, 'direction'> & {
			direction?: keyof typeof Direction;
		};
	}
> = gql`
	query GetPublicMemberArticles($input: BoardArticlesInquiry!) {
		getBoardArticles(input: $input) {
			list {
				_id
				articleTitle
				articleViewCount
				articleLikeCount
				articleCommentCount
			}
			metaCounter {
				total
			}
		}
	}
`;

export type AgentPackagePreview = Pick<
	TravelPackage,
	| '_id'
	| 'packageImages'
	| 'packageTitle'
	| 'packageStatus'
	| 'packageBookingCount'
	| 'packageViewCount'
	| 'packageRating'
>;
export const GET_AGENT_DASHBOARD_PACKAGES: TypedDocumentNode<
	{
		getMyTravelPackages: { list: AgentPackagePreview[] };
		active: { metaCounter?: { total?: number | null }[] | null };
	},
	Record<string, never>
> = gql`
	query GetAgentDashboardPackages {
		getMyTravelPackages(input: { page: 1, limit: 3, sort: "createdAt", direction: DESC }) {
			list {
				_id
				packageImages
				packageTitle
				packageStatus
				packageBookingCount
				packageViewCount
				packageRating
			}
		}
		active: getMyTravelPackages(input: { page: 1, limit: 1, search: { packageStatus: ACTIVE } }) {
			metaCounter {
				total
			}
		}
	}
`;
export const GET_AGENT_RECENT_BOOKINGS: TypedDocumentNode<
	{
		getBookingsByAgent: {
			list: (Pick<
				Booking,
				'_id' | 'contactName' | 'peopleCount' | 'createdAt' | 'bookingStatus' | 'finalPrice' | 'currency'
			> & {
				packageData?: Pick<TravelPackage, 'packageTitle'> | null;
			})[];
		};
	},
	Record<string, never>
> = gql`
	query GetAgentRecentBookings {
		getBookingsByAgent(input: { page: 1, limit: 3, sort: "createdAt", direction: DESC }) {
			list {
				_id
				contactName
				peopleCount
				createdAt
				bookingStatus
				finalPrice
				currency
				packageData {
					packageTitle
				}
			}
		}
	}
`;

export type ManagedPackage = AgentPackagePreview &
	Pick<
		TravelPackage,
		'destinationCity' | 'destinationCountry' | 'packageDays' | 'packageNights' | 'packagePrice' | 'currency'
	>;
export type MyPackagesInput = Omit<
	import('@/libs/types/package/travel-package.input').AgentTravelPackagesInquiry,
	'direction'
> & { direction?: keyof typeof Direction };
export const GET_MY_TRAVEL_PACKAGES: TypedDocumentNode<
	{
		getMyTravelPackages: { list: ManagedPackage[]; metaCounter?: { total?: number | null }[] | null };
	},
	{ input: MyPackagesInput }
> = gql`
	query GetMyTravelPackages($input: AgentTravelPackagesInquiry!) {
		getMyTravelPackages(input: $input) {
			list {
				_id
				packageTitle
				packageImages
				packageStatus
				destinationCity
				destinationCountry
				packageDays
				packageNights
				packagePrice
				currency
				packageBookingCount
				packageViewCount
				packageRating
			}
			metaCounter {
				total
			}
		}
	}
`;

export type AgentBooking = Pick<
	Booking,
	'_id' | 'contactName' | 'contactPhone' | 'peopleCount' | 'createdAt' | 'bookingStatus' | 'finalPrice' | 'currency'
> & {
	contactEmail?: string | null;
	packageData?: Pick<TravelPackage, '_id' | 'packageTitle'> | null;
};
// GraphQL enum variables use names, unlike the numeric Direction enum in the DTO model.
export type AgentBookingsInput = Omit<BookingsInquiry, 'direction' | 'search'> & {
	direction?: keyof typeof Direction;
	search?: Pick<NonNullable<BookingsInquiry['search']>, 'bookingStatus' | 'text'>;
};
export const GET_AGENT_BOOKINGS: TypedDocumentNode<
	{ getBookingsByAgent: { list: AgentBooking[]; metaCounter?: { total: number }[] | null } },
	{ input: AgentBookingsInput }
> = gql`
	query GetAgentBookings($input: BookingsInquiry!) {
		getBookingsByAgent(input: $input) {
			list {
				_id
				contactName
				contactPhone
				contactEmail
				peopleCount
				createdAt
				bookingStatus
				finalPrice
				currency
				packageData {
					_id
					packageTitle
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_MY_AGENT_REQUEST: TypedDocumentNode<
	{ getMyAgentRequest: AgentRequest | null },
	Record<string, never>
> = gql`
	query GetMyAgentRequest {
		getMyAgentRequest {
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

export type AdminAgentRequestsInput = Omit<AgentRequestsInquiry, 'direction'> & {
	direction?: keyof typeof Direction;
};

export const GET_ALL_AGENT_REQUESTS_BY_ADMIN: TypedDocumentNode<
	{ getAllAgentRequestsByAdmin: { list: AgentRequest[]; metaCounter?: { total: number }[] | null } },
	{ input: AdminAgentRequestsInput }
> = gql`
	query GetAllAgentRequestsByAdmin($input: AgentRequestsInquiry!) {
		getAllAgentRequestsByAdmin(input: $input) {
			list {
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
			metaCounter {
				total
			}
		}
	}
`;
