import { Alert, Button, Skeleton, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import Link from 'next/link';
import type { QueryResult } from '@apollo/client';
import type { CommunityTravelMateItem, MyTravelMatesInput } from '@/apollo/user/query';
import TravelMateCard from './TravelMateCard';

type MateResult = { getTravelMatePosts: { list: CommunityTravelMateItem[]; metaCounter?: { total: number }[] | null } };

export default function TravelMateList({
	query,
	filtered,
	toolbar,
}: {
	query: Pick<QueryResult<MateResult, { input: MyTravelMatesInput }>, 'data' | 'loading' | 'error' | 'refetch'>;
	filtered: boolean;
	toolbar?: ReactNode;
}) {
	const posts = query.data?.getTravelMatePosts.list ?? [];
	return (
		<section className="community-section community-mates" id="community-mates" aria-labelledby="community-mates-title">
			<header className="community-section-heading">
				<div>
					<Typography variant="overline">Plan the next journey together</Typography>
					<Typography component="h2" id="community-mates-title">
						Find a Travel Mate
					</Typography>
				</div>
				<Button component={Link} href="/community/travel-mate" className="community-view-all">
					View All →
				</Button>
			</header>
			{toolbar}
			{query.loading ? (
				<div className="community-mate-grid" aria-label="Loading travel mates">
					{Array.from({ length: 3 }, (_, index) => (
						<Skeleton key={index} variant="rounded" height={330} />
					))}
				</div>
			) : query.error ? (
				<Alert
					severity="error"
					action={<Button onClick={() => void query.refetch().catch(() => undefined)}>Retry</Button>}
				>
					Travel-mate posts could not be loaded.
				</Alert>
			) : !posts.length ? (
				<div className="community-empty">
					<Typography component="h3">
						{filtered ? 'No travel-mate posts match your search.' : 'No open travel-mate trips are available yet.'}
					</Typography>
				</div>
			) : (
				<div className="community-mate-grid">
					{posts.map((post) => (
						<TravelMateCard key={post._id} post={post} />
					))}
				</div>
			)}
		</section>
	);
}
