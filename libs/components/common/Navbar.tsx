import { GET_MY_UNREAD_MESSAGE_COUNT, GET_UNREAD_NOTIFICATION_COUNT, type NotificationQueryInput } from '@/apollo/user/query';
import { currentUserVar } from '@/apollo/store';
import { logout } from '@/libs/auth';
import NotificationWidget from '@/libs/components/common/NotificationWidget/NotificationWidget';
import { packageImageUrl } from '@/libs/components/package/PackageImage';
import { MemberType } from '@/libs/enums/member.enum';
import { NotificationBadge } from '@/scss/MaterialTheme/styled';
import { useQuery, useReactiveVar } from '@apollo/client';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import LanguageIcon from '@mui/icons-material/Language';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import { Avatar, Button, Collapse, Container, IconButton, Menu, MenuItem } from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useRef, useState } from 'react';

const navigation = [
	{ label: 'Home', href: '/' },
	{ label: 'Packages', href: '/package' },
	{ label: 'Agents', href: '/agent' },
	{ label: 'Community', href: '/community' },
	{ label: 'My Profile', href: '/mypage' },
	{ label: 'CS Center', href: '/faq' },
] as const;

export default function Navbar() {
	const currentUser = useReactiveVar(currentUserVar);
	const [accountAnchor, setAccountAnchor] = useState<HTMLButtonElement | null>(null);
	const [notificationAnchor, setNotificationAnchor] = useState<HTMLButtonElement | null>(null);
	const [menuOpen, setMenuOpen] = useState(false);
	const menuToggle = useRef<HTMLButtonElement>(null);
	const router = useRouter();
	const canUsePrivateChat =
		currentUser?.memberType === MemberType.USER ||
		currentUser?.memberType === MemberType.AGENT ||
		currentUser?.memberType === MemberType.ADMIN;
	const unreadVariables: { input: NotificationQueryInput } = {
		input: {
			page: 1,
			limit: 1,
			sort: 'createdAt',
			direction: 'DESC',
			search: { isRead: false },
		},
	};
	const unreadQuery = useQuery(GET_UNREAD_NOTIFICATION_COUNT, {
		variables: unreadVariables,
		skip: !currentUser?._id,
		fetchPolicy: 'no-cache',
	});
	const unreadCount = unreadQuery.data?.getMyNotifications.metaCounter?.[0]?.total ?? 0;
	const chatUnreadQuery = useQuery(GET_MY_UNREAD_MESSAGE_COUNT, {
		skip: !currentUser?._id || !canUsePrivateChat,
		fetchPolicy: 'network-only',
		pollInterval: 30_000,
	});
	const chatUnreadCount = chatUnreadQuery.data?.getMyUnreadMessageCount ?? 0;

	function handleLogout() {
		setAccountAnchor(null);
		setNotificationAnchor(null);
		setMenuOpen(false);
		try {
			logout();
		} finally {
			void router.push('/');
		}
	}

	function notificationControl(location: 'desktop' | 'mobile') {
		const id = `wwt-notifications-${location}`;
		const open = notificationAnchor?.id === id;
		return (
			<IconButton
				id={id}
				aria-label={currentUser ? `Notifications${unreadCount ? `, ${unreadCount} unread` : ''}` : 'Notifications and notices'}
				aria-haspopup="dialog"
				aria-controls={open ? 'wwt-notification-panel' : undefined}
				aria-expanded={open}
				onClick={(event) => {
					setAccountAnchor(null);
					setNotificationAnchor(event.currentTarget);
					if (currentUser?._id) void unreadQuery.refetch();
				}}
			>
				<NotificationBadge badgeContent={unreadCount} max={99} invisible={!unreadCount}>
					<NotificationsNoneIcon />
				</NotificationBadge>
			</IconButton>
		);
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
				onClick={(event) => {
					setNotificationAnchor(null);
					setAccountAnchor(event.currentTarget);
				}}
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
					<IconButton
						component={Link}
						href="/mypage/saved"
						aria-label="Saved packages"
						color={router.pathname === '/mypage/saved' ? 'primary' : 'default'}
					>
						{router.pathname === '/mypage/saved' ? (
							<FavoriteIcon />
						) : (
							<FavoriteBorderIcon />
						)}
					</IconButton>
					{notificationControl('desktop')}
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
						<IconButton
							component={Link}
							href="/mypage/saved"
							aria-label="Saved packages"
							color={router.pathname === '/mypage/saved' ? 'primary' : 'default'}
							onClick={() => setMenuOpen(false)}
						>
							{router.pathname === '/mypage/saved' ? (
								<FavoriteIcon />
							) : (
								<FavoriteBorderIcon />
							)}
						</IconButton>
						{notificationControl('mobile')}
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
				{canUsePrivateChat && (
					<MenuItem component={Link} href="/mypage/chats" selected={router.pathname === '/mypage/chats'} onClick={() => { setAccountAnchor(null); setMenuOpen(false); }}>
						Chats{chatUnreadCount > 0 && <span className="wwt-chat-menu-count" aria-label={`${chatUnreadCount} unread messages`}>{Math.min(chatUnreadCount, 99)}</span>}
					</MenuItem>
				)}
				{currentUser?.memberType === MemberType.ADMIN && (
					<MenuItem
						component={Link}
						href="/admin"
						selected={router.pathname === '/admin'}
						onClick={() => {
							setAccountAnchor(null);
							setMenuOpen(false);
						}}
					>
						Admin Dashboard
					</MenuItem>
				)}
				<MenuItem onClick={handleLogout}>Logout</MenuItem>
			</Menu>
			<NotificationWidget
				key={notificationAnchor?.id ?? 'closed-notifications'}
				anchorEl={notificationAnchor}
				authenticated={Boolean(currentUser?._id)}
				unreadCount={unreadCount}
				onClose={() => setNotificationAnchor(null)}
				onUnreadChange={async () => unreadQuery.refetch()}
			/>
		</header>
	);
}
