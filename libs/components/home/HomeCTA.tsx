import Link from 'next/link';
import { Button } from '@mui/material';

export default function HomeCTA() {
	return (
		<section className="home-cta">
			<div>
				<h2>Your Next Journey Starts Here</h2>
				<p>Discover amazing places and create memories that last a lifetime.</p>
			</div>
			<Button component={Link} href="/package" variant="contained" color="secondary">
				Explore Packages
			</Button>
		</section>
	);
}
