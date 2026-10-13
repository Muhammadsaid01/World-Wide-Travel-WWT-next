import VerifiedUserOutlined from '@mui/icons-material/VerifiedUserOutlined';
import LockOutlined from '@mui/icons-material/LockOutlined';
import PublicOutlined from '@mui/icons-material/PublicOutlined';
import GroupsOutlined from '@mui/icons-material/GroupsOutlined';
import { useTranslation } from 'react-i18next';
export default function WhyChooseWWT() {
	const { t } = useTranslation('home');
	return (
		<section className="home-section home-benefits">
			<h2>{t('why.title')}</h2>
			<div className="home-grid-four">
				{[
					{
						title: t('why.trustedTitle'),
						text: t('why.trustedText'),
						Icon: VerifiedUserOutlined,
					},
					{
						title: t('why.secureTitle'),
						text: t('why.secureText'),
						Icon: LockOutlined,
					},
					{
						title: t('why.experiencesTitle'),
						text: t('why.experiencesText'),
						Icon: PublicOutlined,
					},
					{ title: t('why.communityTitle'), text: t('why.communityText'), Icon: GroupsOutlined },
				].map(({ title, text, Icon }) => (
					<article key={title}>
						<Icon />
						<h3>{title}</h3>
						<p>{text}</p>
					</article>
				))}
			</div>
		</section>
	);
}
