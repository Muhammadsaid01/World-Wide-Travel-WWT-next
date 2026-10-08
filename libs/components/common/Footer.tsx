import Link from 'next/link';
import InstagramIcon from '@mui/icons-material/Instagram';
import FacebookIcon from '@mui/icons-material/Facebook';
import YouTubeIcon from '@mui/icons-material/YouTube';
import { Container, Typography } from '@mui/material';

const groups = [
	{
		title: 'Explore',
		items: [{ label: 'Packages', href: '/package' }, { label: 'Agents' }, { label: 'Deals' }, { label: 'Coupons' }],
	},
	{ title: 'Company', items: [{ label: 'About' }, { label: 'Community', href: '/community' }, { label: 'Contact' }] },
	{ title: 'Support', items: [{ label: 'CS Center', href: '/faq' }, { label: 'FAQ', href: '/faq' }, { label: 'Terms' }, { label: 'Privacy' }] },
] satisfies { title: string; items: { label: string; href?: string }[] }[];

export default function Footer() {
	return (
		<footer className="wwt-footer">
			<Container maxWidth="lg">
				<div className="wwt-footer-grid">
					<div className="wwt-footer-brand">
						<Link href="/" className="wwt-brand" aria-label="WWT home">
							WWT
							<span className="wwt-brand-dot" aria-hidden="true">
								.
							</span>
						</Link>
						<Typography component="p" variant="subtitle1">
							World Wide Travel
						</Typography>
						<Typography component="p" variant="body2" className="wwt-footer-description">
							Discover inspiring journeys, explore travel packages, and connect with a world of fellow travelers.
						</Typography>
					</div>
					{groups.map(({ title, items }) => (
						<nav key={title} aria-label={`Footer ${title}`}>
							<Typography component="h2" variant="subtitle1" className="wwt-footer-heading">
								{title}
							</Typography>
							<ul className="wwt-footer-list">
								{items.map((item) => (
									<li key={item.label}>
										{'href' in item && item.href ? (
											<Link href={item.href}>{item.label}</Link>
										) : (
											<span className="wwt-unavailable" aria-disabled="true" title={`${item.label} coming soon`}>
												{item.label}
											</span>
										)}
									</li>
								))}
							</ul>
						</nav>
					))}
					<div>
						<Typography component="h2" variant="subtitle1" className="wwt-footer-heading">
							Social
						</Typography>
						<ul className="wwt-footer-list">
							{[
								{ label: 'Instagram', Icon: InstagramIcon },
								{ label: 'Facebook', Icon: FacebookIcon },
								{ label: 'YouTube', Icon: YouTubeIcon },
							].map(({ label, Icon }) => (
								<li key={label}>
									<span className="wwt-social wwt-unavailable" aria-disabled="true">
										<Icon fontSize="small" />
										{label}
									</span>
								</li>
							))}
						</ul>
					</div>
				</div>
				<div className="wwt-footer-bottom">
					<Typography variant="body2">© 2026 World Wide Travel (WWT). All rights reserved.</Typography>
					<span className="wwt-footer-languages" aria-label="Language options">
						English · 한국어 · Русский · Oʻzbek
					</span>
				</div>
			</Container>
		</footer>
	);
}
