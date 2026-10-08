import assert from 'node:assert/strict';
import test from 'node:test';

import {
	mergePrivateMessage,
	privateMessageEventAction,
} from '../libs/components/chat/chatRealtimeState';
import { PrivateMessageStatus, PrivateMessageType } from '../libs/enums/chat-ai.enum';
import { isAuthenticatedSocketReady } from '../libs/hooks/socketState';
import type { PrivateMessage } from '../libs/types/chat/private-message';

function message(overrides: Partial<PrivateMessage> = {}): PrivateMessage {
	return {
		_id: 'message-1',
		conversationId: 'conversation-a',
		senderId: 'member-a',
		receiverId: 'member-b',
		messageType: PrivateMessageType.TEXT,
		messageContent: 'Hello',
		messageImages: [],
		messageStatus: PrivateMessageStatus.SENT,
		createdAt: '2026-10-08T00:00:00.000Z',
		updatedAt: '2026-10-08T00:00:00.000Z',
		...overrides,
	};
}

test('the socket becomes usable only after the authenticated server acknowledgement', () => {
	assert.equal(isAuthenticatedSocketReady({ event: 'connected' }), true);
	assert.equal(isAuthenticatedSocketReady({ event: 'conversationJoined' }), false);
	assert.equal(isAuthenticatedSocketReady({ event: 'newMessage' }), false);
});

test('incoming messages append immediately in the active conversation and are marked read', () => {
	assert.deepEqual(
		privateMessageEventAction('incoming', message(), 'member-b', 'conversation-a'),
		{
			appendToActiveConversation: true,
			markActiveConversationRead: true,
			refreshConversationList: true,
			refreshUnreadCount: true,
		},
	);
});

test('conversation switching keeps an incoming message out of the inactive message list', () => {
	assert.deepEqual(
		privateMessageEventAction('incoming', message(), 'member-b', 'conversation-b'),
		{
			appendToActiveConversation: false,
			markActiveConversationRead: false,
			refreshConversationList: true,
			refreshUnreadCount: true,
		},
	);
});

test('events addressed to another member are ignored', () => {
	assert.equal(
		privateMessageEventAction('incoming', message(), 'member-c', 'conversation-a')
			.refreshConversationList,
		false,
	);
});

test('server-authoritative message IDs prevent duplicate realtime messages', () => {
	const original = message();
	const updated = message({ messageStatus: PrivateMessageStatus.READ });
	const merged = mergePrivateMessage([original], updated);

	assert.equal(merged.length, 1);
	assert.equal(merged[0].messageStatus, PrivateMessageStatus.READ);
});

test('sender confirmations update the active conversation without changing sender unread state', () => {
	const action = privateMessageEventAction('sent', message(), 'member-a', 'conversation-a');
	assert.equal(action.appendToActiveConversation, true);
	assert.equal(action.markActiveConversationRead, false);
	assert.equal(action.refreshUnreadCount, true);
});
