import { useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import {
	Alert,
	Breadcrumbs,
	Button,
	Chip,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	MenuItem,
	Paper,
	Skeleton,
	Switch,
	TextField,
	Typography,
} from '@mui/material';
import { currentUserVar } from '@/apollo/store';
import { GET_MY_PROFILE, type ProfileMember } from '@/apollo/user/query';
import { DELETE_MEMBER, UPDATE_MEMBER } from '@/apollo/user/mutation';
import { logout, restoreUserFromToken, setJwtToken } from '@/libs/auth';
import { MemberLanguage, MemberStatus } from '@/libs/enums/member.enum';
import ProfileSidebar from './ProfileSidebar';

type UnsupportedSection = 'security' | 'notifications' | 'preferences' | 'privacy';
type SettingsForm = Pick<ProfileMember, 'memberLanguage'> & { memberEmail: string };
const messages: Record<UnsupportedSection, string> = {
	security: 'Password change is not available yet.',
	notifications: 'Notification settings are not available yet.',
	preferences: 'Timezone settings are not available yet.',
	privacy: 'Privacy settings are not available yet.',
};
const notifications = [
	{
		label: 'Booking Updates',
		description: 'Receive alerts about your upcoming trips and itinerary changes.',
		checked: true,
	},
	{ label: 'Travel Mate Requests', description: 'Get notified when someone wants to connect with you.', checked: true },
	{ label: 'Article Activity', description: 'Updates when someone comments or likes your travel logs.', checked: true },
	{ label: 'Marketing & Offers', description: 'Promotions, exclusive deals, and travel inspiration.', checked: false },
];
function formValues(member: ProfileMember): SettingsForm {
	return { memberEmail: member.memberEmail ?? '', memberLanguage: member.memberLanguage };
}
function SettingsCard({
	title,
	children,
	alert,
	onClose,
	danger = false,
}: {
	title: string;
	children: ReactNode;
	alert?: string;
	onClose?: () => void;
	danger?: boolean;
}) {
	return (
		<Paper component="section" className={`settings-card${danger ? ' settings-danger' : ''}`}>
			<Typography component="h2">{title}</Typography>
			{alert && (
				<Alert severity="error" onClose={onClose}>
					{alert}
				</Alert>
			)}
			{children}
		</Paper>
	);
}
function DisplaySwitch({
	label,
	description,
	checked,
	onUnavailable,
}: {
	label: string;
	description: string;
	checked: boolean;
	onUnavailable: () => void;
}) {
	return (
		<div className="settings-row">
			<div>
				<Typography className="settings-label">{label}</Typography>
				<Typography variant="body2" color="text.secondary">
					{description}
				</Typography>
			</div>
			<Switch
				checked={checked}
				onChange={onUnavailable}
				slotProps={{
					input: {
						'aria-label': label,
						onKeyDown: (event) => {
							if (event.key === 'Enter') {
								event.preventDefault();
								onUnavailable();
							}
						},
					},
				}}
			/>
		</div>
	);
}
function SettingsEditor({ member, reload }: { member: ProfileMember; reload: () => Promise<ProfileMember> }) {
	const router = useRouter();
	const [form, setForm] = useState(() => formValues(member));
	const [unsupported, setUnsupported] = useState<UnsupportedSection | null>(null);
	const [feedback, setFeedback] = useState<{ severity: 'success' | 'error'; message: string } | null>(null);
	const [emailError, setEmailError] = useState('');
	const [confirmDelete, setConfirmDelete] = useState(false);
	const [deleteError, setDeleteError] = useState('');
	const [busy, setBusy] = useState<'save' | 'delete' | null>(null);
	const lock = useRef(false);
	const [update] = useMutation(UPDATE_MEMBER, { fetchPolicy: 'no-cache' });
	const [remove] = useMutation(DELETE_MEMBER, { fetchPolicy: 'no-cache' });
	function sectionAlert(section: UnsupportedSection) {
		return { alert: unsupported === section ? messages[section] : undefined, onClose: () => setUnsupported(null) };
	}
	async function save() {
		if (lock.current || currentUserVar()?._id !== member._id) return;
		const email = form.memberEmail.trim();
		// An absent, unchanged email is omitted: the backend rejects an empty email string.
		if ((email || member.memberEmail) && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			setEmailError('Enter a valid email address.');
			setFeedback(null);
			return;
		}
		lock.current = true;
		setBusy('save');
		setFeedback(null);
		setEmailError('');
		let persisted = false;
		try {
			const response = await update({
				variables: {
					input: {
						_id: member._id,
						memberLanguage: form.memberLanguage,
						...(email ? { memberEmail: email } : {}),
					},
				},
			});
			if (response.data?.updateMember._id !== member._id) throw new Error('Settings update response was unavailable.');
			persisted = true;
			const token = response.data.updateMember.accessToken;
			if (!token) throw new Error('The server did not return a refreshed session.');
			setJwtToken(token);
			if (!restoreUserFromToken()) throw new Error('The refreshed session could not be restored.');
			const fresh = await reload();
			setForm(formValues(fresh));
			setFeedback({ severity: 'success', message: 'Settings saved.' });
		} catch (error) {
			setFeedback({
				severity: 'error',
				message: `${persisted ? 'Settings saved, but follow-up failed. ' : ''}${error instanceof Error ? error.message : 'Unable to save settings.'}`,
			});
		} finally {
			lock.current = false;
			setBusy(null);
		}
	}
	async function deleteAccount() {
		if (lock.current || currentUserVar()?._id !== member._id) return;
		lock.current = true;
		setBusy('delete');
		setDeleteError('');
		try {
			const response = await remove();
			if (
				response.data?.deleteMember._id !== member._id ||
				response.data.deleteMember.memberStatus !== MemberStatus.DELETED
			) {
				throw new Error('Account deletion was not confirmed by the server.');
			}
			try {
				logout();
			} finally {
				await router.replace('/account/login');
			}
		} catch (error) {
			setDeleteError(error instanceof Error ? error.message : 'Unable to delete your account.');
		} finally {
			lock.current = false;
			setBusy(null);
		}
	}
	return (
		<>
			<form
				className="settings-form"
				noValidate
				onSubmit={(event) => {
					event.preventDefault();
					void save();
				}}
			>
				<SettingsCard title="Security" {...sectionAlert('security')}>
					<div className="settings-row">
						<div>
							<Typography className="settings-label">Password</Typography>
							<Typography aria-label="Password hidden">••••••••••••</Typography>
						</div>
						<Button variant="outlined" onClick={() => setUnsupported('security')}>
							Change Password
						</Button>
					</div>
				</SettingsCard>
				<SettingsCard title="Notifications" {...sectionAlert('notifications')}>
					{notifications.map((item) => (
						<DisplaySwitch key={item.label} {...item} onUnavailable={() => setUnsupported('notifications')} />
					))}
				</SettingsCard>
				<SettingsCard title="Language & Preferences" {...sectionAlert('preferences')}>
					<div className="settings-fields">
						<TextField
							select
							label="Preferred Language"
							value={form.memberLanguage}
							disabled={Boolean(busy)}
							onChange={(event) => {
								const value = Object.values(MemberLanguage).find((language) => language === event.target.value);
								if (value) {
									setForm((previous) => ({ ...previous, memberLanguage: value }));
									setFeedback(null);
								}
							}}
						>
							{Object.values(MemberLanguage).map((value) => (
								<MenuItem key={value} value={value}>
									{value.charAt(0) + value.slice(1).toLowerCase()}
								</MenuItem>
							))}
						</TextField>
						<TextField
							select
							label="Timezone"
							value="Asia / Seoul"
							onChange={() => setUnsupported('preferences')}
							slotProps={{ select: { open: false, onOpen: () => setUnsupported('preferences') } }}
						>
							<MenuItem value="Asia / Seoul">Asia / Seoul</MenuItem>
						</TextField>
					</div>
				</SettingsCard>
				<SettingsCard title="Privacy" {...sectionAlert('privacy')}>
					<TextField
						select
						fullWidth
						label="Profile Visibility"
						value="Public"
						onChange={() => setUnsupported('privacy')}
						slotProps={{ select: { open: false, onOpen: () => setUnsupported('privacy') } }}
					>
						{['Public', 'Private', 'Connections Only'].map((value) => (
							<MenuItem key={value} value={value}>
								{value}
							</MenuItem>
						))}
					</TextField>
					<DisplaySwitch
						label="Show Followers / Following"
						description="Allow others to see your network connections."
						checked
						onUnavailable={() => setUnsupported('privacy')}
					/>
					<DisplaySwitch
						label="Show Activity"
						description="Display your recent trip saves and reviews on your public profile."
						checked
						onUnavailable={() => setUnsupported('privacy')}
					/>
				</SettingsCard>
				<SettingsCard title="Account">
					<div className="settings-fields">
						<TextField
							label="Account Email"
							type="email"
							value={form.memberEmail}
							placeholder="Not provided"
							slotProps={{ inputLabel: { shrink: true } }}
							disabled={Boolean(busy)}
							error={Boolean(emailError)}
							helperText={emailError || (!member.memberEmail && !form.memberEmail ? 'Not provided' : undefined)}
							onChange={(event) => {
								setForm((previous) => ({ ...previous, memberEmail: event.target.value }));
								setEmailError('');
								setFeedback(null);
							}}
						/>
						<div className="settings-status">
							<Typography className="settings-label">Account Status</Typography>
							<Chip
								label={member.memberStatus}
								color={
									member.memberStatus === MemberStatus.DELETED
										? 'error'
										: member.memberStatus === MemberStatus.BLOCKED
											? 'warning'
											: 'success'
								}
								variant="outlined"
							/>
						</div>
					</div>
				</SettingsCard>
				<SettingsCard title="Danger Zone" danger>
					<div className="settings-row">
						<div>
							<Typography component="h3">Delete Account</Typography>
							<Typography variant="body2">Permanently disable access to your WWT account.</Typography>
						</div>
						<Button
							color="error"
							variant="outlined"
							disabled={Boolean(busy)}
							onClick={() => {
								setDeleteError('');
								setConfirmDelete(true);
							}}
						>
							Delete Account
						</Button>
					</div>
				</SettingsCard>
				{feedback && (
					<Alert severity={feedback.severity} onClose={() => setFeedback(null)}>
						{feedback.message}
					</Alert>
				)}
				<div className="settings-actions">
					<Button
						variant="outlined"
						disabled={Boolean(busy)}
						onClick={() => {
							setForm(formValues(member));
							setFeedback(null);
							setEmailError('');
						}}
					>
						Cancel
					</Button>
					<Button type="submit" variant="contained" disabled={Boolean(busy)}>
						{busy === 'save' ? 'Saving…' : 'Save Changes'}
					</Button>
				</div>
			</form>
			<Dialog
				open={confirmDelete}
				onClose={() => {
					if (!busy) setConfirmDelete(false);
				}}
				aria-labelledby="delete-account-title"
				aria-describedby="delete-account-description"
				fullWidth
				maxWidth="sm"
			>
				<DialogTitle id="delete-account-title">Delete Account?</DialogTitle>
				<DialogContent>
					<DialogContentText id="delete-account-description">
						Your account status will be changed to DELETED and you will lose access to your WWT account. This action is
						not presented as temporary deactivation.
					</DialogContentText>
					{deleteError && (
						<Alert severity="error" onClose={() => setDeleteError('')}>
							{deleteError}
						</Alert>
					)}
				</DialogContent>
				<DialogActions>
					<Button disabled={Boolean(busy)} onClick={() => setConfirmDelete(false)}>
						Cancel
					</Button>
					<Button
						color="error"
						variant="contained"
						disabled={Boolean(busy)}
						onClick={() => {
							void deleteAccount();
						}}
					>
						{busy === 'delete' ? 'Deleting…' : 'Delete Account'}
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
}
function SettingsContent({ userId }: { userId?: string }) {
	const { data, loading, error, refetch } = useQuery(GET_MY_PROFILE, { skip: !userId, fetchPolicy: 'no-cache' });
	if (!userId)
		return (
			<Alert
				severity="info"
				action={
					<Button component={Link} href="/account/login">
						Login
					</Button>
				}
			>
				Log in to manage your settings.
			</Alert>
		);
	if (data?.getMyProfile?._id === userId)
		return (
			<SettingsEditor
				member={data.getMyProfile}
				reload={async () => {
					const response = await refetch();
					if (response.data?.getMyProfile?._id !== userId) throw new Error('Profile information unavailable.');
					return response.data.getMyProfile;
				}}
			/>
		);
	if (loading)
		return (
			<div className="settings-form" aria-label="Loading settings" aria-busy="true">
				{Array.from({ length: 6 }, (_, index) => (
					<Paper key={index} className="settings-card">
						<Skeleton width="30%" height={28} />
						<Skeleton height={70} />
						<Skeleton width="70%" height={28} />
					</Paper>
				))}
			</div>
		);
	return (
		<Alert
			severity="error"
			action={
				<Button
					onClick={() => {
						void refetch().catch(() => undefined);
					}}
				>
					Retry
				</Button>
			}
		>
			{error ? 'Unable to load your settings.' : 'Profile information unavailable.'}
		</Alert>
	);
}
export default function Settings() {
	const user = useReactiveVar(currentUserVar);
	return (
		<div className="my-bookings-page settings-page">
			<Breadcrumbs separator="/" className="my-bookings-breadcrumb">
				<Link href="/">Home</Link>
				<Link href="/mypage">My Profile</Link>
				<span aria-current="page">Settings</span>
			</Breadcrumbs>
			<div className="my-bookings-layout">
				<ProfileSidebar active="Settings" />
				<div className="settings-main">
					<header className="settings-header">
						<Typography component="h1">Settings</Typography>
						<Typography color="text.secondary">Manage your account preferences and privacy.</Typography>
					</header>
					<SettingsContent key={user?._id ?? 'guest'} userId={user?._id} />
				</div>
			</div>
		</div>
	);
}
