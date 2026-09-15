import { Direction } from '../../enums/common.enum';
import { FaqCategory } from '../../enums/system.enum';

export interface FaqInput {
	faqCategory: FaqCategory;
	faqQuestion: string;
	faqAnswer: string;
	faqOrder?: number;
}

interface FaqSearch {
	faqCategory?: FaqCategory;
	text?: string;
}

export interface FaqsInquiry {
	page: number;
	limit: number;

	sort?: string;
	direction?: Direction;
	search?: FaqSearch;
}