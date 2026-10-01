import test from 'node:test';
import assert from 'node:assert/strict';
import { BookingStatus } from '../libs/enums/booking.enum';
import { agentBookingsInput, agentBookingTransitions } from '../libs/components/mypage/agentBookingsState';

test('agent inquiries preserve pagination, sort and supported search without ownership overrides', () => {
	const input = agentBookingsInput(3, BookingStatus.PENDING, '  Alice  ', 'ASC');
	assert.deepEqual(input, {
		page: 3,
		limit: 10,
		sort: 'createdAt',
		direction: 'ASC',
		search: { bookingStatus: BookingStatus.PENDING, text: 'Alice' },
	});
	assert.equal('agentId' in input.search!, false);
	assert.equal('memberId' in input.search!, false);
});
test('cleared filters omit status and text rather than sending invalid enum values', () => {
	assert.deepEqual(agentBookingsInput(1, '', '  ', 'DESC').search, {});
});
test('agent status actions match backend transitions and never offer cancellation or reopening', () => {
	assert.deepEqual(agentBookingTransitions[BookingStatus.PENDING], [BookingStatus.CONFIRMED, BookingStatus.REJECTED]);
	assert.deepEqual(agentBookingTransitions[BookingStatus.CONFIRMED], [BookingStatus.COMPLETED]);
	for (const status of [BookingStatus.COMPLETED, BookingStatus.CANCELLED, BookingStatus.REJECTED])
		assert.deepEqual(agentBookingTransitions[status], []);
	for (const actions of Object.values(agentBookingTransitions))
		assert.equal(actions.includes(BookingStatus.CANCELLED), false);
});
