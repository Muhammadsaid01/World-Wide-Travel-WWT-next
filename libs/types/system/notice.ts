import type { TotalCounter } from '../../types/member/member';

export interface Notice {
	_id: string;
	adminId: string;

	noticeTitle: string;
	noticeContent: string;
	noticeImages: string[];

	noticeViewCount: number;
	noticePinned: boolean;

	expireAt: string;

	createdAt: string;
	updatedAt: string;
}

export interface Notices {
	list: Notice[];
	metaCounter?: TotalCounter[];
}