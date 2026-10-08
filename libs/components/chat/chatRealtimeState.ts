import type { PrivateMessage } from '../../types/chat/private-message';

export type PrivateMessageEventKind = 'incoming' | 'sent';

export interface PrivateMessageEventAction {
	appendToActiveConversation: boolean;
	markActiveConversationRead: boolean;
	refreshConversationList: boolean;
	refreshUnreadCount: boolean;
}

export function mergePrivateMessage(
	messages: PrivateMessage[],
	message: PrivateMessage,
): PrivateMessage[] {
	const existingIndex = messages.findIndex((item) => item._id === message._id);
	if (existingIndex === -1) return [...messages, message];

	const next = [...messages];
	next[existingIndex] = message;
	return next;
}

export function privateMessageEventAction(
	kind: PrivateMessageEventKind,
	message: PrivateMessage,
	currentMemberId: string,
	selectedConversationId: string,
): PrivateMessageEventAction {
	const isActiveConversation =
		Boolean(selectedConversationId) && message.conversationId === selectedConversationId;
	const isAuthorizedEvent =
		kind === 'incoming'
			? message.receiverId === currentMemberId
			: message.senderId === currentMemberId;

	if (!isAuthorizedEvent) {
		return {
			appendToActiveConversation: false,
			markActiveConversationRead: false,
			refreshConversationList: false,
			refreshUnreadCount: false,
		};
	}

	return {
		appendToActiveConversation: isActiveConversation,
		markActiveConversationRead: kind === 'incoming' && isActiveConversation,
		refreshConversationList: true,
		refreshUnreadCount: true,
	};
}
