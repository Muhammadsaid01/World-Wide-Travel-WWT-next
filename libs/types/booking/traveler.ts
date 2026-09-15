import { TravelerGender } from '../../enums/booking.enum';

export interface Traveler {
	_id: string;
	bookingId: string;

	firstName: string;
	lastName: string;

	dateOfBirth: string;
	gender: TravelerGender;

	nationality: string;

	passportNumber: string;
	passportExpireDate: string;

	travelerDeletedAt?: string;

	createdAt: string;
	updatedAt: string;
}