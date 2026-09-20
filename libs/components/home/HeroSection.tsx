import SearchBar from './SearchBar';
import TravelInspiration from './TravelInspiration';
export default function HeroSection() {
	return (
		<section className="home-hero" aria-labelledby="hero-heading">
			<div className="home-container">
				<h1 id="hero-heading">Explore the World with WWT</h1>
				<p>Unforgettable journeys, trusted local agents, and a world of possibilities.</p>
				<SearchBar />
				<TravelInspiration />
			</div>
		</section>
	);
}
