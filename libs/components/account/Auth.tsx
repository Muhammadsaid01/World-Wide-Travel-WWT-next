import ArrowForward from '@mui/icons-material/ArrowForward';
import { Alert, Button, Card, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import type { FormEvent } from 'react';
import { useRef, useState } from 'react';

import { login, signup } from '@/libs/auth';
import SocialLogin from '@/libs/components/account/SocialLogin';
import type { LoginInput, MemberInput } from '@/libs/types/member/member.input';
import { WWTTextField } from '@/scss/MaterialTheme/styled';
import { useTranslation } from 'react-i18next';

type AuthMode = 'login' | 'signup';

interface AuthProps {
	initialMode?: AuthMode;
}

export default function Auth({ initialMode = 'login' }: AuthProps) {
	const { t } = useTranslation('auth');
	const router = useRouter();

	const [mode, setMode] = useState<AuthMode>(initialMode);

	const loginSubmitting = useRef(false);
	const signupSubmitting = useRef(false);

	const [isLoginSubmitting, setIsLoginSubmitting] = useState(false);
	const [isSignupSubmitting, setIsSignupSubmitting] = useState(false);

	const [loginError, setLoginError] = useState('');
	const [signupError, setSignupError] = useState('');
	const [passwordError, setPasswordError] = useState('');

	const changeMode = (nextMode: AuthMode) => {
		setLoginError('');
		setSignupError('');
		setPasswordError('');
		setMode(nextMode);
	};

	async function handleLoginSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		if (
			loginSubmitting.current ||
			!event.currentTarget.reportValidity()
		) {
			return;
		}

		const data = new FormData(event.currentTarget);

		const input: LoginInput = {
			memberNick: String(data.get('memberNick') ?? ''),
			memberPassword: String(data.get('memberPassword') ?? ''),
		};

		loginSubmitting.current = true;
		setIsLoginSubmitting(true);
		setLoginError('');

		try {
			await login(input);
			await router.push('/');
		} catch {
			setLoginError(t('errors.login'));
		} finally {
			loginSubmitting.current = false;
			setIsLoginSubmitting(false);
		}
	}

	async function handleSignupSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		if (
			signupSubmitting.current ||
			!event.currentTarget.reportValidity()
		) {
			return;
		}

		const data = new FormData(event.currentTarget);

		if (data.get('memberPassword') !== data.get('confirmPassword')) {
			setPasswordError(t('validation.passwordMatch'));

			event.currentTarget
				.querySelector<HTMLInputElement>('#signup-confirmPassword')
				?.focus();

			return;
		}

		setPasswordError('');

		const input: MemberInput = {
			memberNick: String(data.get('memberNick') ?? ''),
			memberFullName: String(data.get('memberFullName') ?? ''),
			memberPassword: String(data.get('memberPassword') ?? ''),
		};

		const phone = String(data.get('memberPhone') ?? '').trim();
		const email = String(data.get('memberEmail') ?? '').trim();

		if (phone) input.memberPhone = phone;
		if (email) input.memberEmail = email;

		signupSubmitting.current = true;
		setIsSignupSubmitting(true);
		setSignupError('');

		try {
			await signup(input);
			await router.push('/');
		} catch {
			setSignupError(t('errors.signup'));
		} finally {
			signupSubmitting.current = false;
			setIsSignupSubmitting(false);
		}
	}

	return (
		<section
			className={`wwt-auth-shell ${
				mode === 'signup' ? 'is-signup' : 'is-login'
			}`}
		>
			{/* LOGIN — always lives on the left */}
			<div
				className="wwt-auth-form-pane wwt-auth-login-pane"
				aria-hidden={mode !== 'login'}
			>
				<Card className="wwt-auth-card">
					<Typography className="wwt-auth-eyebrow">
						{t('login.eyebrow')}
					</Typography>

					<Typography component="h1" className="wwt-auth-title">
						{t('login.title')}
					</Typography>

					<Typography className="wwt-auth-description">
						{t('login.description')}
					</Typography>

					<form
						className="wwt-auth-form"
						onSubmit={handleLoginSubmit}
						aria-busy={isLoginSubmitting}
					>
						{loginError && (
							<Alert severity="error">{loginError}</Alert>
						)}

						<fieldset
							disabled={
								isLoginSubmitting || mode !== 'login'
							}
						>
							<div className="wwt-auth-field">
								<label htmlFor="login-memberNick">
									{t('fields.username')}
								</label>

								<WWTTextField
									id="login-memberNick"
									name="memberNick"
									autoComplete="username"
									placeholder={t('fields.usernamePlaceholder')}
									fullWidth
									required
									slotProps={{
										htmlInput: {
											minLength: 3,
											maxLength: 20,
											pattern: '.*\\S.*',
										},
									}}
								/>
							</div>

							<div className="wwt-auth-field">
								<label htmlFor="login-memberPassword">
									{t('fields.password')}
								</label>

								<WWTTextField
									id="login-memberPassword"
									name="memberPassword"
									type="password"
									autoComplete="current-password"
									placeholder={t('fields.passwordPlaceholder')}
									fullWidth
									required
									slotProps={{
										htmlInput: {
											minLength: 6,
											maxLength: 20,
										},
									}}
								/>
							</div>
						</fieldset>

						<Button
							className="wwt-auth-submit"
							type="submit"
							variant="contained"
							fullWidth
							disabled={
								isLoginSubmitting || mode !== 'login'
							}
							endIcon={<ArrowForward />}
						>
							{isLoginSubmitting
								? t('login.submitting')
								: t('login.submit')}
						</Button>
					</form>

					<div className="wwt-auth-divider">
						<span>{t('login.social')}</span>
					</div>

					<SocialLogin />

					<Typography className="wwt-auth-switch">
						{t('login.new')}{' '}
						<button
							type="button"
							onClick={() => changeMode('signup')}
						>
							{t('login.signup')}
						</button>
					</Typography>
				</Card>
			</div>

			{/* SIGNUP — always lives on the right */}
			<div
				className="wwt-auth-form-pane wwt-auth-signup-pane"
				aria-hidden={mode !== 'signup'}
			>
				<Card className="wwt-auth-card">
					<Typography className="wwt-auth-eyebrow">
						{t('signup.eyebrow')}
					</Typography>

					<Typography component="h1" className="wwt-auth-title">
						{t('signup.title')}
					</Typography>

					<Typography className="wwt-auth-description">
						{t('signup.description')}
					</Typography>

					<SocialLogin signup />

					<div className="wwt-auth-divider">
						<span>{t('signup.details')}</span>
					</div>

					<form
						className="wwt-auth-form"
						onSubmit={handleSignupSubmit}
						aria-busy={isSignupSubmitting}
					>
						{signupError && (
							<Alert severity="error">{signupError}</Alert>
						)}

						<fieldset
							disabled={
								isSignupSubmitting || mode !== 'signup'
							}
						>
							<div className="wwt-auth-field">
								<label htmlFor="signup-memberFullName">
									{t('fields.fullName')}
								</label>

								<WWTTextField
									id="signup-memberFullName"
									name="memberFullName"
									autoComplete="name"
									placeholder="Jane Doe"
									fullWidth
									required
									slotProps={{
										htmlInput: {
											minLength: 2,
											maxLength: 50,
											pattern: '.*\\S.*',
										},
									}}
								/>
							</div>

							<div className="wwt-auth-field">
								<label htmlFor="signup-memberNick">
									{t('fields.username')}
								</label>

								<WWTTextField
									id="signup-memberNick"
									name="memberNick"
									autoComplete="username"
									placeholder={t('fields.usernamePlaceholder')}
									fullWidth
									required
									slotProps={{
										htmlInput: {
											minLength: 3,
											maxLength: 20,
											pattern: '.*\\S.*',
										},
									}}
								/>
							</div>

							<div className="wwt-auth-field">
								<label htmlFor="signup-memberEmail">
									{t('fields.emailOptional')}
								</label>

								<WWTTextField
									id="signup-memberEmail"
									name="memberEmail"
									type="email"
									autoComplete="email"
									placeholder="jane@example.com"
									fullWidth
								/>
							</div>

							<div className="wwt-auth-field">
								<label htmlFor="signup-memberPhone">
									{t('fields.phoneOptional')}
								</label>

								<WWTTextField
									id="signup-memberPhone"
									name="memberPhone"
									type="tel"
									autoComplete="tel"
									placeholder={t('fields.phonePlaceholder')}
									fullWidth
								/>
							</div>

							<div className="wwt-auth-password-row">
								<div className="wwt-auth-field">
									<label htmlFor="signup-memberPassword">
										{t('fields.password')}
									</label>

									<WWTTextField
										id="signup-memberPassword"
										name="memberPassword"
										type="password"
										autoComplete="new-password"
										placeholder={t('fields.passwordLength')}
										fullWidth
										required
										slotProps={{
											htmlInput: {
												minLength: 6,
												maxLength: 20,
											},
										}}
									/>
								</div>

								<div className="wwt-auth-field">
									<label htmlFor="signup-confirmPassword">
										{t('fields.confirmPassword')}
									</label>

									<WWTTextField
										id="signup-confirmPassword"
										name="confirmPassword"
										type="password"
										autoComplete="new-password"
										placeholder={t('fields.confirmPlaceholder')}
										fullWidth
										required
										error={!!passwordError}
										helperText={passwordError}
										onChange={() =>
											setPasswordError('')
										}
										slotProps={{
											htmlInput: {
												minLength: 6,
												maxLength: 20,
											},
										}}
									/>
								</div>
							</div>

							<label className="wwt-auth-terms">
								<input
									type="checkbox"
									name="terms"
									required
								/>

								<span>
									{t('signup.termsBefore')}{' '}
									<strong>{t('signup.terms')}</strong> {t('signup.and')}{' '}
									<strong>{t('signup.privacy')}</strong>.
								</span>
							</label>
						</fieldset>

						<Button
							className="wwt-auth-submit"
							type="submit"
							variant="contained"
							fullWidth
							disabled={
								isSignupSubmitting || mode !== 'signup'
							}
							endIcon={<ArrowForward />}
						>
							{isSignupSubmitting
								? t('signup.submitting')
								: t('signup.submit')}
						</Button>
					</form>

					<Typography className="wwt-auth-switch">
						{t('signup.existing')}{' '}
						<button
							type="button"
							onClick={() => changeMode('login')}
						>
							{t('signup.login')}
						</button>
					</Typography>
				</Card>
			</div>

			{/* THIS is the panel that physically slides */}
			<aside className="wwt-auth-overlay">
				<div className="wwt-auth-overlay-content">
					<span className="wwt-auth-overlay-accent" />

					<Typography className="wwt-auth-overlay-kicker">
						{mode === 'login'
							? t('overlay.new')
							: t('overlay.member')}
					</Typography>

					<h2>
						{mode === 'login'
							? t('overlay.join')
							: t('overlay.welcome')}
					</h2>

					<p>
						{mode === 'login'
							? t('overlay.joinText')
							: t('overlay.welcomeText')}
					</p>

					<Button
						className="wwt-auth-overlay-button"
						variant="outlined"
						endIcon={<ArrowForward />}
						onClick={() =>
							changeMode(
								mode === 'login'
									? 'signup'
									: 'login',
							)
						}
					>
						{mode === 'login' ? t('login.signup') : t('login.submit')}
					</Button>

					<dl className="wwt-auth-stats">
						<div>
							<dt>{t('overlay.destinations')}</dt>
							<dd>140+</dd>
						</div>

						<div>
							<dt>{t('overlay.trips')}</dt>
							<dd>850+</dd>
						</div>

						<div>
							<dt>{t('overlay.rating')}</dt>
							<dd>
								4.9 <span>★</span>
							</dd>
						</div>
					</dl>
				</div>
			</aside>
		</section>
	);
}
