import { GET_REPORT } from '@/apollo/user/query';
import { useQuery } from '@apollo/client';
import { Alert, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Skeleton } from '@mui/material';
import { formatScheduleDate } from '@/libs/components/package/PackageSchedules';
import { isMongoId, reportReasonLabel, reportStatusClass, reportStatusLabel, reportTargetLabel } from './reportState';

export default function ReportDetail({
	open,
	reportId,
	onClose,
}: {
	open: boolean;
	reportId: string;
	onClose: () => void;
}) {
	const valid = isMongoId(reportId);
	const { data, loading, error, refetch } = useQuery(GET_REPORT, {
		variables: { reportId },
		skip: !open || !valid,
		fetchPolicy: 'network-only',
	});
	const report = data?.getReport;

	return (
		<Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" aria-labelledby="report-detail-title">
			<DialogTitle id="report-detail-title">Report details</DialogTitle>
			<DialogContent className="report-detail-content">
				{!valid ? (
					<Alert severity="error">This report identifier is invalid.</Alert>
				) : loading ? (
					<div className="report-detail-loading" aria-label="Loading report details">
						{Array.from({ length: 6 }, (_, index) => (
							<Skeleton key={index} height={42} />
						))}
					</div>
				) : error ? (
					<Alert severity="error" action={<Button onClick={() => void refetch().catch(() => undefined)}>Retry</Button>}>
						The report could not be loaded. {error.message}
					</Alert>
				) : report ? (
					<dl className="report-detail-list">
						<div>
							<dt>Status</dt>
							<dd>
								<Chip
									size="small"
									className={reportStatusClass(report.reportStatus)}
									label={reportStatusLabel(report.reportStatus)}
								/>
							</dd>
						</div>
						<div>
							<dt>Target</dt>
							<dd>{reportTargetLabel(report.targetType)}</dd>
						</div>
						<div>
							<dt>Target ID</dt>
							<dd>
								<code>{report.targetId}</code>
							</dd>
						</div>
						<div>
							<dt>Reason</dt>
							<dd>{reportReasonLabel(report.reportType)}</dd>
						</div>
						<div>
							<dt>Description</dt>
							<dd>{report.reportDesc || 'No description provided.'}</dd>
						</div>
						<div>
							<dt>Submitted</dt>
							<dd>{formatScheduleDate(report.createdAt)}</dd>
						</div>
						{report.reviewedAt ? (
							<div>
								<dt>Reviewed</dt>
								<dd>{formatScheduleDate(report.reviewedAt)}</dd>
							</div>
						) : null}
						{report.adminNote ? (
							<div>
								<dt>Admin note</dt>
								<dd>{report.adminNote}</dd>
							</div>
						) : null}
						<div>
							<dt>Report ID</dt>
							<dd>
								<code>{report._id}</code>
							</dd>
						</div>
					</dl>
				) : (
					<Alert severity="info">Report details are unavailable.</Alert>
				)}
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose}>Close</Button>
			</DialogActions>
		</Dialog>
	);
}
