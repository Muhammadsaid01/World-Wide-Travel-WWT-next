import { AIMessageRole } from '../../enums/chat-ai.enum';
import type { TotalCounter } from '../../types/member/member';

export interface AIMessage {
	_id: string;
	conversationId: string;
	memberId: string;

	messageRole: AIMessageRole;
	messageContent: string;

	aiModel?: string;
	inputTokens?: number;
	outputTokens?: number;

	createdAt: string;
	updatedAt: string;
}

export interface AIMessages {
	list: AIMessage[];
	metaCounter?: TotalCounter[];
}