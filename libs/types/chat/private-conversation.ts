import type { TotalCounter } from '../../types/member/member';

export interface PrivateConversation {
	_id: string;

	memberOneId: string;
	memberTwoId: string;

	lastMessage?: string;
	lastMessageAt?: string;

	createdAt: string;
	updatedAt: string;
}

export interface PrivateConversations {
	list: PrivateConversation[];
	metaCounter?: TotalCounter[];
}