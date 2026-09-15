export interface TravelMatePostUpdate {
	_id: string;

	departureCountry?: string;
	departureCity?: string;

	destinationCountry?: string;
	destinationCity?: string;

	travelDate?: string;

	maxMembers?: number;

	matePostTitle?: string;
	matePostContent?: string;
}