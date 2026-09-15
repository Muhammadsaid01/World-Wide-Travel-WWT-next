import { TravelerGender } from '../../enums/booking.enum';

export interface TravelerUpdate {
	firstName?: string;
	lastName?: string;

	dateOfBirth?: string;
	gender?: TravelerGender;

	nationality?: string;

	passportNumber?: string;
	passportExpireDate?: string;
}