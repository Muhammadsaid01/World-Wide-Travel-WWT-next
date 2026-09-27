import { packageImageUrl } from '@/libs/components/package/PackageImage';
import { useRef, useState } from 'react';
import { useReactiveVar } from '@apollo/client';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Avatar, Button, Collapse, Container, IconButton, Menu, MenuItem } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { currentUserVar } from '@/apollo/store';
import { logout } from '@/libs/auth';
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
	{ label: 'My Profile', href: '/mypage' },
	{ label: 'CS Center', href: null },
] as const;

export default function Navbar() {
	const currentUser = useReactiveVar(currentUserVar);
	const [accountAnchor, setAccountAnchor] = useState<HTMLButtonElement | null>(null);
	const [menuOpen, setMenuOpen] = useState(false);
	const menuToggle = useRef<HTMLButtonElement>(null);
	const router = useRouter();

	function handleLogout() {
		setAccountAnchor(null);
		setMenuOpen(false);
		try {
			logout();
		} finally {
			void router.push('/');
		}
	}

	function accountControl(location: 'desktop' | 'mobile') {
		if (!currentUser) {
			return (
				<Button component={Link} href="/account/login" className="wwt-login" variant="contained" onClick={() => setMenuOpen(false)}>
					Login
				</Button>
			);
		}

		const id = `wwt-account-${location}`;
		const open = accountAnchor?.id === id;
		return (
			<Button
				id={id}
				className="wwt-account"
				aria-label={`Account menu for ${currentUser.memberNick}`}
				aria-haspopup="menu"
				aria-controls={open ? 'wwt-account-menu' : undefined}
				aria-expanded={open}
				onClick={(event) => setAccountAnchor(event.currentTarget)}
				startIcon={<Avatar className="wwt-account-avatar" src={packageImageUrl(currentUser.memberImage)} />}
				endIcon={<ExpandMoreIcon />}
			>
				<span className="wwt-account-nick">{currentUser.memberNick}</span>
			</Button>
		);
	}

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
					{accountControl('desktop')}
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
						{accountControl('mobile')}
					</div>
				</Container>
			</Collapse>
			<Menu
				id="wwt-account-menu"
				anchorEl={accountAnchor}
				open={Boolean(currentUser && accountAnchor)}
				onClose={() => setAccountAnchor(null)}
				onKeyDown={(event) => event.stopPropagation()}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
				transformOrigin={{ vertical: 'top', horizontal: 'right' }}
				slotProps={{ list: { 'aria-labelledby': accountAnchor?.id } }}
			>
				<MenuItem component={Link} href="/mypage" selected={router.pathname === '/mypage'} onClick={() => { setAccountAnchor(null); setMenuOpen(false); }}>My Profile</MenuItem>
				<MenuItem onClick={handleLogout}>Logout</MenuItem>
			</Menu>
		</header>
	);
}
