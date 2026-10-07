import type { NoticeItem } from '@/apollo/user/query';
import ArrowBackOutlined from '@mui/icons-material/ArrowBackOutlined';
import PushPinOutlined from '@mui/icons-material/PushPinOutlined';
import { Alert, Button, Chip, Skeleton, Typography } from '@mui/material';
import PackageImage from '../../package/PackageImage';
import { formatScheduleDate } from '../../package/PackageSchedules';

interface NoticesProps {
	items: NoticeItem[];
	total: number;
	selected: NoticeItem | null;
	loading: boolean;
	error: boolean;
	onRetry: () => void;
	onSelect: (notice: NoticeItem) => void;
	onBack: () => void;
	onLoadMore: () => void;
}

export default function Notices({
	items,
	total,
	selected,
	loading,
	error,
	onRetry,
	onSelect,
	onBack,
	onLoadMore,
}: NoticesProps) {
	if (selected) {
		return (
			<section className="wwt-notice-detail" aria-label="Notice detail">
				<Button size="small" startIcon={<ArrowBackOutlined />} onClick={onBack}>
					Notice
				</Button>
				<div className="wwt-notice-detail-heading">
					{selected.noticePinned ? <Chip size="small" icon={<PushPinOutlined />} label="Pinned" /> : null}
					<Typography component="h3">{selected.noticeTitle}</Typography>
					<Typography>{formatScheduleDate(selected.createdAt)}</Typography>
				</div>
				{selected.noticeImages.length ? (
					<div className="wwt-notice-images">
						{selected.noticeImages.map((image, index) => (
							<div key={`${image}-${index}`} className="wwt-notice-image">
								<PackageImage path={image} alt={`${selected.noticeTitle} image ${index + 1}`} />
							</div>
						))}
					</div>
				) : null}
				<Typography className="wwt-notice-detail-content">{selected.noticeContent}</Typography>
			</section>
		);
	}

	return (
		<section className="wwt-notice-tab" aria-label="Notices" aria-busy={loading}>
			<div className="wwt-notification-tab-heading">
				<div>
					<Typography component="h3">Notices</Typography>
					<Typography>Updates from WWT</Typography>
				</div>
			</div>

			{loading && !items.length ? (
				<div className="wwt-notification-skeletons" aria-label="Loading notices">
					{Array.from({ length: 4 }, (_, index) => (
						<Skeleton key={index} variant="rounded" height={78} />
					))}
				</div>
			) : error && !items.length ? (
				<div className="wwt-notification-state">
					<Typography>Notices could not be loaded.</Typography>
					<Button size="small" variant="outlined" onClick={onRetry}>
						Retry
					</Button>
				</div>
			) : !items.length ? (
				<div className="wwt-notification-state">
					<Typography>No notices yet.</Typography>
				</div>
			) : (
				<>
					{error ? (
						<Alert severity="warning" action={<Button onClick={onRetry}>Retry</Button>}>
							The latest notices could not be refreshed.
						</Alert>
					) : null}
					<div className="wwt-notification-list">
						{items.map((notice) => (
							<button
								key={notice._id}
								type="button"
								className="wwt-notice-item"
								onClick={() => onSelect(notice)}
							>
								<span className="wwt-notice-item-heading">
									<strong>{notice.noticeTitle}</strong>
									{notice.noticePinned ? <PushPinOutlined aria-label="Pinned notice" /> : null}
								</span>
								<span>{notice.noticeContent}</span>
								<small>{formatScheduleDate(notice.createdAt)}</small>
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
