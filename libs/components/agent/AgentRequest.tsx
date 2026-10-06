import { type FormEvent, type ReactNode, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useMutation, useQuery } from '@apollo/client';
import { Alert, Breadcrumbs, Button, CircularProgress, Paper, Skeleton, TextField, Typography } from '@mui/material';
import ArrowForwardOutlined from '@mui/icons-material/ArrowForwardOutlined';
import CheckCircleOutlineOutlined from '@mui/icons-material/CheckCircleOutlineOutlined';
import ErrorOutlineOutlined from '@mui/icons-material/ErrorOutlineOutlined';
import HourglassTopOutlined from '@mui/icons-material/HourglassTopOutlined';
import { CREATE_AGENT_REQUEST } from '@/apollo/user/mutation';
import { GET_MY_AGENT_REQUEST } from '@/apollo/user/query';
import { logout } from '@/libs/auth';
import { AgentRequestStatus } from '@/libs/enums/member.enum';
import type { AgentRequest as AgentRequestRecord } from '@/libs/types/agent-request/agent-request';
import type { AgentRequestInput } from '@/libs/types/agent-request/agent-request.input';
import { formatScheduleDate } from '../package/PackageSchedules';
import ProfileSidebar from '../mypage/ProfileSidebar';

const emptyForm: AgentRequestInput = {
	companyName: '',
	businessNumber: '',
	licenseNumber: '',
	agentDescription: '',
};

type FormErrors = Partial<Record<keyof AgentRequestInput, string>>;

function validateForm(values: AgentRequestInput): FormErrors {
	const errors: FormErrors = {};
	const companyName = values.companyName.trim();
	const agentDescription = values.agentDescription.trim();

	if (companyName.length < 2) errors.companyName = 'Company name must be at least 2 characters.';
	else if (companyName.length > 100) errors.companyName = 'Company name must be 100 characters or fewer.';
	if (!values.businessNumber.trim()) errors.businessNumber = 'Business number is required.';
	if (!values.licenseNumber.trim()) errors.licenseNumber = 'License number is required.';
	if (agentDescription.length < 10) errors.agentDescription = 'Description must be at least 10 characters.';
	else if (agentDescription.length > 1000) errors.agentDescription = 'Description must be 1,000 characters or fewer.';

	return errors;
}

function RequestDetails({ request }: { request: AgentRequestRecord }) {
	return (
		<div className="agent-request-details">
			<div className="agent-request-detail">
				<span>Company</span>
				<strong>{request.companyName}</strong>
			</div>
			<div className="agent-request-detail">
				<span>Business Number</span>
				<strong>{request.businessNumber}</strong>
			</div>
			<div className="agent-request-detail">
				<span>License Number</span>
				<strong>{request.licenseNumber}</strong>
			</div>
			<div className="agent-request-detail">
				<span>Submitted</span>
				<strong>{formatScheduleDate(request.createdAt)}</strong>
			</div>
			<div className="agent-request-detail is-description">
				<span>About the Agency</span>
				<p>{request.agentDescription}</p>
			</div>
		</div>
	);
}

function StatusCard({
	request,
	onApplyAgain,
	onSignInAgain,
}: {
	request: AgentRequestRecord;
	onApplyAgain: () => void;
	onSignInAgain: () => void;
}) {
	let icon: ReactNode;
	let eyebrow: string;
	let title: string;
	let description: string;

	if (request.requestStatus === AgentRequestStatus.APPROVED) {
		icon = <CheckCircleOutlineOutlined />;
		eyebrow = 'Application approved';
		title = 'Welcome to the WWT agent community';
		description =
			'Your account has been approved for Agent access. Sign in again to refresh your secure session and open the Agent tools.';
	} else if (request.requestStatus === AgentRequestStatus.REJECTED) {
		icon = <ErrorOutlineOutlined />;
		eyebrow = 'Application reviewed';
		title = 'Your application needs an update';
		description = 'Review the decision below, then update your information and submit a new application.';
	} else {
		icon = <HourglassTopOutlined />;
		eyebrow = 'Pending review';
		title = 'Your application is with our team';
		description = 'We are reviewing your agency information. This page will show the latest status from WWT.';
	}

	return (
		<Paper className={`agent-request-status is-${request.requestStatus.toLowerCase()}`} elevation={0}>
			<div className="agent-request-status-heading">
				<span className="agent-request-status-icon" aria-hidden="true">
					{icon}
				</span>
				<div>
					<Typography className="agent-request-eyebrow">{eyebrow}</Typography>
					<Typography component="h2">{title}</Typography>
					<Typography>{description}</Typography>
				</div>
			</div>

			{request.requestStatus === AgentRequestStatus.REJECTED && request.rejectReason?.trim() ? (
				<Alert severity="error" className="agent-request-reason">
					<strong>Review note:</strong> {request.rejectReason}
				</Alert>
			) : null}

			<RequestDetails request={request} />

			{request.requestStatus === AgentRequestStatus.APPROVED ? (
				<div className="agent-request-status-actions">
					<Button variant="contained" endIcon={<ArrowForwardOutlined />} onClick={onSignInAgain}>
						Sign In Again
					</Button>
					<Typography variant="body2">This securely refreshes the role stored in your login session.</Typography>
				</div>
			) : request.requestStatus === AgentRequestStatus.REJECTED ? (
				<div className="agent-request-status-actions">
					<Button variant="contained" onClick={onApplyAgain}>
						Apply Again
					</Button>
				</div>
			) : null}
		</Paper>
	);
}

