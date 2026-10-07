import AccountBalanceOutlined from '@mui/icons-material/AccountBalanceOutlined';
import BusinessCenterOutlined from '@mui/icons-material/BusinessCenterOutlined';
import DiamondOutlined from '@mui/icons-material/DiamondOutlined';
import FamilyRestroom from '@mui/icons-material/FamilyRestroom';
import FavoriteBorderOutlined from '@mui/icons-material/FavoriteBorderOutlined';
import ForestOutlined from '@mui/icons-material/ForestOutlined';
import Hiking from '@mui/icons-material/Hiking';
import RestaurantOutlined from '@mui/icons-material/RestaurantOutlined';
import Link from 'next/link';

const categories = [
	{ label: 'Adventure', value: 'ADVENTURE', Icon: Hiking }, { label: 'Family', value: 'FAMILY', Icon: FamilyRestroom },
	{ label: 'Honeymoon', value: 'HONEYMOON', Icon: FavoriteBorderOutlined }, { label: 'Culture', value: 'CULTURE', Icon: AccountBalanceOutlined },
	{ label: 'Food', value: 'FOOD', Icon: RestaurantOutlined }, { label: 'Nature', value: 'NATURE', Icon: ForestOutlined },
	{ label: 'Business', value: 'BUSINESS', Icon: BusinessCenterOutlined }, { label: 'Luxury', value: 'LUXURY', Icon: DiamondOutlined },
] as const;

export default function TravelInspiration() {
	return (
		<section className="home-section home-category-section" aria-labelledby="home-category-title">
			<div className="home-section-heading home-section-heading-centered"><div>
				<span className="home-section-kicker">Find your travel style</span><h2 id="home-category-title">Browse by Category</h2>
			</div></div>
			<nav className="home-categories" aria-label="Package categories">
				{categories.map(({ label, value, Icon }) => (
					<Link key={value} href={{ pathname: '/package', query: { category: value } }}><Icon /><span>{label}</span></Link>
				))}
			</nav>
		</section>
	);
}
