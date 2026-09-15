import {
	PaymentMethod,
	PaymentStatus,
} from '../../enums/booking.enum';

export interface Payment {
	_id: string;

	bookingId: string;
	memberId: string;
	agentId: string;

	paymentMethod: PaymentMethod;
	paymentStatus: PaymentStatus;

	paymentAmount: number;
	currency: string;

	transactionId?: string;
	paymentDate?: string;

	refundAmount: number;
	refundReason?: string;
	refundedAt?: string;

	paymentDeletedAt?: string;

	createdAt: string;
	updatedAt: string;
}