export default function AgentRequest() {
	const router = useRouter();
	const submittingRef = useRef(false);
	const [form, setForm] = useState<AgentRequestInput>(emptyForm);
	const [formErrors, setFormErrors] = useState<FormErrors>({});
	const [submitError, setSubmitError] = useState('');
	const [refreshWarning, setRefreshWarning] = useState('');
	const [submittedRequest, setSubmittedRequest] = useState<AgentRequestRecord | null>(null);
	const [reapplying, setReapplying] = useState(false);
	const { data, loading, error, refetch } = useQuery(GET_MY_AGENT_REQUEST, {
		fetchPolicy: 'no-cache',
		notifyOnNetworkStatusChange: true,
	});
	const [createAgentRequest, { loading: submitting }] = useMutation(CREATE_AGENT_REQUEST);
	const request = submittedRequest ?? data?.getMyAgentRequest ?? null;
	const showForm = !request || (request.requestStatus === AgentRequestStatus.REJECTED && reapplying);

	function changeField(field: keyof AgentRequestInput, value: string) {
		setForm((current) => ({ ...current, [field]: value }));
		setFormErrors((current) => ({ ...current, [field]: undefined }));
		setSubmitError('');
	}

	function beginReapplication() {
		if (!request) return;
		setForm({
			companyName: request.companyName,
			businessNumber: request.businessNumber,
			licenseNumber: request.licenseNumber,
			agentDescription: request.agentDescription,
		});
		setFormErrors({});
		setSubmitError('');
		setReapplying(true);
	}

	async function submit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (submittingRef.current) return;

		const nextErrors = validateForm(form);
		setFormErrors(nextErrors);
		setSubmitError('');
		setRefreshWarning('');
		if (Object.keys(nextErrors).length > 0) return;

		const input: AgentRequestInput = {
			companyName: form.companyName.trim(),
			businessNumber: form.businessNumber.trim(),
			licenseNumber: form.licenseNumber.trim(),
			agentDescription: form.agentDescription.trim(),
		};

		submittingRef.current = true;
		try {
			const result = await createAgentRequest({ variables: { input } });
			const created = result.data?.createAgentRequest;
			if (!created) throw new Error('The server did not return the submitted application.');
			setSubmittedRequest(created);
			setReapplying(false);
			try {
				const refreshed = await refetch();
				if (refreshed.data.getMyAgentRequest?._id === created._id) setSubmittedRequest(null);
			} catch {
				setRefreshWarning(
					'Your application was submitted, but its latest status could not be refreshed. Retry when you are online.',
				);
			}
		} catch (failure) {
			setSubmitError(failure instanceof Error ? failure.message : 'Your application could not be submitted.');
		} finally {
			submittingRef.current = false;
		}
	}

	async function retryStatus() {
		setRefreshWarning('');
		try {
			const refreshed = await refetch();
			if (submittedRequest && refreshed.data.getMyAgentRequest?._id === submittedRequest._id) {
				setSubmittedRequest(null);
			}
		} catch {
			if (request) setRefreshWarning('The latest application status could not be refreshed.');
		}
	}

	function signInAgain() {
		logout();
		void router.push('/account/login');
	}

	return (
		<div className="my-bookings-page agent-request-page">
			<Breadcrumbs separator="/" className="my-bookings-breadcrumb">
				<Link href="/">Home</Link>
				<Link href="/mypage">My Profile</Link>
				<span aria-current="page">Become an Agent</span>
			</Breadcrumbs>
			<div className="my-bookings-layout">
				<ProfileSidebar active="Become an Agent" />
				<div className="agent-request-main">
					<header className="agent-request-header">
						<Typography className="agent-request-kicker">WWT Agent Network</Typography>
						<Typography component="h1">Become an Agent</Typography>
						<Typography>
							Apply to publish travel packages and manage bookings through WWT. Tell us about your registered agency and
							our team will review the application.
						</Typography>
					</header>

					{loading && !data && !submittedRequest ? (
						<div className="agent-request-loading" aria-label="Loading agent application">
							<Skeleton variant="rounded" height={120} />
							<Skeleton variant="rounded" height={360} />
						</div>
					) : error && !request ? (
						<Alert
							severity="error"
							action={
								<Button color="inherit" onClick={() => void retryStatus()}>
									Retry
								</Button>
							}
						>
							Your Agent application status could not be loaded. Please try again.
						</Alert>
					) : (
						<>
							{(refreshWarning || (error && request)) && (
								<Alert
									severity="warning"
									action={
										<Button color="inherit" onClick={() => void retryStatus()}>
											Retry
										</Button>
									}
								>
									{refreshWarning || 'The latest application status could not be refreshed.'}
								</Alert>
							)}

							{request && !showForm ? (
								<StatusCard request={request} onApplyAgain={beginReapplication} onSignInAgain={signInAgain} />
							) : (
								<Paper className="agent-request-form-card" elevation={0}>
									<div className="agent-request-form-heading">
										<div>
											<Typography className="agent-request-eyebrow">
												{reapplying ? 'New application' : 'Application details'}
											</Typography>
											<Typography component="h2">
												{reapplying ? 'Update your agency information' : 'Tell us about your agency'}
											</Typography>
										</div>
										<span>All fields are required</span>
									</div>

									{reapplying && request ? (
										<Alert severity="info">
											Submitting creates a new application. Your previous review remains unchanged.
										</Alert>
									) : null}
									{submitError && <Alert severity="error">{submitError}</Alert>}

									<form onSubmit={submit} noValidate>
										<div className="agent-request-form-grid">
											<TextField
												className="is-full"
												label="Company Name"
												value={form.companyName}
												onChange={(event) => changeField('companyName', event.target.value)}
												error={Boolean(formErrors.companyName)}
												helperText={formErrors.companyName ?? 'Use the registered company or agency name.'}
												disabled={submitting}
												required
												slotProps={{ htmlInput: { maxLength: 100 } }}
											/>
											<TextField
												label="Business Number"
												value={form.businessNumber}
												onChange={(event) => changeField('businessNumber', event.target.value)}
												error={Boolean(formErrors.businessNumber)}
												helperText={formErrors.businessNumber}
												disabled={submitting}
												required
											/>
											<TextField
												label="License Number"
												value={form.licenseNumber}
												onChange={(event) => changeField('licenseNumber', event.target.value)}
												error={Boolean(formErrors.licenseNumber)}
												helperText={formErrors.licenseNumber}
												disabled={submitting}
												required
											/>
											<TextField
												className="is-full"
												label="Agency Description"
												value={form.agentDescription}
												onChange={(event) => changeField('agentDescription', event.target.value)}
												error={Boolean(formErrors.agentDescription)}
												helperText={formErrors.agentDescription}
												disabled={submitting}
												required
												multiline
												minRows={6}
												slotProps={{ htmlInput: { maxLength: 1000 } }}
											/>
										</div>
										<div className="agent-request-description-meta">
											<span>Describe your agency, services, and travel experience.</span>
											<span>{form.agentDescription.length} / 1,000</span>
										</div>
										<div className="agent-request-actions">
											{reapplying ? (
												<Button
													type="button"
													variant="outlined"
													disabled={submitting}
													onClick={() => {
														setReapplying(false);
														setSubmitError('');
													}}
												>
													Cancel
												</Button>
											) : null}
											<Button
												type="submit"
												variant="contained"
												disabled={submitting}
												endIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <ArrowForwardOutlined />}
											>
												{submitting ? 'Submitting' : reapplying ? 'Submit New Application' : 'Submit Application'}
											</Button>
										</div>
									</form>
								</Paper>
							)}
						</>
					)}
				</div>
			</div>
		</div>
	);
}
