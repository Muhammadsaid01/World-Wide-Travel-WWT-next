import { Direction } from '../../enums/common.enum';
import {
	ArticleCategory,
	ArticleStatus,
} from '../../enums/community.enum';

export interface BoardArticleInput {
	articleCategory: ArticleCategory;
	articleTitle: string;
	articleContent: string;
	articleImages?: string[];
}

interface BASearch {
	articleId?: string;
	articleCategory?: ArticleCategory;
	articleStatus?: ArticleStatus;
	memberId?: string;
	text?: string;
}

export interface BoardArticlesInquiry {
	page: number;
	limit: number;

	sort?: string;
	direction?: Direction;
	search?: BASearch;
}

export interface UpdateArticleStatusInput {
	articleId: string;
	articleStatus: ArticleStatus;
}

interface ABAISearch {
	articleStatus?: ArticleStatus;
	articleCategory?: ArticleCategory;
}

export interface AllBoardArticlesInquiry {
	page: number;
	limit: number;

	sort?: string;
	direction?: Direction;

	search: ABAISearch;
}