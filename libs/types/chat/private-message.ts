import {
	PrivateMessageStatus,
	PrivateMessageType,
} from '../../enums/chat-ai.enum';

import type { TotalCounter } from '../../types/member/member';

export interface PrivateMessage {
	_id: string;

	conversationId: string;
	senderId: string;
	receiverId: string;

	messageType: PrivateMessageType;

	messageContent?: string;
	messageImages: string[];

	messageStatus: PrivateMessageStatus;

	readAt?: string;

	createdAt: string;
	updatedAt: string;
}

export interface PrivateMessages {
	list: PrivateMessage[];
	metaCounter?: TotalCounter[];
}