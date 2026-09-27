import type { Payment } from '@/libs/types/booking/payment';
import type { PaymentInput } from '@/libs/types/booking/payment.input';
import type { BookingInput, CancelBookingInput } from '@/libs/types/booking/booking.input';
import type { Booking, BookingHandoff } from '@/libs/types/booking/booking';
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

export const CREATE_PAYMENT: TypedDocumentNode<
	{
		createPayment: Pick<
			Payment,
			'_id' | 'bookingId' | 'paymentMethod' | 'paymentStatus' | 'paymentAmount' | 'currency'
		>;
	},
	{ input: PaymentInput }
> = gql`
	mutation CreatePayment($input: PaymentInput!) {
		createPayment(input: $input) {
			_id
			bookingId
			paymentMethod
			paymentStatus
			paymentAmount
			currency
		}
	}
`;

export const CANCEL_BOOKING: TypedDocumentNode<
	{
		cancelBooking: Pick<Booking, '_id' | 'bookingStatus' | 'cancelledAt'>;
	},
	{ input: CancelBookingInput }
> = gql`
	mutation CancelBooking($input: CancelBookingInput!) {
		cancelBooking(input: $input) {
			_id
			bookingStatus
			cancelledAt
		}
	}
`;

export const UPDATE_MEMBER: TypedDocumentNode<
	{ updateMember: Pick<import('@/libs/types/member/member').Member, '_id' | 'accessToken'> },
	{ input: import('@/libs/types/member/member.update').MemberUpdate }
> = gql`
	mutation UpdateMember($input: MemberUpdate!) {
		updateMember(input: $input) {
			_id
			accessToken
		}
	}
`;
export const UPLOAD_PROFILE_IMAGE: TypedDocumentNode<{ imageUploader: string }, { file: File }> = gql`
	mutation UploadProfileImage($file: Upload!) {
		imageUploader(file: $file, target: "member")
	}
`;

export const DELETE_TRAVEL_MATE_POST: TypedDocumentNode<
 { deleteTravelMatePost: { _id: string } }, { postId: string }
> = gql`
 mutation DeleteTravelMatePost($postId: String!) {
  deleteTravelMatePost(postId: $postId) { _id }
 }
`;
