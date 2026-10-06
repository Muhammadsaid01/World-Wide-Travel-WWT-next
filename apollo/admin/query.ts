import { gql, type TypedDocumentNode } from '@apollo/client';
import type { Direction } from '@/libs/enums/common.enum';
import type { Agent } from '@/libs/types/agent/agent';
import type { AgentsInquiry } from '@/libs/types/agent/agent.input';
import type { BoardArticle } from '@/libs/types/article/board-article';
import type { AllBoardArticlesInquiry } from '@/libs/types/article/board-article.input';
import type { Booking } from '@/libs/types/booking/booking';
import type { BookingsInquiry } from '@/libs/types/booking/booking.input';
import type { Member } from '@/libs/types/member/member';
import type { MembersInquiry } from '@/libs/types/member/member.input';
import type { TravelPackage } from '@/libs/types/package/travel-package';
import type { AllTravelPackagesInquiry } from '@/libs/types/package/travel-package.input';

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

export type AdminRecentBooking = Pick<
	Booking,
	'_id' | 'bookingCode' | 'contactName' | 'peopleCount' | 'bookingStatus' | 'finalPrice' | 'currency' | 'createdAt'
> & {
	packageData?: Pick<TravelPackage, '_id' | 'packageTitle'> | null;
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
