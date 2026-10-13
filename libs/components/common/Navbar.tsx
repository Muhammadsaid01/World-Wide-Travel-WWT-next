import { GET_MY_UNREAD_MESSAGE_COUNT, GET_UNREAD_NOTIFICATION_COUNT, type NotificationQueryInput } from '@/apollo/user/query';
import { currentUserVar } from '@/apollo/store';
import { logout } from '@/libs/auth';
import NotificationWidget from '@/libs/components/common/NotificationWidget/NotificationWidget';
import { packageImageUrl } from '@/libs/components/package/PackageImage';
import { MemberType } from '@/libs/enums/member.enum';
import { NotificationBadge } from '@/scss/MaterialTheme/styled';
import { useQuery, useReactiveVar } from '@apollo/client';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import { Avatar, Button, Collapse, Container, IconButton, Menu, MenuItem } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { changeAppLanguage, languageOptions, normalizeLanguage } from '@/libs/i18n';

const navigation = [
	{ key: 'home', href: '/' },
	{ key: 'packages', href: '/package' },
	{ key: 'agents', href: '/agent' },
	{ key: 'community', href: '/community' },
	{ key: 'profile', href: '/mypage' },
	{ key: 'support', href: '/faq' },
] as const;

export default function Navbar() {
	const { t, i18n } = useTranslation('common');
	const currentUser = useReactiveVar(currentUserVar);
	const [accountAnchor, setAccountAnchor] = useState<HTMLButtonElement | null>(null);
	const [languageAnchor, setLanguageAnchor] = useState<HTMLButtonElement | null>(null);
	const [notificationAnchor, setNotificationAnchor] = useState<HTMLButtonElement | null>(null);
	const [menuOpen, setMenuOpen] = useState(false);
	const menuToggle = useRef<HTMLButtonElement>(null);
	const router = useRouter();
	const activeLanguage = normalizeLanguage(i18n.resolvedLanguage ?? i18n.language);
	const activeLanguageOption = languageOptions.find((option) => option.code === activeLanguage) ?? languageOptions[0];
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

	function languageControl(location: 'desktop' | 'mobile') {
		const id = `wwt-language-${location}`;
		const open = languageAnchor?.id === id;
		return (
			<Button
				id={id}
				className="wwt-language"
				endIcon={<ExpandMoreIcon />}
				aria-label={`${t('language.label')}: ${activeLanguageOption.label}`}
				aria-haspopup="menu"
				aria-controls={open ? 'wwt-language-menu' : undefined}
				aria-expanded={open}
				onClick={(event) => {
					setAccountAnchor(null);
					setNotificationAnchor(null);
					setLanguageAnchor(event.currentTarget);
				}}
			>
				<span className="wwt-language-flag" aria-hidden="true">
					<Image src={activeLanguageOption.flagSrc} alt="" width={24} height={24} />
				</span>
				<span className="wwt-language-name">{activeLanguageOption.label}</span>
			</Button>
		);
	}

	function notificationControl(location: 'desktop' | 'mobile') {
		const id = `wwt-notifications-${location}`;
		const open = notificationAnchor?.id === id;
		return (
			<IconButton
				id={id}
				aria-label={unreadCount ? t('notificationsUnread', { count: unreadCount }) : t('notifications')}
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
					{t('account.login')}
				</Button>
			);
		}

		const id = `wwt-account-${location}`;
		const open = accountAnchor?.id === id;
		return (
			<Button
				id={id}
				className="wwt-account"
				aria-label={t('account.menu', { name: currentUser.memberNick })}
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
		return navigation.map(({ key, href }) => {
			const label = t(`navigation.${key}`);
			return (
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
			));
		});
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
				<Link href="/" className="wwt-brand" aria-label={`WWT ${t('navigation.home')}`} onClick={() => setMenuOpen(false)}>
					WWT
					<span className="wwt-brand-dot" aria-hidden="true">
						.
					</span>
				</Link>
				<nav className="wwt-desktop-nav" aria-label={t('navigation.main')}>
					{links()}
				</nav>
				<div className="wwt-navbar-actions">
					{languageControl('desktop')}
					<IconButton
						component={Link}
						href="/mypage/saved"
						aria-label={t('savedPackages')}
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
					aria-label={menuOpen ? t('actions.close') : t('navigation.mobile')}
					aria-expanded={menuOpen}
					aria-controls="wwt-mobile-menu"
					onClick={() => setMenuOpen(!menuOpen)}
				>
					{menuOpen ? <CloseIcon /> : <MenuIcon />}
				</IconButton>
			</Container>
			<Collapse in={menuOpen} className="wwt-mobile-menu" id="wwt-mobile-menu" unmountOnExit>
				<Container maxWidth="lg">
					<nav className="wwt-mobile-nav" aria-label={t('navigation.mobile')}>
						{links()}
					</nav>
					<div className="wwt-mobile-actions">
						{languageControl('mobile')}
						<IconButton
							component={Link}
							href="/mypage/saved"
							aria-label={t('savedPackages')}
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
				id="wwt-language-menu"
				anchorEl={languageAnchor}
				open={Boolean(languageAnchor)}
				onClose={() => setLanguageAnchor(null)}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
				transformOrigin={{ vertical: 'top', horizontal: 'right' }}
				slotProps={{ list: { 'aria-label': t('language.menu'), 'aria-labelledby': languageAnchor?.id } }}
			>
				{languageOptions.map((option) => (
					<MenuItem
						key={option.code}
						className="wwt-language-option"
						selected={option.code === activeLanguage}
						onClick={() => {
							setLanguageAnchor(null);
							void changeAppLanguage(option.code);
						}}
					>
						<span className="wwt-language-flag" aria-hidden="true">
							<Image src={option.flagSrc} alt="" width={24} height={24} />
						</span>
						<span>{option.label}</span>
						{option.code === activeLanguage ? <CheckIcon className="wwt-language-check" fontSize="small" /> : null}
					</MenuItem>
				))}
			</Menu>
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
				<MenuItem component={Link} href="/mypage" selected={router.pathname === '/mypage'} onClick={() => { setAccountAnchor(null); setMenuOpen(false); }}>{t('account.profile')}</MenuItem>
				{canUsePrivateChat && (
					<MenuItem component={Link} href="/mypage/chats" selected={router.pathname === '/mypage/chats'} onClick={() => { setAccountAnchor(null); setMenuOpen(false); }}>
						{t('account.chats')}{chatUnreadCount > 0 && <span className="wwt-chat-menu-count" aria-label={t('unreadMessages', { count: chatUnreadCount })}>{Math.min(chatUnreadCount, 99)}</span>}
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
						{t('account.admin')}
					</MenuItem>
				)}
				<MenuItem onClick={handleLogout}>{t('account.logout')}</MenuItem>
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
