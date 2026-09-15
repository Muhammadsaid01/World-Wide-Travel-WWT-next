export interface BookingUpdate {
	adultCount?: number;
	childCount?: number;
	infantCount?: number;
	peopleCount?: number;

	totalPrice?: number;
	discountAmount?: number;
	finalPrice?: number;

	currency?: string;

	couponId?: string;

	contactName?: string;
	contactPhone?: string;
	contactEmail?: string;

	specialRequest?: string;
}