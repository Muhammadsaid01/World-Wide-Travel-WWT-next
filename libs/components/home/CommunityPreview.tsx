import Image from 'next/image';
import Link from 'next/link';
import FavoriteBorder from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutline from '@mui/icons-material/ChatBubbleOutlined';
export default function CommunityPreview() {
	const stories = [
		{
			title: 'A Local’s Guide to Hidden Seoul',
			author: 'Emma Wilson',
			description: 'Quiet neighborhoods, cozy cafés, and the little discoveries that made my trip unforgettable.',
			image: '/images/home/seoul.svg',
			date: 'Jun 12, 2026',
			dateTime: '2026-06-12',
			likes: 128,
			comments: 24,
		},
		{
			title: 'Finding Magic in the Streets of Tokyo',
			author: 'Daniel Lee',
			description: 'From lively markets to peaceful gardens, a journey through the many sides of Japan.',
			image: '/images/home/tokyo.svg',
			date: 'Jun 10, 2026',
			dateTime: '2026-06-10',
			likes: 96,
			comments: 18,
		},
		{
			title: 'A Perfect Weekend in Paris',
			author: 'Sarah Chen',
			description: 'Art, fresh pastries, and sunset walks: making the most of a short escape to Paris.',
			image: '/images/home/paris.svg',
			date: 'Jun 8, 2026',
			dateTime: '2026-06-08',
			likes: 154,
			comments: 32,
		},
	];
	return (
		<section className="home-section home-community">
			<div className="home-section-heading">
				<div>
					<h2>Travel Stories & Community</h2>
					<p>Real inspiration from fellow explorers</p>
				</div>
				<Link href="/community">Explore community →</Link>
			</div>
			<div className="home-grid-three">
				{stories.map((story) => (
					<article className="home-card" key={story.title}>
						<div className="home-card-image">
							<Image
								src={story.image}
								alt="Travel story illustration placeholder"
								fill
								sizes="(max-width: 600px) 100vw, (max-width: 1100px) 50vw, (max-width: 1280px) 33vw, 395px"
							/>
						</div>
						<div className="home-card-body">
							<p className="home-author">By {story.author}</p>
							<h3>{story.title}</h3>
							<p className="home-story-description">{story.description}</p>
							<div className="home-story-meta">
								<span>
									<FavoriteBorder />
									{story.likes}
									<ChatBubbleOutline />
									{story.comments}
								</span>
								<time dateTime={story.dateTime}>{story.date}</time>
							</div>
						</div>
					</article>
				))}
			</div>
		</section>
	);
}
