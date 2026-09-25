import ArrowForward from '@mui/icons-material/ArrowForward';
import { Alert, Button, Card, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import type { FormEvent } from 'react';
import { useRef, useState } from 'react';

import { login, signup } from '@/libs/auth';
import SocialLogin from '@/libs/components/account/SocialLogin';
import type { LoginInput, MemberInput } from '@/libs/types/member/member.input';
import { WWTTextField } from '@/scss/MaterialTheme/styled';

type AuthMode = 'login' | 'signup';

interface AuthProps {
	initialMode?: AuthMode;
}

export default function Auth({ initialMode = 'login' }: AuthProps) {
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
			setLoginError(
				'We couldn’t log you in. Please check your details and try again.',
			);
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
			setPasswordError('Passwords must match.');

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
			setSignupError(
				'We couldn’t create your account. Please check your details and try again.',
			);
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
						Welcome Back
					</Typography>

					<Typography component="h1" className="wwt-auth-title">
						Sign in to your
						<br />
						WWT account
					</Typography>

					<Typography className="wwt-auth-description">
						Continue your journey and explore the world with us.
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
									Username
								</label>

								<WWTTextField
									id="login-memberNick"
									name="memberNick"
									autoComplete="username"
									placeholder="Your username"
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
									Password
								</label>

								<WWTTextField
									id="login-memberPassword"
									name="memberPassword"
									type="password"
									autoComplete="current-password"
									placeholder="Enter your password"
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
								? 'Signing in…'
								: 'Sign In'}
						</Button>
					</form>

					<div className="wwt-auth-divider">
						<span>Or continue with</span>
					</div>

					<SocialLogin />

					<Typography className="wwt-auth-switch">
						Don’t have an account?{' '}
						<button
							type="button"
							onClick={() => changeMode('signup')}
						>
							Sign Up
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
						Join the Adventure
					</Typography>

					<Typography component="h1" className="wwt-auth-title">
						Create your WWT account
					</Typography>

					<Typography className="wwt-auth-description">
						Discover and book unforgettable journeys around the world.
					</Typography>

					<SocialLogin signup />

					<div className="wwt-auth-divider">
						<span>Or register with your details</span>
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
									Full Name
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
									Username
								</label>

								<WWTTextField
									id="signup-memberNick"
									name="memberNick"
									autoComplete="username"
									placeholder="Your username"
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
									Email Address (optional)
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
									Phone Number (optional)
								</label>

								<WWTTextField
									id="signup-memberPhone"
									name="memberPhone"
									type="tel"
									autoComplete="tel"
									placeholder="Your phone number"
									fullWidth
								/>
							</div>

							<div className="wwt-auth-password-row">
								<div className="wwt-auth-field">
									<label htmlFor="signup-memberPassword">
										Password
									</label>

									<WWTTextField
										id="signup-memberPassword"
										name="memberPassword"
										type="password"
										autoComplete="new-password"
										placeholder="6–20 characters"
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
										Confirm Password
									</label>

									<WWTTextField
										id="signup-confirmPassword"
										name="confirmPassword"
										type="password"
										autoComplete="new-password"
										placeholder="Repeat password"
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
									I agree to the{' '}
									<strong>Terms of Service</strong> and{' '}
									<strong>Privacy Policy</strong>.
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
								? 'Creating account…'
								: 'Create Account'}
						</Button>
					</form>

					<Typography className="wwt-auth-switch">
						Already have an account?{' '}
						<button
							type="button"
							onClick={() => changeMode('login')}
						>
							Sign In
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
							? 'New to WWT?'
							: 'Already a member?'}
					</Typography>

					<h2>
						{mode === 'login'
							? 'Join the Adventure'
							: 'Welcome Back'}
					</h2>

					<p>
						{mode === 'login'
							? 'Discover amazing destinations, unique experiences, and a global community of travelers.'
							: 'Continue your journey and explore more incredible destinations with WWT.'}
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
						{mode === 'login' ? 'Sign Up' : 'Sign In'}
					</Button>

					<dl className="wwt-auth-stats">
						<div>
							<dt>Destinations</dt>
							<dd>140+</dd>
						</div>

						<div>
							<dt>Curated Trips</dt>
							<dd>850+</dd>
						</div>

						<div>
							<dt>Member Rating</dt>
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