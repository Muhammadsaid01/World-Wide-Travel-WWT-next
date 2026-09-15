import {
	PrivateMessageStatus,
	PrivateMessageType,
} from '../../enums/chat-ai.enum';

import { Direction } from '../../enums/common.enum';

export interface PrivateMessageInput {
	conversationId: string;

	messageType?: PrivateMessageType;
	messageContent?: string;
	messageImages?: string[];
}

interface PMSearch {
	senderId?: string;
	receiverId?: string;
	messageStatus?: PrivateMessageStatus;
}

export interface PrivateMessagesInquiry {
	page: number;
	limit: number;

	sort?: string;
	direction?: Direction;
	search?: PMSearch;
}

export interface UpdatePrivateMessageStatusInput {
	messageId: string;
	messageStatus: PrivateMessageStatus;
}