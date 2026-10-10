import { CREATE_REPORT } from '@/apollo/user/mutation';
import { currentUserVar } from '@/apollo/store';
import { restoreUserFromToken } from '@/libs/auth';
import { ReportTargetType, ReportType } from '@/libs/enums/system.enum';
import { useMutation, useReactiveVar } from '@apollo/client';
import FlagOutlined from '@mui/icons-material/FlagOutlined';
import {
	Alert,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	MenuItem,
	TextField,
	Typography,
} from '@mui/material';
import { useRouter } from 'next/router';
import { useId, useRef, useState } from 'react';
import { isMongoId, REPORT_REASON_OPTIONS, reportTargetLabel } from './reportState';

type ReportFormProps = {
	targetId: string;
	targetType: ReportTargetType;
	targetLabel?: string;
	className?: string;
	variant?: 'text' | 'outlined' | 'contained';
	size?: 'small' | 'medium' | 'large';
};

export default function ReportForm({
	targetId,
	targetType,
	targetLabel,
	className,
	variant = 'text',
	size = 'small',
}: ReportFormProps) {
	const router = useRouter();
	const user = useReactiveVar(currentUserVar);
	const titleId = useId();
	const mutationLock = useRef(false);
	const [open, setOpen] = useState(false);
	const [reason, setReason] = useState<ReportType | ''>('');
	const [description, setDescription] = useState('');
	const [error, setError] = useState('');
	const [success, setSuccess] = useState(false);
	const [createReport, { loading }] = useMutation(CREATE_REPORT);

	const validTarget = isMongoId(targetId);
	const isSelf = targetType === ReportTargetType.MEMBER && user?._id === targetId;
	if (!validTarget || isSelf) return null;

	async function openDialog() {
		const current = currentUserVar() ?? restoreUserFromToken();
		if (!current?._id) {
			await router.push('/account/login');
			return;
		}
		setError('');
		setSuccess(false);
		setOpen(true);
	}

	function closeDialog() {
		if (loading) return;
		setOpen(false);
		setReason('');
		setDescription('');
		setError('');
		setSuccess(false);
	}

	async function submit() {
		if (mutationLock.current || loading) return;
		const trimmed = description.trim();
		if (!reason) {
			setError('Choose a reason for this report.');
			return;
		}
		if (trimmed.length === 1 || trimmed.length > 1000) {
			setError('Description must be between 2 and 1,000 characters when provided.');
			return;
		}

		mutationLock.current = true;
		setError('');
		try {
			const response = await createReport({
				variables: {
					input: {
						targetId,
						targetType,
						reportType: reason,
						...(trimmed ? { reportDesc: trimmed } : {}),
					},
				},
			});
			if (!response.data?.createReport?._id) throw new Error('The server did not confirm the report.');
			setSuccess(true);
		} catch (failure) {
			setError(failure instanceof Error ? failure.message : 'The report could not be submitted. Please retry.');
		} finally {
			mutationLock.current = false;
		}
	}

	return (
		<>
			<Button
				type="button"
				className={className}
				variant={variant}
				size={size}
				color="inherit"
				startIcon={<FlagOutlined />}
				onClick={() => void openDialog()}
			>
				Report
			</Button>
			<Dialog open={open} onClose={closeDialog} fullWidth maxWidth="sm" aria-labelledby={titleId}>
				<DialogTitle id={titleId}>Report {reportTargetLabel(targetType).toLowerCase()}</DialogTitle>
				<DialogContent className="report-dialog-content">
					{success ? (
						<Alert severity="success">Your report was submitted for review.</Alert>
					) : (
						<>
							<Typography color="text.secondary">
								Tell us why this {reportTargetLabel(targetType).toLowerCase()} should be reviewed.
							</Typography>
							<div className="report-target-summary">
								<strong>{targetLabel || reportTargetLabel(targetType)}</strong>
								<small>{targetId}</small>
							</div>
							<TextField
								select
								fullWidth
								label="Reason"
								value={reason}
								onChange={(event) => setReason(event.target.value as ReportType)}
								required
							>
								{REPORT_REASON_OPTIONS.map((option) => (
									<MenuItem key={option.value} value={option.value}>
										{option.label}
									</MenuItem>
								))}
							</TextField>
							<TextField
								fullWidth
								multiline
								minRows={4}
								label="Description (optional)"
								value={description}
								onChange={(event) => setDescription(event.target.value)}
								helperText={`${description.length}/1000`}
								slotProps={{ htmlInput: { maxLength: 1000 } }}
							/>
							{error ? <Alert severity="error">{error}</Alert> : null}
						</>
					)}
				</DialogContent>
				<DialogActions>
					{success ? (
						<Button variant="contained" onClick={closeDialog}>
							Done
						</Button>
					) : (
						<>
							<Button onClick={closeDialog} disabled={loading}>
								Cancel
							</Button>
							<Button variant="contained" onClick={() => void submit()} disabled={loading}>
								{loading ? 'Submitting…' : 'Submit Report'}
							</Button>
						</>
					)}
				</DialogActions>
			</Dialog>
		</>
	);
}
