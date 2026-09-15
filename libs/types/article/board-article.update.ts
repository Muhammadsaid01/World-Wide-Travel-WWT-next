import {
	ArticleCategory,
	ArticleStatus,
} from '../../enums/community.enum';

export interface BoardArticleUpdate {
	_id: string;

	articleCategory?: ArticleCategory;
	articleTitle?: string;
	articleContent?: string;
	articleImages?: string[];

	articleStatus?: ArticleStatus;
}