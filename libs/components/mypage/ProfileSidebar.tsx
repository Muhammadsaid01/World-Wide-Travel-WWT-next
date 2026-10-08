import type { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import { Button, Typography } from '@mui/material';
import { currentUserVar } from '@/apollo/store';
import { MemberType } from '@/libs/enums/member.enum';

const routes = {
	Overview: '/mypage',
	'My Packages': '/mypage/packages',
	Bookings: '/mypage/bookings',
	'My Bookings': '/mypage/my-bookings',
	'My Articles': '/mypage/articles',
	'My Travel Mates': '/mypage/travel-mates',
	'Join Requests': '/mypage/join-requests',
	Saved: '/mypage/saved',
	Followers: '/mypage/followers',
	Following: '/mypage/following',
	Chats: '/mypage/chats',
	'Edit Profile': '/mypage/edit-profile',
	Settings: '/mypage/settings',
	'Become an Agent': '/mypage/agent-request',
} as const;
type SidebarItem = keyof typeof routes;
type SidebarGroup = { title: string; items: SidebarItem[] };
const sharedGroups: SidebarGroup[] = [
	{ title: 'Community', items: ['My Articles', 'My Travel Mates', 'Join Requests', 'Saved'] },
	{ title: 'Connections', items: ['Followers', 'Following'] },
	{ title: 'Account', items: ['Edit Profile', 'Settings'] },
];

export default function ProfileSidebar({ active, profileCard }: { active?: SidebarItem; profileCard?: ReactNode }) {
	const user = useReactiveVar(currentUserVar);
	const router = useRouter();
	const isAgent = user?.memberType === MemberType.AGENT;
	const isUser = user?.memberType === MemberType.USER;
	const groups: SidebarGroup[] = [
		{ title: isAgent ? 'Agent Profile' : 'My Profile', items: ['Overview', 'My Bookings'] },
		...(isAgent ? [{ title: 'Business', items: ['My Packages', 'Bookings'] } satisfies SidebarGroup] : []),
		...sharedGroups.map((group) =>
			group.title === 'Connections' && (isAgent || isUser)
				? { ...group, items: ['Chats', 'Followers', 'Following'] as SidebarItem[] }
				: group,
		),
		...(isUser ? [{ title: 'Agent', items: ['Become an Agent'] } satisfies SidebarGroup] : []),
	];
	// Match nested routes too, so booking detail pages retain their sidebar highlight.
	const routeActive = (Object.keys(routes) as (keyof typeof routes)[]).find(
		(item) =>
			router.pathname === routes[item] ||
			(routes[item] !== '/mypage' && router.pathname.startsWith(`${routes[item]}/`)),
	);
	const selected = routeActive ?? active;
	return (
		<aside className="my-bookings-sidebar" aria-label="Profile navigation">
			{profileCard}
			{groups.map((group) => (
				<section key={group.title}>
					<Typography component="h2">{group.title}</Typography>
					{group.items.map((item) => {
						const href = routes[item as keyof typeof routes];
						const isActive = item === selected;
						return (
							<Button
								key={item}
								component={Link}
								href={href}
								className={isActive ? 'is-active' : undefined}
								aria-current={isActive ? 'page' : undefined}
							>
								{item}
								{isActive && <span className="my-bookings-active-dot" aria-hidden="true" />}
							</Button>
						);
					})}
				</section>
			))}
		</aside>
	);
}
