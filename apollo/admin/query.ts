import { gql, type TypedDocumentNode } from '@apollo/client';
import type { Direction } from '@/libs/enums/common.enum';
import type { Agent } from '@/libs/types/agent/agent';
import type { AgentsInquiry } from '@/libs/types/agent/agent.input';
import type { BoardArticle } from '@/libs/types/article/board-article';
import type { AllBoardArticlesInquiry } from '@/libs/types/article/board-article.input';
import type { Booking } from '@/libs/types/booking/booking';
import type { BookingsInquiry } from '@/libs/types/booking/booking.input';
import type { Coupon } from '@/libs/types/booking/coupon';
import type { CouponInquiry } from '@/libs/types/booking/coupon.input';
import type { CouponUsage } from '@/libs/types/booking/coupon-usage';
import type { CouponUsageInquiry } from '@/libs/types/booking/coupon-usage.input';
import type { Payment } from '@/libs/types/booking/payment';
import type { Member } from '@/libs/types/member/member';
import type { MembersInquiry } from '@/libs/types/member/member.input';
import type { TravelPackage } from '@/libs/types/package/travel-package';
import type { AllTravelPackagesInquiry } from '@/libs/types/package/travel-package.input';
import type { PackageSchedule } from '@/libs/types/package/package-schedule';
import type { Notice } from '@/libs/types/system/notice';
import type { NoticesInquiry } from '@/libs/types/system/notice.input';
import type { Faq, Faqs } from '@/libs/types/system/faq';
import type { FaqsInquiry } from '@/libs/types/system/faq.input';

type GraphQLDirection = keyof typeof Direction;
type MetaCounter = { total?: number | null };

export type AdminMembersInput = Omit<MembersInquiry, 'direction'> & {
	direction?: GraphQLDirection;
};

export type AdminAgentsInput = Omit<AgentsInquiry, 'direction'> & {
	direction?: GraphQLDirection;
};

export type AdminBookingsInput = Omit<BookingsInquiry, 'direction'> & {
	direction?: GraphQLDirection;
};

export type AdminPackagesInput = Omit<AllTravelPackagesInquiry, 'direction'> & {
	direction?: GraphQLDirection;
};

export type AdminArticlesInput = Omit<AllBoardArticlesInquiry, 'direction'> & {
	direction?: GraphQLDirection;
};

export type AdminNoticesInput = Omit<NoticesInquiry, 'direction'> & {
	direction?: GraphQLDirection;
};

export type AdminFaqsInput = Omit<FaqsInquiry, 'direction'> & {
	direction?: GraphQLDirection;
};

export type AdminFaqRow = Faq;

export type AdminCouponsInput = Omit<CouponInquiry, 'direction'> & {
	direction?: GraphQLDirection;
};

export type AdminCouponUsagesInput = Omit<CouponUsageInquiry, 'direction'> & {
	direction?: GraphQLDirection;
};

export type AdminNoticeRow = Notice;

export type AdminCouponRow = Coupon;

export type AdminCouponUsageRow = Pick<
	CouponUsage,
	'_id' | 'couponId' | 'memberId' | 'bookingId' | 'discountAmount' | 'usedAt' | 'createdAt'
> & {
	memberData?: Pick<Member, '_id' | 'memberNick' | 'memberFullName' | 'memberEmail'> | null;
	bookingData?: Pick<Booking, '_id' | 'bookingCode' | 'contactName' | 'bookingStatus'> | null;
};

export type AdminPaymentRow = Payment;

export type AdminMemberRow = Pick<
	Member,
	| '_id'
	| 'memberType'
	| 'memberStatus'
	| 'memberAuthType'
	| 'memberNick'
	| 'memberFullName'
	| 'memberPhone'
	| 'memberEmail'
	| 'memberImage'
	| 'memberCountry'
	| 'memberCity'
	| 'memberLanguage'
	| 'memberOnline'
	| 'createdAt'
>;

export type AdminAgentRow = Pick<
	Agent,
	| '_id'
	| 'memberId'
	| 'companyName'
	| 'businessNumber'
	| 'licenseNumber'
	| 'officeAddress'
	| 'companyPhone'
	| 'companyEmail'
	| 'agentDesc'
	| 'agentStatus'
	| 'verificationStatus'
	| 'agentApprovedAt'
	| 'createdAt'
