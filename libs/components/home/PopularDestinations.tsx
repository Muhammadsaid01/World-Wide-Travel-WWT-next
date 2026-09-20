import Image from 'next/image';
export default function PopularDestinations() {
	const destinations = [
		{ name: 'Seoul', country: 'South Korea', image: '/images/home/seoul.svg' },
		{ name: 'Tokyo', country: 'Japan', image: '/images/home/tokyo.svg' },
		{ name: 'Paris', country: 'France', image: '/images/home/paris.svg' },
		{ name: 'Dubai', country: 'United Arab Emirates', image: '/images/home/dubai.svg' },
	];
	return (
		<section className="home-section">
			<div className="home-section-heading">
				<div>
					<h2>Popular Destinations</h2>
				</div>
				<span className="wwt-unavailable" aria-disabled="true">Explore More →</span>
			</div>
			<div className="home-grid-four">
				{destinations.map((destination) => (
					<article className="home-destination" key={destination.name}>
						<Image
							src={destination.image}
							alt={`${destination.name} travel illustration placeholder`}
							fill
							sizes="(max-width: 420px) 100vw, (max-width: 1100px) 50vw, (max-width: 1280px) 25vw, 290px"
						/>
						<div>
							<h3>{destination.name}</h3>
							<p>{destination.country}</p>
						</div>
					</article>
				))}
			</div>
		</section>
	);
}
