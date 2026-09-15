import { TravelerGender } from '../../enums/booking.enum';

export interface TravelerInput {
	bookingId: string;

	firstName: string;
	lastName: string;

	dateOfBirth: string;
	gender: TravelerGender;

	nationality: string;

	passportNumber: string;
	passportExpireDate: string;
}