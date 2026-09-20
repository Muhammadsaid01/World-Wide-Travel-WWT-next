import Image from 'next/image';
import Link from 'next/link';
import { IconButton } from '@mui/material';
import FavoriteBorder from '@mui/icons-material/FavoriteBorder';
import Star from '@mui/icons-material/Star';
import PlaceOutlined from '@mui/icons-material/PlaceOutlined';
import AccessTime from '@mui/icons-material/AccessTime';
export default function PopularPackages() {
	const packages = [
		{
			title: 'Discover the Heart of Seoul',
			location: 'Seoul, South Korea',
			image: '/images/home/seoul.svg',
			rating: '4.9',
			duration: '5 days / 4 nights',
			price: '$590',
		},
		{
			title: 'Tokyo Culture & City Escape',
			location: 'Tokyo, Japan',
			image: '/images/home/tokyo.svg',
			rating: '4.8',
			duration: '6 days / 5 nights',
			price: '$890',
		},
		{
			title: 'Paris Highlights & Hidden Gems',
			location: 'Paris, France',
			image: '/images/home/paris.svg',
			rating: '4.9',
			duration: '5 days / 4 nights',
			price: '$1,190',
		},
		{
			title: 'Dubai City & Desert Adventure',
			location: 'Dubai, UAE',
			image: '/images/home/dubai.svg',
			rating: '4.7',
			duration: '4 days / 3 nights',
			price: '$750',
		},
	];
	return (
		<section className="home-section home-packages">
			<div className="home-section-heading">
				<div>
					<h2>Popular Travel Packages</h2>
				</div>
				<Link href="/package">View all packages →</Link>
			</div>
			<div className="home-grid-four">
				{packages.map((item) => (
					<article className="home-card" key={item.title}>
						<div className="home-card-image">
							<Image
								src={item.image}
								alt={`${item.location} illustration placeholder`}
								fill
								sizes="(max-width: 600px) 100vw, (max-width: 1100px) 50vw, (max-width: 1280px) 25vw, 290px"
							/>
							<IconButton className="home-favorite" disabled aria-label={`Save ${item.title} (coming soon)`}>
								<FavoriteBorder fontSize="small" />
							</IconButton>
						</div>
						<div className="home-card-body">
							<p className="home-location">
								<PlaceOutlined />
								{item.location}
							</p>
							<h3>{item.title}</h3>
							<p className="home-rating">
								<Star />
								{item.rating}
								<span>(Sample rating)</span>
							</p>
							<p className="home-duration">
								<AccessTime />
								{item.duration}
							</p>
							<div className="home-price">
								<span>
									From <strong>{item.price}</strong>
								</span>
								<small>/ person</small>
							</div>
						</div>
					</article>
				))}
			</div>
		</section>
	);
}
