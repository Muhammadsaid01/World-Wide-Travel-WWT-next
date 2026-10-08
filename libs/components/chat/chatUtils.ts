import type { PrivateConversation } from '@/libs/types/chat/private-conversation';
import type { Member } from '@/libs/types/member/member';

export type ChatMember = Pick<Member, '_id' | 'memberNick' | 'memberFullName' | 'memberImage' | 'memberType'>;

export function conversationMember(conversation: PrivateConversation, memberId: string): ChatMember | undefined {
	return conversation.memberOneId === memberId ? conversation.memberTwoData : conversation.memberOneData;
}

export function chatMemberName(member?: ChatMember): string {
	return member?.memberFullName || member?.memberNick || 'WWT member';
}

export function chatTime(value?: string): string {
	if (!value) return '';
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return '';
	const now = new Date();
	if (date.toDateString() === now.toDateString()) {
		return new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(date);
	}
	return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(date);
}
