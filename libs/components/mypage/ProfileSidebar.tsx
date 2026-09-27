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
}: {
	active?: 'Overview' | 'My Bookings' | 'Edit Profile' | 'My Articles' | 'My Travel Mates' | 'Join Requests';
}) {
	return (
		<aside className="my-bookings-sidebar" aria-label="Profile navigation">
			{groups.map((group) => (
				<section key={group.title}>
					<Typography component="h2">{group.title}</Typography>
					{group.items.map((item) =>
						item === 'My Bookings' ||
						item === 'Overview' ||
						item === 'Edit Profile' ||
						item === 'My Articles' ||
						item === 'My Travel Mates' ||
						item === 'Join Requests' ? (
							<Button
								key={item}
								component={Link}
								href={
									item === 'Overview'
										? '/mypage'
										: item === 'Edit Profile'
											? '/mypage/edit-profile'
											: item === 'My Articles'
												? '/mypage/articles'
												: item === 'My Travel Mates'
													? '/mypage/travel-mates'
													: item === 'Join Requests'
														? '/mypage/join-requests'
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
