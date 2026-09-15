import { CommentStatus } from '@/libs/enums/community.enum';

import type { Member, TotalCounter } from '@/libs/types/member/member';
import type { BoardArticle } from '../../types/article/board-article';
import type { MeLiked } from '../../types/community/like';

export interface CommentEntity {
	_id: string;

	articleId: string;
	memberId: string;
	parentCommentId?: string;

	commentContent: string;
	commentLikeCount: number;

	commentStatus: CommentStatus;

	commentDeletedAt?: string;

	createdAt: string;
	updatedAt: string;

	memberData?: Member;
	articleData?: BoardArticle;
	meLiked?: MeLiked[];
}

export interface Comments {
	list: CommentEntity[];
	metaCounter?: TotalCounter[];
}