import {
	NotificationReferenceType,
	NotificationType,
} from '../../enums/system.enum';

import type { TotalCounter } from '../../types/member/member';

export interface Notification {
	_id: string;

	receiverId: string;
	senderId?: string;

	notificationType: NotificationType;

	notificationTitle: string;
	notificationMessage: string;

	referenceType?: NotificationReferenceType;
	referenceId?: string;

	isRead: boolean;
	readAt?: string;

	createdAt: string;
	updatedAt: string;
}

export interface Notifications {
	list: Notification[];
	metaCounter?: TotalCounter[];
}