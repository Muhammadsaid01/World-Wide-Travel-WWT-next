import type { Direction } from '../../enums/common.enum';
import type { Member, TotalCounter } from '../member/member';

export interface OpenChatMessage {
	_id: string;
	senderId: string;
	messageContent: string;
	memberData?: Pick<Member, '_id' | 'memberNick' | 'memberFullName' | 'memberImage' | 'memberType'>;
	createdAt: string;
	updatedAt: string;
}

export interface OpenChatMessages {
	list: OpenChatMessage[];
	metaCounter?: TotalCounter[];
}

export interface OpenChatMessagesInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
}
