export interface ItineraryInput {
	packageId: string;

	dayNumber: number;

	title: string;
	description: string;
}

export interface DeleteItineraryInput {
	_id: string;
}