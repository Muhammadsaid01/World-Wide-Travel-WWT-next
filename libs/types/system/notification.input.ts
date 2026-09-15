import { Direction } from '../../enums/common.enum';

interface NotificationSearch {
	isRead?: boolean;
}

export interface NotificationsInquiry {
	page: number;
	limit: number;

	sort?: string;
	direction?: Direction;
	search?: NotificationSearch;
}

export interface ReadNotificationInput {
	notificationId: string;
}