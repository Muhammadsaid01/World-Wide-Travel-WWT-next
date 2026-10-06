import { type ComponentType, type ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import { Button, IconButton, Skeleton, Typography } from '@mui/material';
import AdminPanelSettingsOutlined from '@mui/icons-material/AdminPanelSettingsOutlined';
import CloseOutlined from '@mui/icons-material/CloseOutlined';
import LogoutOutlined from '@mui/icons-material/LogoutOutlined';
import MenuOutlined from '@mui/icons-material/MenuOutlined';
import { currentUserVar } from '@/apollo/store';
import { logout, restoreUserFromToken } from '@/libs/auth';
import { MemberType } from '@/libs/enums/member.enum';

const adminRoutes = [{ label: 'Agent Requests', href: '/admin/agent-requests' }] as const;

function AdminNavigation({ onNavigate }: { onNavigate?: () => void }) {
	const router = useRouter();
	const user = useReactiveVar(currentUserVar);

	function signOut() {
		logout();
		onNavigate?.();
		void router.push('/account/login');
	}

	return (
		<div className="admin-navigation">
			<Link href="/" className="admin-brand" onClick={onNavigate}>
				<span className="admin-brand-icon" aria-hidden="true">
					<AdminPanelSettingsOutlined />
				</span>
				<span>
					<strong>WWT</strong>
					<small>Administration</small>
				</span>
			</Link>

			<nav aria-label="Admin navigation">
				<Typography component="h2">Management</Typography>
				{adminRoutes.map((route) => {
					const active = router.pathname === route.href || router.pathname.startsWith(`${route.href}/`);
					return (
						<Button
							key={route.href}
							component={Link}
							href={route.href}
							className={active ? 'is-active' : undefined}
							aria-current={active ? 'page' : undefined}
							onClick={onNavigate}
						>
							{route.label}
						</Button>
					);
				})}
			</nav>

			<div className="admin-account">
				<span>Signed in as</span>
				<strong>{user?.memberFullName || user?.memberNick || 'Administrator'}</strong>
				<Button startIcon={<LogoutOutlined />} onClick={signOut}>
					Sign Out
				</Button>
			</div>
		</div>
	);
}

export function AdminLayout({ children }: { children: ReactNode }) {
	const router = useRouter();
	const user = useReactiveVar(currentUserVar);
	const [menuOpen, setMenuOpen] = useState(false);

	useEffect(() => {
		if (!router.isReady) return;
		const current = currentUserVar() ?? restoreUserFromToken();
		if (!current?._id) void router.replace('/account/login');
		else if (current.memberType !== MemberType.ADMIN) void router.replace('/mypage');
	}, [router, user?._id, user?.memberType]);

	if (!router.isReady || !user?._id || user.memberType !== MemberType.ADMIN) {
		return (
			<div className="admin-access-loading" aria-label="Checking administrator access">
				<Skeleton variant="rounded" height={72} />
				<Skeleton variant="rounded" height={420} />
			</div>
		);
	}

	return (
		<div className="admin-shell">
			<a className="admin-skip-link" href="#admin-page-content">
				Skip to content
			</a>
			<aside className="admin-sidebar">
				<AdminNavigation />
			</aside>
			<header className="admin-mobile-header">
				<Link href="/" className="admin-mobile-brand">
					WWT Admin
				</Link>
				<IconButton
					aria-label={menuOpen ? 'Close admin navigation' : 'Open admin navigation'}
					aria-expanded={menuOpen}
					onClick={() => setMenuOpen((open) => !open)}
				>
					{menuOpen ? <CloseOutlined /> : <MenuOutlined />}
				</IconButton>
			</header>
			{menuOpen ? (
				<div className="admin-mobile-menu">
					<AdminNavigation onNavigate={() => setMenuOpen(false)} />
				</div>
			) : null}
			<main id="admin-page-content" className="admin-content" tabIndex={-1}>
				{children}
			</main>
		</div>
	);
}

export default function withAdminLayout<P extends object>(Page: ComponentType<P>) {
	function PageWithAdminLayout(props: P) {
		return (
			<AdminLayout>
				<Page {...props} />
			</AdminLayout>
		);
	}

	PageWithAdminLayout.displayName = `withAdminLayout(${Page.displayName ?? Page.name ?? 'Page'})`;
	return PageWithAdminLayout;
}
