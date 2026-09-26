import type { BookingInput } from '@/libs/types/booking/booking.input';
import type { BookingHandoff } from '@/libs/types/booking/booking';
import { gql, type TypedDocumentNode } from '@apollo/client';

export const LOGIN = gql`
	mutation Login($input: LoginInput!) {
		login(input: $input) {
			_id
			memberType
			memberStatus
			memberAuthType
			memberNick
			memberFullName
			memberPhone
			memberEmail
			memberImage
			memberAddress
			memberCountry
			memberCity
			memberDesc
			memberBirthDate
			memberLanguage
			memberPoint
			memberRank
			accessToken
		}
	}
`;

export const SIGN_UP = gql`
	mutation Signup($input: MemberInput!) {
		signup(input: $input) {
			_id
			memberType
			memberStatus
			memberAuthType
			memberNick
			memberFullName
			memberPhone
			memberEmail
			memberImage
			memberAddress
			memberCountry
			memberCity
			memberDesc
			memberBirthDate
			memberLanguage
			memberPoint
			memberRank
			accessToken
		}
	}
`;

export const CREATE_BOOKING: TypedDocumentNode<{ createBooking: BookingHandoff }, { input: BookingInput }> = gql`
	mutation CreateBooking($input: BookingInput!) {
		createBooking(input: $input) {
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
