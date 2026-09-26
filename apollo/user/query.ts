import type { BookingHandoff } from '@/libs/types/booking/booking';
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

export const GET_MY_BOOKING: TypedDocumentNode<{ getMyBooking: BookingHandoff }, { bookingId: string }> = gql`
	query GetMyBooking($bookingId: String!) {
		getMyBooking(bookingId: $bookingId) {
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
