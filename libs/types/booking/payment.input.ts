import {
	PaymentMethod,
	PaymentStatus,
} from '../../enums/booking.enum';

export interface PaymentInput {
	bookingId: string;
	paymentMethod: PaymentMethod;
}

export interface UpdatePaymentStatusInput {
	paymentId: string;
	paymentStatus: PaymentStatus;
}

export interface RefundPaymentInput {
	paymentId: string;
	refundAmount: number;
	refundReason?: string;
}