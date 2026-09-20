import VerifiedUserOutlined from '@mui/icons-material/VerifiedUserOutlined';
import LockOutlined from '@mui/icons-material/LockOutlined';
import PublicOutlined from '@mui/icons-material/PublicOutlined';
import SupportAgent from '@mui/icons-material/SupportAgent';
export default function WhyChooseWWT() {
	return (
		<section className="home-section home-benefits">
			<h2>Why Choose WWT</h2>
			<div className="home-grid-four">
				{[
					{
						title: 'Trusted Agents',
						text: 'Connect with experienced travel experts who know the destination.',
						Icon: VerifiedUserOutlined,
					},
					{
						title: 'Secure Booking',
						text: 'Travel with confidence and peace of mind at every step.',
						Icon: LockOutlined,
					},
					{
						title: 'Best Travel Experiences',
						text: 'Discover carefully curated journeys and authentic moments.',
						Icon: PublicOutlined,
					},
					{ title: '24/7 Support', text: 'A helping hand whenever you need it, wherever you go.', Icon: SupportAgent },
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
