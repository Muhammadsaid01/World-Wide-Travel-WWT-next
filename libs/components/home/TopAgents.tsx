import { Avatar, Button } from '@mui/material';
import Star from '@mui/icons-material/Star';
export default function TopAgents() {
	const agents = [
		{ name: 'Jiwoo Kim', initials: 'JK', specialty: 'South Korea specialist', rating: '4.9', count: 24 },
		{ name: 'Yuki Tanaka', initials: 'YT', specialty: 'Japan culture & adventures', rating: '4.9', count: 32 },
		{ name: 'Sophie Martin', initials: 'SM', specialty: 'Europe & luxury escapes', rating: '4.8', count: 28 },
		{ name: 'Ahmed Hassan', initials: 'AH', specialty: 'Dubai & desert experiences', rating: '4.9', count: 19 },
	];
	return (
		<section className="home-section">
			<div className="home-section-heading">
				<div>
					<h2>Top Travel Agents</h2>
					<p>Plan your journey with passionate local experts</p>
				</div>
				<span className="wwt-unavailable" aria-disabled="true">View All Agents →</span>
			</div>
			<div className="home-grid-four">
				{agents.map((agent) => (
					<article className="home-card home-agent" key={agent.name}>
						<Avatar className="home-agent-avatar" aria-label={`${agent.name} avatar placeholder`}>
							{agent.initials}
						</Avatar>
						<h3>{agent.name}</h3>
						<p>{agent.specialty}</p>
						<p className="home-rating">
							<Star />
							{agent.rating}
						</p>
						<p className="home-agent-count">{agent.count} packages</p>
						<Button variant="outlined" fullWidth disabled>
							View Profile
						</Button>
					</article>
				))}
			</div>
		</section>
	);
}
