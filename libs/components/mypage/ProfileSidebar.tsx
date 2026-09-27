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

export default function ProfileSidebar() {
	return (
		<aside className="my-bookings-sidebar" aria-label="Profile navigation">
			{groups.map((group) => (
				<section key={group.title}>
					<Typography component="h2">{group.title}</Typography>
					{group.items.map((item) =>
						item === 'My Bookings' ? (
							<Button key={item} component={Link} href="/mypage/my-bookings" className="is-active" aria-current="page">
								{item}
								<span className="my-bookings-active-dot" aria-hidden="true" />
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
