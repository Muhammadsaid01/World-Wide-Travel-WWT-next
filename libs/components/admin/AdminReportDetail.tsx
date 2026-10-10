import { UPDATE_REPORT_STATUS_BY_ADMIN } from '@/apollo/admin/mutation';
import { GET_REPORT } from '@/apollo/user/query';
import { formatScheduleDate } from '@/libs/components/package/PackageSchedules';
import { ReportStatus } from '@/libs/enums/system.enum';
import type { ReportEntity } from '@/libs/types/system/report';
import { useMutation, useQuery } from '@apollo/client';
import {
	Alert,
	Button,
	Chip,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Skeleton,
	TextField,
} from '@mui/material';
import { useRef, useState } from 'react';
import {
	isMongoId,
	reportReasonLabel,
	reportStatusClass,
	reportStatusLabel,
	reportTargetLabel,
	reportTransitions,
} from '@/libs/components/cs/reportState';

type Props = {
	open: boolean;
	reportId: string;
	onClose: () => void;
	onUpdated: (report: ReportEntity) => Promise<void> | void;
};

export default function AdminReportDetail({ open, reportId, onClose, onUpdated }: Props) {
	const valid = isMongoId(reportId);
	const lock = useRef(false);
	const [adminNote, setAdminNote] = useState('');
	const [actionError, setActionError] = useState('');
	const [feedback, setFeedback] = useState('');
	const [busyStatus, setBusyStatus] = useState<ReportStatus | null>(null);
	const { data, loading, error, refetch } = useQuery(GET_REPORT, {
		variables: { reportId },
		skip: !open || !valid,
		fetchPolicy: 'network-only',
	});
	const [updateStatus] = useMutation(UPDATE_REPORT_STATUS_BY_ADMIN);
	const report = data?.getReport;
	const transitions = report ? reportTransitions(report.reportStatus) : [];

	async function changeStatus(nextStatus: ReportStatus) {
		if (!report || lock.current || !transitions.includes(nextStatus)) return;
		const note = adminNote.trim();
		if (note.length === 1 || note.length > 1000) {
			setActionError('Admin note must be between 2 and 1,000 characters when provided.');
			return;
		}

		lock.current = true;
		setBusyStatus(nextStatus);
		setActionError('');
		setFeedback('');
		try {
			const response = await updateStatus({
				variables: {
					input: {
						reportId: report._id,
						reportStatus: nextStatus,
						...(note ? { adminNote: note } : {}),
					},
				},
			});
			const updated = response.data?.updateReportStatusByAdmin;
			if (!updated) throw new Error('The server did not confirm the status change.');
			setFeedback(`Report marked ${reportStatusLabel(updated.reportStatus).toLowerCase()}.`);
			const refreshes = await Promise.allSettled([refetch(), Promise.resolve(onUpdated(updated))]);
			if (refreshes.some((result) => result.status === 'rejected')) {
				setActionError('The status changed, but the latest report data could not be refreshed.');
			}
		} catch (failure) {
			setActionError(failure instanceof Error ? failure.message : 'The report status could not be changed.');
		} finally {
			lock.current = false;
			setBusyStatus(null);
		}
	}

	return (
		<Dialog
			open={open}
			onClose={busyStatus ? undefined : onClose}
			fullWidth
			maxWidth="md"
			aria-labelledby="admin-report-title"
		>
			<DialogTitle id="admin-report-title">Report review</DialogTitle>
			<DialogContent className="admin-report-detail-content">
				{!valid ? (
					<Alert severity="error">This report identifier is invalid.</Alert>
				) : loading ? (
					<div aria-label="Loading report">
						<Skeleton height={52} />
						<Skeleton height={220} />
						<Skeleton height={52} />
					</div>
				) : error ? (
					<Alert severity="error" action={<Button onClick={() => void refetch().catch(() => undefined)}>Retry</Button>}>
						The report could not be loaded. {error.message}
					</Alert>
				) : report ? (
					<>
						{feedback ? <Alert severity="success">{feedback}</Alert> : null}
						{actionError ? <Alert severity="error">{actionError}</Alert> : null}
						<dl className="report-detail-list admin-report-detail-list">
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
								<dt>Report ID</dt>
								<dd>
									<code>{report._id}</code>
								</dd>
							</div>
							<div>
								<dt>Reporter</dt>
								<dd>
									<code>{report.reporterId}</code>
								</dd>
							</div>
							<div>
								<dt>Target type</dt>
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
								<dt>Created</dt>
								<dd>{formatScheduleDate(report.createdAt)}</dd>
							</div>
							{report.reviewedBy ? (
								<div>
									<dt>Reviewed by</dt>
									<dd>
										<code>{report.reviewedBy}</code>
									</dd>
								</div>
							) : null}
							{report.reviewedAt ? (
								<div>
									<dt>Reviewed at</dt>
									<dd>{formatScheduleDate(report.reviewedAt)}</dd>
								</div>
							) : null}
							{report.adminNote ? (
								<div>
									<dt>Current admin note</dt>
									<dd>{report.adminNote}</dd>
								</div>
							) : null}
						</dl>
						{transitions.length ? (
							<div className="admin-report-review-actions">
								<TextField
									fullWidth
									multiline
									minRows={3}
									label="Admin note (optional)"
									value={adminNote}
									onChange={(event) => setAdminNote(event.target.value)}
									helperText={`${adminNote.length}/1000`}
									slotProps={{ htmlInput: { maxLength: 1000 } }}
								/>
								<div>
									{transitions.map((status) => (
										<Button
											key={status}
											variant={status === ReportStatus.RESOLVED ? 'contained' : 'outlined'}
											color={status === ReportStatus.REJECTED ? 'error' : 'primary'}
											disabled={Boolean(busyStatus)}
											onClick={() => void changeStatus(status)}
										>
											{busyStatus === status
												? 'Updating…'
												: status === ReportStatus.REVIEWED
													? 'Mark Reviewed'
													: reportStatusLabel(status)}
										</Button>
									))}
								</div>
							</div>
						) : (
							<Alert severity="info">This report is in a terminal state and cannot transition further.</Alert>
						)}
					</>
				) : (
					<Alert severity="info">Report details are unavailable.</Alert>
				)}
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose} disabled={Boolean(busyStatus)}>
					Close
				</Button>
			</DialogActions>
		</Dialog>
	);
}
