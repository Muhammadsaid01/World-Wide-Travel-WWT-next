import Link from 'next/link';
import InstagramIcon from '@mui/icons-material/Instagram';
import FacebookIcon from '@mui/icons-material/Facebook';
import YouTubeIcon from '@mui/icons-material/YouTube';
import { Container, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

const groups = [
	{
		titleKey: 'footer.explore',
		items: [{ labelKey: 'navigation.packages', href: '/package' }, { labelKey: 'navigation.agents' }, { labelKey: 'footer.deals' }, { labelKey: 'footer.coupons' }],
	},
	{ titleKey: 'footer.company', items: [{ labelKey: 'footer.about' }, { labelKey: 'navigation.community', href: '/community' }, { labelKey: 'footer.contact' }] },
	{ titleKey: 'footer.support', items: [{ labelKey: 'navigation.support', href: '/faq' }, { labelKey: 'footer.faq', href: '/faq' }, { labelKey: 'footer.terms' }, { labelKey: 'footer.privacy' }] },
] satisfies { titleKey: string; items: { labelKey: string; href?: string }[] }[];

export default function Footer() {
	const { t } = useTranslation('common');
	return (
		<footer className="wwt-footer">
			<Container maxWidth="lg">
				<div className="wwt-footer-grid">
					<div className="wwt-footer-brand">
						<Link href="/" className="wwt-brand" aria-label={`WWT ${t('navigation.home')}`}>
							WWT
							<span className="wwt-brand-dot" aria-hidden="true">
								.
							</span>
						</Link>
						<Typography component="p" variant="subtitle1">
							{t('footer.brand')}
						</Typography>
						<Typography component="p" variant="body2" className="wwt-footer-description">
							{t('footer.description')}
						</Typography>
					</div>
					{groups.map(({ titleKey, items }) => (
						<nav key={titleKey} aria-label={t(titleKey)}>
							<Typography component="h2" variant="subtitle1" className="wwt-footer-heading">
								{t(titleKey)}
							</Typography>
							<ul className="wwt-footer-list">
								{items.map((item) => {
									const label = t(item.labelKey);
									return <li key={item.labelKey}>
										{'href' in item && item.href ? (
											<Link href={item.href}>{label}</Link>
										) : (
											<span className="wwt-unavailable" aria-disabled="true" title={t('footer.comingSoon', { name: label })}>
												{label}
											</span>
										)}
									</li>;
								})}
							</ul>
						</nav>
					))}
					<div>
						<Typography component="h2" variant="subtitle1" className="wwt-footer-heading">
							{t('footer.social')}
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
					<Typography variant="body2">{t('footer.copyright')}</Typography>
					<span className="wwt-footer-languages" aria-label="Language options">
						{t('footer.languages')}
					</span>
				</div>
			</Container>
		</footer>
	);
}
