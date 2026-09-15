import { Direction } from '../../enums/common.enum';

export interface PrivateConversationInput {
	memberTwoId: string;
}

interface PCSearch {
	memberOneId?: string;
	memberTwoId?: string;
}

export interface PrivateConversationsInquiry {
	page: number;
	limit: number;

	sort?: string;
	direction?: Direction;
	search?: PCSearch;
}