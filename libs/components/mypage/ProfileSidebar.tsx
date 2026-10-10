import type { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import { Button, Typography } from '@mui/material';
import { currentUserVar } from '@/apollo/store';
import { MemberType } from '@/libs/enums/member.enum';
import DashboardOutlined from '@mui/icons-material/DashboardOutlined';
import LuggageOutlined from '@mui/icons-material/LuggageOutlined';
import Inventory2Outlined from '@mui/icons-material/Inventory2Outlined';
import EventNoteOutlined from '@mui/icons-material/EventNoteOutlined';
import ArticleOutlined from '@mui/icons-material/ArticleOutlined';
import GroupsOutlined from '@mui/icons-material/GroupsOutlined';
import PersonAddAltOutlined from '@mui/icons-material/PersonAddAltOutlined';
import BookmarkBorderOutlined from '@mui/icons-material/BookmarkBorderOutlined';
import FlagOutlined from '@mui/icons-material/FlagOutlined';
import PeopleOutline from '@mui/icons-material/PeopleOutlined';
import PersonOutline from '@mui/icons-material/PersonOutlined';
import ChatBubbleOutline from '@mui/icons-material/ChatBubbleOutlined';
import EditOutlined from '@mui/icons-material/EditOutlined';
import SettingsOutlined from '@mui/icons-material/SettingsOutlined';
import WorkspacePremiumOutlined from '@mui/icons-material/WorkspacePremiumOutlined';

const routes = {
	Overview: '/mypage',
	'My Packages': '/mypage/packages',
	Bookings: '/mypage/bookings',
	'My Bookings': '/mypage/my-bookings',
	'My Articles': '/mypage/articles',
	'My Travel Mates': '/mypage/travel-mates',
	'Join Requests': '/mypage/join-requests',
	'My Reports': '/mypage/reports',
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
	{ title: 'Community', items: ['My Articles', 'My Travel Mates', 'Join Requests', 'Saved', 'My Reports'] },
	{ title: 'Connections', items: ['Followers', 'Following'] },
	{ title: 'Messages', items: ['Chats'] },
	{ title: 'Account', items: ['Edit Profile', 'Settings'] },
];
const icons: Record<SidebarItem, ReactNode> = {
	Overview: <DashboardOutlined />,
	'My Packages': <Inventory2Outlined />,
	Bookings: <EventNoteOutlined />,
	'My Bookings': <LuggageOutlined />,
	'My Articles': <ArticleOutlined />,
	'My Travel Mates': <GroupsOutlined />,
	'Join Requests': <PersonAddAltOutlined />,
	'My Reports': <FlagOutlined />,
	Saved: <BookmarkBorderOutlined />,
	Followers: <PeopleOutline />,
	Following: <PersonOutline />,
	Chats: <ChatBubbleOutline />,
	'Edit Profile': <EditOutlined />,
	Settings: <SettingsOutlined />,
	'Become an Agent': <WorkspacePremiumOutlined />,
};

export default function ProfileSidebar({
	active,
	profileCard,
	pendingJoinRequests,
}: {
	active?: SidebarItem;
	profileCard?: ReactNode;
	pendingJoinRequests?: number;
}) {
	const user = useReactiveVar(currentUserVar);
	const router = useRouter();
	const isAgent = user?.memberType === MemberType.AGENT;
	const isUser = user?.memberType === MemberType.USER;
	const groups: SidebarGroup[] = [
		{ title: isAgent ? 'Agent Profile' : 'Dashboard', items: ['Overview', 'My Bookings'] },
		...(isAgent ? [{ title: 'Business', items: ['My Packages', 'Bookings'] } satisfies SidebarGroup] : []),
		...sharedGroups,
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
				<section key={group.title} aria-labelledby={`profile-nav-${group.title.toLowerCase().replace(/\s+/g, '-')}`}>
					<Typography component="h2" id={`profile-nav-${group.title.toLowerCase().replace(/\s+/g, '-')}`}>
						{group.title}
					</Typography>
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
								startIcon={icons[item]}
							>
								<span className="profile-nav-label">{item}</span>
								{item === 'Join Requests' && typeof pendingJoinRequests === 'number' && pendingJoinRequests > 0 && (
									<span className="profile-nav-badge" aria-label={`${pendingJoinRequests} pending`}>
										{pendingJoinRequests > 99 ? '99+' : pendingJoinRequests}
									</span>
								)}
							</Button>
						);
					})}
				</section>
			))}
		</aside>
	);
}
