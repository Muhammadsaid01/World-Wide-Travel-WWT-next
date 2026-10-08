import { Direction } from '../../enums/common.enum';
import { FaqCategory, FaqStatus } from '../../enums/system.enum';

export interface FaqInput {
	faqCategory: FaqCategory;
	faqStatus?: FaqStatus;
	faqQuestion: string;
	faqAnswer: string;
	faqOrder?: number;
}

interface FaqSearch {
	faqCategory?: FaqCategory;
	faqStatus?: FaqStatus;
	text?: string;
}

export interface FaqUpdate {
	_id: string;
	faqCategory?: FaqCategory;
	faqStatus?: FaqStatus;
	faqQuestion?: string;
	faqAnswer?: string;
	faqOrder?: number;
}

export interface FaqsInquiry {
	page: number;
	limit: number;

	sort?: string;
	direction?: Direction;
	search?: FaqSearch;
}