> & {
	memberData?: Pick<Member, 'memberNick' | 'memberFullName' | 'memberImage' | 'memberCountry' | 'memberCity'> | null;
};

export type AdminRecentBooking = Pick<
	Booking,
	'_id' | 'bookingCode' | 'contactName' | 'peopleCount' | 'bookingStatus' | 'finalPrice' | 'currency' | 'createdAt'
> & {
	packageData?: Pick<TravelPackage, '_id' | 'packageTitle'> | null;
};

export type AdminBookingRow = Pick<
	Booking,
	| '_id'
	| 'bookingCode'
	| 'memberId'
	| 'packageId'
	| 'scheduleId'
	| 'agentId'
	| 'bookingStatus'
	| 'adultCount'
	| 'childCount'
	| 'infantCount'
	| 'peopleCount'
	| 'totalPrice'
	| 'discountAmount'
	| 'finalPrice'
	| 'currency'
	| 'contactName'
	| 'contactPhone'
	| 'contactEmail'
	| 'specialRequest'
	| 'cancelledAt'
	| 'createdAt'
	| 'updatedAt'
> & {
	packageData?: Pick<TravelPackage, '_id' | 'packageTitle' | 'destinationCountry' | 'destinationCity'> | null;
	scheduleData?: Pick<PackageSchedule, '_id' | 'startDate' | 'endDate' | 'scheduleStatus'> | null;
	agentData?: Pick<Agent, '_id' | 'companyName'> | null;
};

export type AdminRecentPackage = Pick<
	TravelPackage,
	| '_id'
	| 'packageTitle'
	| 'destinationCountry'
	| 'destinationCity'
	| 'packageStatus'
	| 'packagePrice'
	| 'currency'
	| 'createdAt'
> & {
	agentData?: Pick<Agent, 'companyName'> | null;
};

export type AdminPackageRow = Pick<
	TravelPackage,
	| '_id'
	| 'agentId'
	| 'packageTitle'
	| 'packageShortDesc'
	| 'packageType'
	| 'packageCategory'
	| 'destinationCountry'
	| 'destinationCity'
	| 'packageDays'
	| 'packageNights'
	| 'packagePrice'
	| 'currency'
	| 'packageStatus'
	| 'packageImages'
	| 'createdAt'
	| 'updatedAt'
> & {
	agentData?: Pick<Agent, '_id' | 'memberId' | 'companyName'> | null;
};

export type AdminRecentArticle = Pick<
	BoardArticle,
	| '_id'
	| 'articleTitle'
	| 'articleCategory'
	| 'articleStatus'
	| 'articleViewCount'
	| 'articleCommentCount'
	| 'createdAt'
> & {
	memberData?: Pick<Member, '_id' | 'memberNick' | 'memberFullName'> | null;
};

export type AdminArticleRow = Pick<
	BoardArticle,
	| '_id'
	| 'memberId'
	| 'articleTitle'
	| 'articleContent'
	| 'articleCategory'
	| 'articleStatus'
	| 'articleViewCount'
	| 'articleLikeCount'
	| 'articleCommentCount'
	| 'articleDeletedAt'
	| 'createdAt'
	| 'updatedAt'
> & {
	memberData?: Pick<Member, '_id' | 'memberNick' | 'memberFullName' | 'memberImage' | 'memberType'> | null;
};

export const GET_ADMIN_MEMBER_COUNT: TypedDocumentNode<
	{ getAllMembersByAdmin: { metaCounter?: MetaCounter[] | null } },
	{ input: AdminMembersInput }
> = gql`
	query GetAdminMemberCount($input: MembersInquiry!) {
		getAllMembersByAdmin(input: $input) {
			metaCounter {
				total
			}
		}
	}
`;

export const GET_ADMIN_MEMBERS: TypedDocumentNode<
	{
		getAllMembersByAdmin: {
			list: AdminMemberRow[];
			metaCounter?: MetaCounter[] | null;
		};
	},
	{ input: AdminMembersInput }
