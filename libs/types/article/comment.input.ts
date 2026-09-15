import { Direction } from '../../enums/common.enum';
import { CommentStatus } from '../../enums/community.enum';

export interface CommentInput {
	articleId: string;
	parentCommentId?: string;
	commentContent: string;
}

interface CISearch {
	parentCommentId?: string;
	articleId?: string;
	memberId?: string;
	commentStatus?: CommentStatus;
}

export interface CommentsInquiry {
	page: number;
	limit: number;

	sort?: string;
	direction?: Direction;
	search?: CISearch;
}

export interface UpdateCommentStatusInput {
	commentId: string;
	commentStatus: CommentStatus;
}