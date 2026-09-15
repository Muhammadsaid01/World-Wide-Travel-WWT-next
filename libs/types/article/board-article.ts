import {
	ArticleCategory,
	ArticleStatus,
} from '../../enums/community.enum';

import type { MeLiked } from '../../types/community/like';
import type { Member, TotalCounter } from '../../types/member/member';

export interface BoardArticle {
	_id: string;
	memberId: string;

	articleCategory: ArticleCategory;
	articleTitle: string;
	articleContent: string;
	articleImages: string[];

	articleStatus: ArticleStatus;

	articleViewCount: number;
	articleLikeCount: number;
	articleCommentCount: number;

	articleDeletedAt?: string;

	createdAt: string;
	updatedAt: string;

	/** From aggregation */
	meLiked?: MeLiked[];
	memberData?: Member;
}

export interface BoardArticles {
	list: BoardArticle[];
	metaCounter?: TotalCounter[];
}