> = gql`
	query GetAdminMembers($input: MembersInquiry!) {
		getAllMembersByAdmin(input: $input) {
			list {
				_id
				memberType
				memberStatus
				memberAuthType
				memberNick
				memberFullName
				memberPhone
				memberEmail
				memberImage
				memberCountry
				memberCity
				memberLanguage
				memberOnline
				createdAt
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_ADMIN_AGENT_COUNT: TypedDocumentNode<
	{ getAllAgentsByAdmin: { metaCounter?: MetaCounter[] | null } },
	{ input: AdminAgentsInput }
> = gql`
	query GetAdminAgentCount($input: AgentsInquiry!) {
		getAllAgentsByAdmin(input: $input) {
			metaCounter {
				total
			}
		}
	}
`;

export const GET_ADMIN_AGENTS: TypedDocumentNode<
	{
		getAllAgentsByAdmin: {
			list: AdminAgentRow[];
			metaCounter?: MetaCounter[] | null;
		};
	},
	{ input: AdminAgentsInput }
> = gql`
	query GetAdminAgents($input: AgentsInquiry!) {
		getAllAgentsByAdmin(input: $input) {
			list {
				_id
				memberId
				companyName
				businessNumber
				licenseNumber
				officeAddress
				companyPhone
				companyEmail
				agentDesc
				agentStatus
				verificationStatus
				agentApprovedAt
				createdAt
				memberData {
					memberNick
					memberFullName
					memberImage
					memberCountry
					memberCity
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_ADMIN_PACKAGES: TypedDocumentNode<
	{
		getAllTravelPackagesByAdmin: {
			list: AdminPackageRow[];
			metaCounter?: MetaCounter[] | null;
		};
	},
	{ input: AdminPackagesInput }
> = gql`
	query GetAdminPackages($input: AllTravelPackagesInquiry!) {
		getAllTravelPackagesByAdmin(input: $input) {
			list {
				_id
				agentId
				packageTitle
				packageShortDesc
				packageType
				packageCategory
				destinationCountry
				destinationCity
				packageDays
				packageNights
				packagePrice
				currency
				packageStatus
				packageImages
				createdAt
				updatedAt
				agentData {
					_id
					memberId
					companyName
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_ADMIN_ARTICLES: TypedDocumentNode<
	{
		getAllBoardArticlesByAdmin: {
			list: AdminArticleRow[];
			metaCounter?: MetaCounter[] | null;
		};
	},
	{ input: AdminArticlesInput }
> = gql`
	query GetAdminArticles($input: AllBoardArticlesInquiry!) {
		getAllBoardArticlesByAdmin(input: $input) {
			list {
				_id
				memberId
				articleTitle
				articleContent
				articleCategory
				articleStatus
				articleViewCount
				articleLikeCount
				articleCommentCount
				articleDeletedAt
				createdAt
				updatedAt
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

export const GET_ADMIN_NOTICES: TypedDocumentNode<
	{
		getNotices: {
			list: AdminNoticeRow[];
			metaCounter?: MetaCounter[] | null;
		};
	},
	{ input: AdminNoticesInput }
> = gql`
	query GetAdminNotices($input: NoticesInquiry!) {
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

export const GET_ADMIN_COUPONS: TypedDocumentNode<
	{
		getAllCoupons: {
			list: AdminCouponRow[];
			metaCounter?: MetaCounter[] | null;
		};
	},
	{ input: AdminCouponsInput }
> = gql`
	query GetAdminCoupons($input: CouponInquiry!) {
		getAllCoupons(input: $input) {
			list {
				_id
				couponCode
				couponTitle
				couponDesc
				couponType
				couponValue
				minAmount
				maxDiscount
				usageLimit
				usedCount
				perUserLimit
				validFrom
				validUntil
				couponStatus
				createdAt
				updatedAt
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_ADMIN_COUPON_USAGES: TypedDocumentNode<
	{
		getCouponUsages: {
			list: AdminCouponUsageRow[];
			metaCounter?: MetaCounter[] | null;
		};
	},
	{ couponId: string; input: AdminCouponUsagesInput }
> = gql`
	query GetAdminCouponUsages($couponId: String!, $input: CouponUsageInquiry!) {
		getCouponUsages(couponId: $couponId, input: $input) {
			list {
				_id
				couponId
				memberId
				bookingId
				discountAmount
				usedAt
				createdAt
				memberData {
					_id
					memberNick
					memberFullName
					memberEmail
				}
				bookingData {
					_id
					bookingCode
					contactName
					bookingStatus
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_ADMIN_PAYMENTS: TypedDocumentNode<
	{ getAllPaymentsByAdmin: AdminPaymentRow[] },
	Record<string, never>
> = gql`
	query GetAdminPayments {
		getAllPaymentsByAdmin {
			_id
			bookingId
			memberId
			agentId
			paymentMethod
			paymentStatus
			paymentAmount
			currency
			transactionId
			paymentDate
			refundAmount
			refundReason
			refundedAt
			paymentDeletedAt
			createdAt
			updatedAt
		}
	}
`;

export const GET_ADMIN_BOOKINGS: TypedDocumentNode<
	{
		getAllBookingsByAdmin: {
			list: AdminBookingRow[];
			metaCounter?: MetaCounter[] | null;
		};
	},
	{ input: AdminBookingsInput }
> = gql`
	query GetAdminBookings($input: BookingsInquiry!) {
		getAllBookingsByAdmin(input: $input) {
			list {
				_id
				bookingCode
				memberId
				packageId
				scheduleId
				agentId
				bookingStatus
				adultCount
				childCount
				infantCount
				peopleCount
				totalPrice
				discountAmount
				finalPrice
				currency
				contactName
				contactPhone
				contactEmail
				specialRequest
				cancelledAt
				createdAt
				updatedAt
				packageData {
					_id
					packageTitle
					destinationCountry
					destinationCity
				}
				scheduleData {
					_id
					startDate
					endDate
					scheduleStatus
				}
				agentData {
					_id
					companyName
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_ADMIN_DASHBOARD_BOOKINGS: TypedDocumentNode<
	{
		getAllBookingsByAdmin: {
			list: AdminRecentBooking[];
			metaCounter?: MetaCounter[] | null;
		};
	},
	{ input: AdminBookingsInput }
> = gql`
	query GetAdminDashboardBookings($input: BookingsInquiry!) {
		getAllBookingsByAdmin(input: $input) {
			list {
				_id
				bookingCode
				contactName
				peopleCount
				bookingStatus
				finalPrice
				currency
				createdAt
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

export const GET_ADMIN_DASHBOARD_PACKAGES: TypedDocumentNode<
	{
		getAllTravelPackagesByAdmin: {
			list: AdminRecentPackage[];
			metaCounter?: MetaCounter[] | null;
		};
	},
	{ input: AdminPackagesInput }
> = gql`
	query GetAdminDashboardPackages($input: AllTravelPackagesInquiry!) {
		getAllTravelPackagesByAdmin(input: $input) {
			list {
				_id
				packageTitle
				destinationCountry
				destinationCity
				packageStatus
				packagePrice
				currency
				createdAt
				agentData {
					companyName
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_ADMIN_DASHBOARD_ARTICLES: TypedDocumentNode<
	{
		getAllBoardArticlesByAdmin: {
			list: AdminRecentArticle[];
			metaCounter?: MetaCounter[] | null;
		};
	},
	{ input: AdminArticlesInput }
> = gql`
	query GetAdminDashboardArticles($input: AllBoardArticlesInquiry!) {
		getAllBoardArticlesByAdmin(input: $input) {
			list {
				_id
				articleTitle
				articleCategory
				articleStatus
				articleViewCount
				articleCommentCount
				createdAt
				memberData {
					_id
					memberNick
					memberFullName
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_ADMIN_FAQS: TypedDocumentNode<{ getAllFaqsByAdmin: Faqs }, { input: AdminFaqsInput }> = gql`
	query GetAdminFaqs($input: FaqsInquiry!) {
		getAllFaqsByAdmin(input: $input) {
			list {
				_id
				adminId
				faqCategory
				faqStatus
				faqQuestion
				faqAnswer
				faqOrder
				createdAt
				updatedAt
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_ADMIN_FAQ: TypedDocumentNode<{ getFaqByAdmin: Faq }, { faqId: string }> = gql`
	query GetAdminFaq($faqId: String!) {
		getFaqByAdmin(faqId: $faqId) {
			_id
			adminId
			faqCategory
			faqStatus
			faqQuestion
			faqAnswer
			faqOrder
			createdAt
			updatedAt
		}
	}
`;
