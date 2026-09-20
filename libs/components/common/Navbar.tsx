import { useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Button, Collapse, Container, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import LanguageIcon from '@mui/icons-material/Language';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';

const navigation = [
	{ label: 'Home', href: '/' },
	{ label: 'Packages', href: '/package' },
	{ label: 'Agents', href: null },
	{ label: 'Community', href: '/community' },
	{ label: 'My Profile', href: null },
	{ label: 'CS Center', href: null },
] as const;

export default function Navbar() {
	const [menuOpen, setMenuOpen] = useState(false);
	const menuToggle = useRef<HTMLButtonElement>(null);
	const router = useRouter();

	function links() {
		return navigation.map(({ label, href }) =>
			href ? (
				<Link
					key={label}
					href={href}
					className="wwt-nav-link"
					aria-current={router.pathname === href ? 'page' : undefined}
					onClick={() => setMenuOpen(false)}
				>
					{label}
				</Link>
			) : (
				<span key={label} className="wwt-nav-link wwt-unavailable" aria-disabled="true" title={`${label} coming soon`}>
					{label}
				</span>
			),
		);
	}

	return (
		<header
			className="wwt-navbar"
			onKeyDown={(event) => {
				if (event.key === 'Escape' && menuOpen) {
					setMenuOpen(false);
					menuToggle.current?.focus();
				}
			}}
		>
			<Container maxWidth="lg" className="wwt-navbar-inner">
				<Link href="/" className="wwt-brand" aria-label="WWT home" onClick={() => setMenuOpen(false)}>
					WWT
					<span className="wwt-brand-dot" aria-hidden="true">
						.
					</span>
				</Link>
				<nav className="wwt-desktop-nav" aria-label="Main navigation">
					{links()}
				</nav>
				<div className="wwt-navbar-actions">
					<Button className="wwt-language" startIcon={<LanguageIcon />} disabled>
						Language
					</Button>
					<IconButton disabled aria-label="Saved packages (coming soon)">
						<FavoriteBorderIcon />
					</IconButton>
					<IconButton disabled aria-label="Notifications (coming soon)">
						<NotificationsNoneIcon />
					</IconButton>
					<Button className="wwt-login" variant="contained" disabled>
						Login
					</Button>
				</div>
				<IconButton
					ref={menuToggle}
					className="wwt-menu-toggle"
					color="primary"
					aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
					aria-expanded={menuOpen}
					aria-controls="wwt-mobile-menu"
					onClick={() => setMenuOpen(!menuOpen)}
				>
					{menuOpen ? <CloseIcon /> : <MenuIcon />}
				</IconButton>
			</Container>
			<Collapse in={menuOpen} className="wwt-mobile-menu" id="wwt-mobile-menu" unmountOnExit>
				<Container maxWidth="lg">
					<nav className="wwt-mobile-nav" aria-label="Mobile navigation">
						{links()}
					</nav>
					<div className="wwt-mobile-actions">
						<Button startIcon={<LanguageIcon />} disabled>
							Language
						</Button>
						<IconButton disabled aria-label="Saved packages (coming soon)">
							<FavoriteBorderIcon />
						</IconButton>
						<IconButton disabled aria-label="Notifications (coming soon)">
							<NotificationsNoneIcon />
						</IconButton>
						<Button variant="contained" disabled>
							Login
						</Button>
					</div>
				</Container>
			</Collapse>
		</header>
	);
}
