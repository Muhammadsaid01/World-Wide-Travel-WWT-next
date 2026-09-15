import { Direction } from '../../enums/common.enum';

export interface NoticeInput {
	noticeTitle: string;
	noticeContent: string;

	noticeImages?: string[];
	noticePinned?: boolean;
}

interface NoticeSearch {
	noticePinned?: boolean;
	text?: string;
}

export interface NoticesInquiry {
	page: number;
	limit: number;

	sort?: string;
	direction?: Direction;
	search?: NoticeSearch;
}