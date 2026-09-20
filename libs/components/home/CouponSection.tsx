import { Button } from '@mui/material';
import CardGiftcardOutlined from '@mui/icons-material/CardGiftcardOutlined';
import WbSunnyOutlined from '@mui/icons-material/WbSunnyOutlined';

export default function CouponSection() {
	return (
		<section className="home-section">
			<div className="home-section-heading">
				<h2>Special Offers</h2>
				<span className="wwt-unavailable" aria-disabled="true">View All Offers →</span>
			</div>
			<div className="home-offers">
				<article>
					<CardGiftcardOutlined />
					<div>
						<h3>New Member Offer</h3>
						<strong>10% off your first adventure</strong>
						<small>Sample offer · Booking coming soon</small>
					</div>
					<Button variant="contained" disabled>Sign Up & Get Coupon</Button>
				</article>
				<article>
					<WbSunnyOutlined />
					<div>
						<h3>Summer Special</h3>
						<strong>Save up to 20% on selected trips</strong>
						<small>Sample offer · Booking coming soon</small>
					</div>
					<Button variant="contained" color="secondary" disabled>Claim Coupon</Button>
				</article>
			</div>
		</section>
	);
}
