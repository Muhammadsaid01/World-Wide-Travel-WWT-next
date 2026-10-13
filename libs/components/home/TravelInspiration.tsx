import AccountBalanceOutlined from '@mui/icons-material/AccountBalanceOutlined';
import BusinessCenterOutlined from '@mui/icons-material/BusinessCenterOutlined';
import DiamondOutlined from '@mui/icons-material/DiamondOutlined';
import FamilyRestroom from '@mui/icons-material/FamilyRestroom';
import FavoriteBorderOutlined from '@mui/icons-material/FavoriteBorderOutlined';
import ForestOutlined from '@mui/icons-material/ForestOutlined';
import Hiking from '@mui/icons-material/Hiking';
import RestaurantOutlined from '@mui/icons-material/RestaurantOutlined';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

const categories = [
	{ key: 'adventure', value: 'ADVENTURE', Icon: Hiking }, { key: 'family', value: 'FAMILY', Icon: FamilyRestroom },
	{ key: 'honeymoon', value: 'HONEYMOON', Icon: FavoriteBorderOutlined }, { key: 'culture', value: 'CULTURE', Icon: AccountBalanceOutlined },
	{ key: 'food', value: 'FOOD', Icon: RestaurantOutlined }, { key: 'nature', value: 'NATURE', Icon: ForestOutlined },
	{ key: 'business', value: 'BUSINESS', Icon: BusinessCenterOutlined }, { key: 'luxury', value: 'LUXURY', Icon: DiamondOutlined },
] as const;

export default function TravelInspiration() {
	const { t } = useTranslation('home');
	return (
		<section className="home-section home-category-section" aria-labelledby="home-category-title">
			<div className="home-section-heading home-section-heading-centered"><div>
				<span className="home-section-kicker">{t('categories.eyebrow')}</span><h2 id="home-category-title">{t('categories.title')}</h2>
			</div></div>
			<nav className="home-categories" aria-label={t('categories.aria')}>
				{categories.map(({ key, value, Icon }) => (
					<Link key={value} href={{ pathname: '/package', query: { category: value } }}><Icon /><span>{t(`categories.${key}`)}</span></Link>
				))}
			</nav>
		</section>
	);
}
