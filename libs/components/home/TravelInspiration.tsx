import Hiking from '@mui/icons-material/Hiking';
import BeachAccessOutlined from '@mui/icons-material/BeachAccessOutlined';
import AccountBalanceOutlined from '@mui/icons-material/AccountBalanceOutlined';
import RestaurantOutlined from '@mui/icons-material/RestaurantOutlined';
import ForestOutlined from '@mui/icons-material/ForestOutlined';
import DiamondOutlined from '@mui/icons-material/DiamondOutlined';
import FamilyRestroom from '@mui/icons-material/FamilyRestroom';
export default function TravelInspiration() {
	return (
		<nav className="home-categories" aria-label="Travel categories">
			{[
				{ label: 'Adventure', Icon: Hiking },
				{ label: 'Beach', Icon: BeachAccessOutlined },
				{ label: 'Culture', Icon: AccountBalanceOutlined },
				{ label: 'Food', Icon: RestaurantOutlined },
				{ label: 'Nature', Icon: ForestOutlined },
				{ label: 'Luxury', Icon: DiamondOutlined },
				{ label: 'Family', Icon: FamilyRestroom },
			].map(({ label, Icon }) => (
				<span key={label}>
					<Icon />
					<span>{label}</span>
				</span>
			))}
		</nav>
	);
}
