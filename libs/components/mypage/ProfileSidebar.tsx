import type { ReactNode } from 'react';
import Link from 'next/link';
import { Button, Typography } from '@mui/material';
const groups = [
	{
		title: 'My Profile',
		items: ['Overview', 'My Bookings', 'My Articles', 'My Travel Mates', 'Join Requests', 'Saved'],
	},
	{ title: 'Connections', items: ['Followers', 'Following'] },
	{ title: 'Account', items: ['Edit Profile', 'Settings'] },
];

export default function ProfileSidebar({
	active = 'My Bookings',
	profileCard,
}: {
	active?:
		| 'Overview'
		| 'My Bookings'
		| 'Edit Profile'
		| 'My Articles'
		| 'My Travel Mates'
		| 'Join Requests'
		| 'Saved'
		| 'Followers'
		| 'Following';
	profileCard?: ReactNode;
}) {
	return (
		<aside className="my-bookings-sidebar" aria-label="Profile navigation">
			{profileCard}
			{groups.map((group) => (
				<section key={group.title}>
					<Typography component="h2">{group.title}</Typography>
					{group.items.map((item) =>
						item === 'My Bookings' ||
						item === 'Overview' ||
						item === 'Edit Profile' ||
						item === 'My Articles' ||
						item === 'My Travel Mates' ||
						item === 'Join Requests' ||
						item === 'Followers' ||
						item === 'Following' ||
						item === 'Saved' ? (
							<Button
								key={item}
								component={Link}
								href={
									item === 'Followers'
										? '/mypage/followers'
										: item === 'Following'
											? '/mypage/following'
											: item === 'Overview'
												? '/mypage'
												: item === 'Edit Profile'
													? '/mypage/edit-profile'
													: item === 'My Articles'
														? '/mypage/articles'
														: item === 'My Travel Mates'
															? '/mypage/travel-mates'
															: item === 'Join Requests'
																? '/mypage/join-requests'
																: item === 'Saved'
																	? '/mypage/saved'
																	: '/mypage/my-bookings'
								}
								className={item === active ? 'is-active' : undefined}
								aria-current={item === active ? 'page' : undefined}
							>
								{item}
								{item === active && <span className="my-bookings-active-dot" aria-hidden="true" />}
							</Button>
						) : (
							<Button key={item} disabled>
								{item}
							</Button>
						),
					)}
				</section>
			))}
		</aside>
	);
}
