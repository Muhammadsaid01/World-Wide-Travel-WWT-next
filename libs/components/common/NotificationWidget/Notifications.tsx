import type { NotificationItem } from '@/apollo/user/query';
import { Alert, Button, Skeleton, Typography } from '@mui/material';

export function formatRelativeTime(value: string) {
	const timestamp = new Date(value).getTime();
	if (Number.isNaN(timestamp)) return 'Time unavailable';
	const seconds = Math.round((timestamp - Date.now()) / 1000);
	const absolute = Math.abs(seconds);
	const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
	if (absolute < 60) return formatter.format(seconds, 'second');
	if (absolute < 3600) return formatter.format(Math.round(seconds / 60), 'minute');
	if (absolute < 86400) return formatter.format(Math.round(seconds / 3600), 'hour');
	if (absolute < 604800) return formatter.format(Math.round(seconds / 86400), 'day');
	return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(
		new Date(timestamp),
	);
}

function notificationTypeLabel(value: string) {
	return value
		.toLowerCase()
		.split('_')
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(' ');
}

interface NotificationsProps {
	items: NotificationItem[];
	total: number;
	unreadCount: number;
	loading: boolean;
	error: boolean;
	actionError: string;
	busyId: string;
	markingAll: boolean;
	onRetry: () => void;
	onRead: (notification: NotificationItem) => void;
	onMarkAll: () => void;
	onLoadMore: () => void;
}

export default function Notifications({
	items,
	total,
	unreadCount,
	loading,
	error,
	actionError,
	busyId,
	markingAll,
	onRetry,
	onRead,
	onMarkAll,
	onLoadMore,
}: NotificationsProps) {
	return (
		<section className="wwt-notification-tab" aria-label="Notifications" aria-busy={loading}>
			<div className="wwt-notification-tab-heading">
				<div>
					<Typography component="h3">Notifications</Typography>
					<Typography>{unreadCount ? `${unreadCount} unread` : 'You are all caught up'}</Typography>
				</div>
				<Button size="small" disabled={!unreadCount || markingAll} onClick={onMarkAll}>
					{markingAll ? 'Marking...' : 'Mark all as read'}
				</Button>
			</div>

			{actionError ? <Alert severity="error">{actionError}</Alert> : null}

			{loading && !items.length ? (
				<div className="wwt-notification-skeletons" aria-label="Loading notifications">
					{Array.from({ length: 4 }, (_, index) => (
						<Skeleton key={index} variant="rounded" height={78} />
					))}
				</div>
			) : error && !items.length ? (
				<div className="wwt-notification-state">
					<Typography>Notifications could not be loaded.</Typography>
					<Button size="small" variant="outlined" onClick={onRetry}>
						Retry
					</Button>
				</div>
			) : !items.length ? (
				<div className="wwt-notification-state">
					<Typography>No notifications yet.</Typography>
				</div>
			) : (
				<>
					{error ? (
						<Alert severity="warning" action={<Button onClick={onRetry}>Retry</Button>}>
							The latest notifications could not be refreshed.
						</Alert>
					) : null}
					<div className="wwt-notification-list">
						{items.map((item) => (
							<button
								key={item._id}
								type="button"
								className={`wwt-notification-item${item.isRead ? '' : ' is-unread'}`}
								disabled={busyId === item._id}
								onClick={() => onRead(item)}
							>
								<span className="wwt-notification-dot" aria-hidden="true" />
								<span className="wwt-notification-copy">
									<strong>{item.notificationTitle}</strong>
									<span>{item.notificationMessage}</span>
									<small>
										{notificationTypeLabel(item.notificationType)} · {formatRelativeTime(item.createdAt)}
									</small>
								</span>
							</button>
						))}
					</div>
					{items.length < total ? (
						<Button className="wwt-notification-load-more" disabled={loading} onClick={onLoadMore}>
							{loading ? 'Loading...' : 'Load more'}
						</Button>
					) : null}
				</>
			)}
		</section>
	);
}
