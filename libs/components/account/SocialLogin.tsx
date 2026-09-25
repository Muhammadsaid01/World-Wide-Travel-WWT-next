import { Button } from '@mui/material';
import Apple from '@mui/icons-material/Apple';
import Google from '@mui/icons-material/Google';

export default function SocialLogin({ signup = false }: { signup?: boolean }) {
	return (
		<div className="wwt-account-social">
			<Button type="button" disabled className="wwt-social-google" startIcon={<Google />}>
				{signup ? 'Continue with Google' : 'Google'}
			</Button>
			<Button type="button" disabled className="wwt-social-apple" startIcon={<Apple />}>
				{signup ? 'Continue with Apple' : 'Apple'}
			</Button>
			<p>Social sign-in is not available yet.</p>
		</div>
	);
}
