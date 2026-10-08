import type { TotalCounter } from '../../types/member/member';
import type { Member } from '../../types/member/member';

export interface PrivateConversation {
	_id: string;

	memberOneId: string;
	memberTwoId: string;

	lastMessage?: string;
	lastMessageAt?: string;
	memberOneData?: Pick<Member, '_id' | 'memberNick' | 'memberFullName' | 'memberImage' | 'memberType'>;
	memberTwoData?: Pick<Member, '_id' | 'memberNick' | 'memberFullName' | 'memberImage' | 'memberType'>;
	unreadCount?: number;

	createdAt: string;
	updatedAt: string;
}

export interface PrivateConversations {
	list: PrivateConversation[];
	metaCounter?: TotalCounter[];
}
