import { gql, type TypedDocumentNode } from '@apollo/client';
import type { Direction } from '@/libs/enums/common.enum';
import type { TravelPackage } from '@/libs/types/package/travel-package';
import type { TravelPackagesInquiry } from '@/libs/types/package/travel-package.input';

export type PackageListItem = Pick<TravelPackage,
	'_id' | 'packageTitle' | 'destinationCountry' | 'destinationCity' |
	'packageImages' | 'packageDays' | 'packageNights' | 'packagePrice' |
	'currency' | 'packageRating' | 'packageReviewCount'
>;

// GraphQL serializes enum names, not the numeric values of the shared TS enum.
export type PackageListInput = Omit<TravelPackagesInquiry, 'direction'> & {
	direction?: keyof typeof Direction;
};

export const GET_TRAVEL_PACKAGES: TypedDocumentNode<{
	getTravelPackages: {
		list: PackageListItem[];
		metaCounter?: { total?: number | null }[] | null;
	};
}, { input: PackageListInput }> = gql`
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
			metaCounter { total }
		}
	}
`;
