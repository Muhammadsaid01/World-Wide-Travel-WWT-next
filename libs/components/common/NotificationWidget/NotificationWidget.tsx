import { useRef, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { Button, Popover, Tab, Tabs, Typography } from '@mui/material';
import Link from 'next/link';
import { READ_ALL_NOTIFICATIONS, READ_NOTIFICATION } from '@/apollo/user/mutation';
import {
	GET_MY_NOTIFICATIONS,
	GET_NOTICES,
	type NoticeItem,
	type NoticeQueryInput,
	type NotificationItem,
	type NotificationQueryInput,
} from '@/apollo/user/query';
import Notices from './Notices';
import Notifications from './Notifications';

const BATCH_SIZE = 8;
type WidgetTab = 'notifications' | 'notices';

interface NotificationWidgetProps {
	anchorEl: HTMLElement | null;
	authenticated: boolean;
	unreadCount: number;
	onClose: () => void;
	onUnreadChange: () => Promise<unknown>;
}

export default function NotificationWidget({
	anchorEl,
	authenticated,
	unreadCount,
	onClose,
	onUnreadChange,
}: NotificationWidgetProps) {
	const open = Boolean(anchorEl);
	const readLock = useRef(new Set<string>());
	const markAllLock = useRef(false);
	const [tab, setTab] = useState<WidgetTab>('notifications');
	const [notificationLimit, setNotificationLimit] = useState(BATCH_SIZE);
	const [noticeLimit, setNoticeLimit] = useState(BATCH_SIZE);
	const [selectedNotice, setSelectedNotice] = useState<NoticeItem | null>(null);
	const [busyId, setBusyId] = useState('');
	const [markingAll, setMarkingAll] = useState(false);
	const [actionError, setActionError] = useState('');

	const notificationVariables: { input: NotificationQueryInput } = {
		input: {
			page: 1,
			limit: notificationLimit,
			sort: 'createdAt',
			direction: 'DESC',
		},
	};
	const noticeVariables: { input: NoticeQueryInput } = {
		input: {
			page: 1,
			limit: noticeLimit,
			sort: 'createdAt',
			direction: 'DESC',
		},
	};

	const notificationsQuery = useQuery(GET_MY_NOTIFICATIONS, {
		variables: notificationVariables,
		skip: !open || !authenticated,
		fetchPolicy: 'no-cache',
		notifyOnNetworkStatusChange: true,
	});
	const noticesQuery = useQuery(GET_NOTICES, {
		variables: noticeVariables,
		skip: !open,
		fetchPolicy: 'no-cache',
		notifyOnNetworkStatusChange: true,
	});
	const [readNotification] = useMutation(READ_NOTIFICATION);
	const [readAllNotifications] = useMutation(READ_ALL_NOTIFICATIONS);

	const notificationResult = notificationsQuery.data?.getMyNotifications;
	const notifications = notificationResult?.list ?? [];
	const notificationTotal = notificationResult?.metaCounter?.[0]?.total ?? 0;
	const noticeResult = noticesQuery.data?.getNotices;
	const notices = noticeResult?.list ?? [];
	const noticeTotal = noticeResult?.metaCounter?.[0]?.total ?? 0;

	async function synchronizeNotifications() {
		await Promise.all([notificationsQuery.refetch(), onUnreadChange()]);
	}

	async function markOneRead(notification: NotificationItem) {
		if (notification.isRead || readLock.current.has(notification._id)) return;
		readLock.current.add(notification._id);
		setBusyId(notification._id);
		setActionError('');
		try {
			const response = await readNotification({ variables: { input: { notificationId: notification._id } } });
			if (!response.data?.readNotification.isRead) throw new Error('The server did not confirm the read state.');
			await synchronizeNotifications();
		} catch (failure) {
			setActionError(failure instanceof Error ? failure.message : 'The notification could not be marked as read.');
		} finally {
			readLock.current.delete(notification._id);
			setBusyId('');
		}
	}

	async function markAllRead() {
		if (!unreadCount || markAllLock.current) return;
		markAllLock.current = true;
		setMarkingAll(true);
		setActionError('');
		try {
			const response = await readAllNotifications();
			if (!response.data?.readAllNotifications) throw new Error('The server did not confirm the bulk read action.');
			await synchronizeNotifications();
		} catch (failure) {
			setActionError(failure instanceof Error ? failure.message : 'Notifications could not be marked as read.');
		} finally {
			markAllLock.current = false;
			setMarkingAll(false);
		}
	}

	return (
		<Popover
			id="wwt-notification-panel"
			open={open}
			anchorEl={anchorEl}
			onClose={onClose}
			anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
			transformOrigin={{ vertical: 'top', horizontal: 'right' }}
			slotProps={{ paper: { className: 'wwt-notification-panel' } }}
		>
			<Tabs
				value={tab}
				onChange={(_, value: WidgetTab) => {
					setTab(value);
					if (value === 'notifications') setSelectedNotice(null);
				}}
				variant="fullWidth"
				aria-label="Notification and Notice tabs"
				className="wwt-notification-tabs"
			>
				<Tab value="notifications" label="Notification" />
				<Tab value="notices" label="Notice" />
			</Tabs>
			<div className="wwt-notification-panel-content">
				{tab === 'notifications' && !authenticated ? (
					<section className="wwt-notification-tab" aria-label="Notifications">
						<div className="wwt-notification-state">
							<Typography>Log in to view your notifications.</Typography>
							<Button component={Link} href="/account/login" variant="outlined" size="small" onClick={onClose}>
								Login
							</Button>
						</div>
					</section>
				) : tab === 'notifications' ? (
					<Notifications
						items={notifications}
						total={notificationTotal}
						unreadCount={unreadCount}
						loading={notificationsQuery.loading}
						error={Boolean(notificationsQuery.error)}
						actionError={actionError}
						busyId={busyId}
						markingAll={markingAll}
						onRetry={() => void notificationsQuery.refetch()}
						onRead={(notification) => void markOneRead(notification)}
						onMarkAll={() => void markAllRead()}
						onLoadMore={() => setNotificationLimit((limit) => limit + BATCH_SIZE)}
					/>
				) : (
					<Notices
						items={notices}
						total={noticeTotal}
						selected={selectedNotice}
						loading={noticesQuery.loading}
						error={Boolean(noticesQuery.error)}
						onRetry={() => void noticesQuery.refetch()}
						onSelect={setSelectedNotice}
						onBack={() => setSelectedNotice(null)}
						onLoadMore={() => setNoticeLimit((limit) => limit + BATCH_SIZE)}
					/>
				)}
			</div>
		</Popover>
	);
}
