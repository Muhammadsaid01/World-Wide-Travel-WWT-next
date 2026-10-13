import Link from 'next/link';
import { Button } from '@mui/material';
import { useTranslation } from 'react-i18next';

export default function HomeCTA() {
	const { t } = useTranslation('home');
	return (
		<section className="home-cta">
			<div>
				<h2>{t('cta.title')}</h2>
				<p>{t('cta.description')}</p>
			</div>
			<Button component={Link} href="/package" variant="contained" color="secondary">
				{t('cta.button')}
			</Button>
		</section>
	);
}
