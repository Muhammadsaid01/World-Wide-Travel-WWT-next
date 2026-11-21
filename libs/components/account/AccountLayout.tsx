import type { CSSProperties, ReactNode } from 'react';
import { useTheme } from '@mui/material/styles';
import ExploreOutlined from '@mui/icons-material/ExploreOutlined';
import Link from 'next/link';

export default function AccountLayout({ children }: { children: ReactNode }) {
	const theme = useTheme();
	const style: CSSProperties & Record<`--wwt-${string}`, string> = {
		'--wwt-primary': theme.palette.primary.main,
		'--wwt-accent': theme.palette.secondary.main,
		'--wwt-muted': theme.palette.text.secondary,
	};
	return (
		<div className="wwt-account-layout" style={style}>
			<a className="wwt-account-skip" href="#account-content">
				Skip to form
			</a>
			<header className="wwt-account-header">
				<Link className="wwt-account-brand" href="/" aria-label="WWT home">
					<ExploreOutlined /> WWT
				</Link>
				<Link href="/">Back to Home</Link>
			</header>
			<main id="account-content" tabIndex={-1}>
				{children}
			</main>
			<footer className="wwt-account-footer">© {new Date().getFullYear()} WWT · World Wide Travel</footer>
		</div>
	);
}
