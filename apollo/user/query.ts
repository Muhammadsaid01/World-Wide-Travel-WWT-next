import type { Traveler } from '@/libs/types/booking/traveler';
import type { BookingsInquiry } from '@/libs/types/booking/booking.input';
import type { Payment } from '@/libs/types/booking/payment';
import type { Booking, BookingHandoff } from '@/libs/types/booking/booking';
import { gql, type TypedDocumentNode } from '@apollo/client';
import type { Direction } from '@/libs/enums/common.enum';
import type { TravelPackage } from '@/libs/types/package/travel-package';
import type { TravelPackagesInquiry } from '@/libs/types/package/travel-package.input';
import type { Agent } from '@/libs/types/agent/agent';
import type { Member } from '@/libs/types/member/member';
import type { Itinerary } from '@/libs/types/package/itinerary';
import type { PackageInclude } from '@/libs/types/package/package-include';
import type { PackageExclude } from '@/libs/types/package/package-exclude';
import type { PackageTag } from '@/libs/types/package/package-tag';
import type { PackagePolicy } from '@/libs/types/package/package-policy';
import type { Review } from '@/libs/types/community/review';
import type { ReviewsInquiry } from '@/libs/types/community/review.input';
import type { PackageSchedule } from '@/libs/types/package/package-schedule';
import type { CouponValidation } from '@/libs/types/booking/coupon';
import type { ValidateCouponInput } from '@/libs/types/booking/coupon.input';

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
	Pick<TravelPackage, 'packageDesc' | 'packageCategory' | 'minPeople' | 'maxPeople'> & {
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
				destinationCountry
				destinationCity
				packageImages
				packageDays
				packageNights
				packagePrice
				minPeople
				maxPeople
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
	| 'memberImage'
	| 'memberDesc'
	| 'memberCity'
	| 'memberCountry'
	| 'memberFollowerCount'
	| 'memberFollowingCount'
>;
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
			memberImage
			memberDesc
			memberCity
			memberCountry
			memberFollowerCount
			memberFollowingCount
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
 '_id' | 'memberId' | 'matePostTitle' | 'matePostStatus' | 'destinationCity' | 'destinationCountry' | 'travelDate' | 'currentMembers' | 'maxMembers'
>;
export type MyTravelMatesInput = Omit<import('@/libs/types/travel-mate/travel-mate-post.input').TravelMatePostsInquiry, 'direction'> & { direction?: keyof typeof Direction };
export const GET_MY_TRAVEL_MATES: TypedDocumentNode<
 { getMyTravelMatePosts: { list: MyTravelMateItem[]; metaCounter?: { total: number }[] | null } },
 { input: MyTravelMatesInput }
> = gql`
 query GetMyTravelMates($input: TravelMatePostsInquiry!) {
  getMyTravelMatePosts(input: $input) {
   list { _id memberId matePostTitle matePostStatus destinationCity destinationCountry travelDate currentMembers maxMembers }
   metaCounter { total }
  }
 }
`;
