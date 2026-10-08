import { FaqCategory, FaqStatus } from '@/libs/enums/system.enum';
import type { FaqInput } from '@/libs/types/system/faq.input';

export interface FaqFormValues {
	faqCategory: FaqCategory;
	faqStatus: FaqStatus;
	faqQuestion: string;
	faqAnswer: string;
	faqOrder: string;
}

export type FaqFormErrors = Partial<Record<keyof FaqFormValues, string>>;

export const EMPTY_FAQ_FORM: FaqFormValues = {
	faqCategory: FaqCategory.GENERAL,
	faqStatus: FaqStatus.DRAFT,
	faqQuestion: '',
	faqAnswer: '',
	faqOrder: '0',
};

export const FAQ_CATEGORY_OPTIONS: { value: FaqCategory; label: string }[] = [
	{ value: FaqCategory.GENERAL, label: 'General' },
	{ value: FaqCategory.ACCOUNT, label: 'Account' },
	{ value: FaqCategory.BOOKING, label: 'Booking' },
	{ value: FaqCategory.PAYMENT, label: 'Payment' },
	{ value: FaqCategory.REFUND, label: 'Refunds' },
	{ value: FaqCategory.AGENT, label: 'Agents' },
	{ value: FaqCategory.PACKAGE, label: 'Packages' },
	{ value: FaqCategory.TRAVEL_MATE, label: 'Travel Mate' },
];

export function faqCategoryLabel(category: FaqCategory): string {
	return FAQ_CATEGORY_OPTIONS.find((item) => item.value === category)?.label ?? category;
}

export function validateFaqForm(values: FaqFormValues): FaqFormErrors {
	const errors: FaqFormErrors = {};
	const questionLength = values.faqQuestion.trim().length;
	const answerLength = values.faqAnswer.trim().length;
	const order = Number(values.faqOrder);

	if (!Object.values(FaqCategory).includes(values.faqCategory)) errors.faqCategory = 'Select a valid category.';
	if (!Object.values(FaqStatus).includes(values.faqStatus)) errors.faqStatus = 'Select a valid status.';
	if (questionLength < 3 || questionLength > 300) {
		errors.faqQuestion = 'Question must be between 3 and 300 characters.';
	}
	if (answerLength < 5 || answerLength > 5000) {
		errors.faqAnswer = 'Answer must be between 5 and 5,000 characters.';
	}
	if (!Number.isInteger(order) || order < 0 || order > 100000) {
		errors.faqOrder = 'Display order must be a whole number from 0 to 100,000.';
	}

	return errors;
}

export function faqFormInput(values: FaqFormValues): FaqInput {
	return {
		faqCategory: values.faqCategory,
		faqStatus: values.faqStatus,
		faqQuestion: values.faqQuestion.trim(),
		faqAnswer: values.faqAnswer.trim(),
		faqOrder: Number(values.faqOrder),
	};
}
