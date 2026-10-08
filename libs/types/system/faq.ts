import { FaqCategory, FaqStatus } from '../../enums/system.enum';
import type { TotalCounter } from '../../types/member/member';

export interface Faq {
	_id: string;
	adminId: string;

	faqCategory: FaqCategory;
	faqStatus: FaqStatus;
	faqQuestion: string;
	faqAnswer: string;
	faqOrder: number;

	createdAt: string;
	updatedAt: string;
}

export interface Faqs {
	list: Faq[];
	metaCounter?: TotalCounter[];
}
