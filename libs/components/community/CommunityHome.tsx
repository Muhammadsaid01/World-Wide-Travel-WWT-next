import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useReactiveVar } from '@apollo/client';
import { Button, IconButton, InputAdornment, MenuItem, TextField, Typography } from '@mui/material';
import Search from '@mui/icons-material/Search';
import Close from '@mui/icons-material/Close';
import { currentUserVar } from '@/apollo/store';
import { GET_COMMUNITY_ARTICLES, GET_MORE_TRAVEL_MATES } from '@/apollo/user/query';
import ArticleList from './article/ArticleList';
import TravelMateList from './travel-mate/TravelMateList';
import { COMMUNITY_LIMIT, escapeTravelMateSearch, type CommunityDirection, type CommunityTab } from './communityState';

const tabs: { value: CommunityTab; label: string }[] = [
	{ value: 'all', label: 'All' },
	{ value: 'stories', label: 'Travel Stories' },
	{ value: 'mates', label: 'Travel Mate' },
];

export default function CommunityHome() {
	const user = useReactiveVar(currentUserVar);
	const [tab, setTab] = useState<CommunityTab>('all');
	const [draft, setDraft] = useState('');
	const [search, setSearch] = useState('');
	const [direction, setDirection] = useState<CommunityDirection>('DESC');
	const [articlePage, setArticlePage] = useState(1);
	const showStories = tab !== 'mates';
	const showMates = tab !== 'stories';
	const articleQuery = useQuery(GET_COMMUNITY_ARTICLES, {
		variables: {
			input: {
				page: articlePage,
				limit: COMMUNITY_LIMIT,
				sort: 'createdAt',
				direction,
				search: { text: search || undefined },
			},
		},
		skip: !showStories,
		fetchPolicy: 'no-cache',
		notifyOnNetworkStatusChange: true,
	});
	const mateQuery = useQuery(GET_MORE_TRAVEL_MATES, {
		variables: {
			input: {
				page: 1,
				limit: COMMUNITY_LIMIT,
				sort: 'createdAt',
				direction,
				search: { text: search ? escapeTravelMateSearch(search) : undefined },
			},
		},
		skip: !showMates,
		fetchPolicy: 'no-cache',
		notifyOnNetworkStatusChange: true,
	});
	const submitSearch = (event: React.FormEvent) => {
		event.preventDefault();
		setArticlePage(1);
		setSearch(draft.trim());
	};
	const clearSearch = () => {
		setDraft('');
		setSearch('');
		setArticlePage(1);
	};
	const discoveryControls = (
		<div className="community-discovery-controls">
			<div className="community-tabs" role="tablist" aria-label="Community content">
				{tabs.map((item) => (
					<Button
						key={item.value}
						role="tab"
						aria-selected={tab === item.value}
						className={tab === item.value ? 'is-active' : ''}
						onClick={() => {
							setTab(item.value);
							setArticlePage(1);
						}}
					>
						{item.label}
					</Button>
				))}
			</div>
			<div className="community-sort">
				<Typography component="span">Sort by:</Typography>
				<TextField
					select
					size="small"
					value={direction}
					onChange={(event) => {
						setDirection(event.target.value === 'ASC' ? 'ASC' : 'DESC');
						setArticlePage(1);
					}}
					slotProps={{ htmlInput: { 'aria-label': 'Sort community content' } }}
				>
					<MenuItem value="DESC">Newest</MenuItem>
					<MenuItem value="ASC">Oldest</MenuItem>
				</TextField>
			</div>
		</div>
	);
	const promotionalBanner = (
		<section className="community-promo" aria-labelledby="community-promo-title">
			<div className="community-promo-copy">
				<Typography component="span" className="community-eyebrow">
					Join our global community
				</Typography>
				<Typography component="h2" id="community-promo-title">
					Share Your Story with the World
				</Typography>
				<Typography>
					Inspire fellow travelers, exchange travel tips, and connect with amazing people.
				</Typography>
			</div>
			<div className="community-promo-actions">
				<Button component={Link} href={user ? '/community/stories/create' : '/account/login'} variant="contained">
					Share a Story
				</Button>
				<Button component={Link} href="/community/travel-mate" variant="outlined">
					Find Travel Mate
				</Button>
			</div>
		</section>
	);
	return (
		<div className="community-page">
			<section className="community-hero">
				<div className="community-shell">
					<Typography component="span" className="community-hero-eyebrow">
						Share. Inspire. Explore Together.
					</Typography>
					<Typography component="h1">
						WWT <strong>Community</strong>
					</Typography>
					<Typography component="p">
						Share your journey, discover real travel stories, and find the perfect companion for your next adventure.
					</Typography>
					<form className="community-hero-search" role="search" onSubmit={submitSearch}>
						<TextField
							placeholder="Search stories or travel-mate titles..."
							value={draft}
							onChange={(event) => setDraft(event.target.value)}
							slotProps={{
								htmlInput: { 'aria-label': 'Search community' },
								input: {
									startAdornment: (
										<InputAdornment position="start">
											<Search />
										</InputAdornment>
									),
									endAdornment: (draft || search) && (
										<InputAdornment position="end">
											<IconButton aria-label="Clear community search" size="small" onClick={clearSearch}>
												<Close />
											</IconButton>
										</InputAdornment>
									),
								},
							}}
						/>
						<Button type="submit" variant="contained">
							Search
						</Button>
					</form>
				</div>
			</section>

			<div className="community-shell community-content" id="community-content">
				{showStories && (
					<ArticleList
						query={articleQuery}
						filtered={Boolean(search)}
						toolbar={discoveryControls}
						page={articlePage}
						pageSize={COMMUNITY_LIMIT}
						onPageChange={setArticlePage}
					/>
				)}
				{showStories && showMates && promotionalBanner}
				{showMates && (
					<TravelMateList
						query={mateQuery}
						filtered={Boolean(search)}
						toolbar={!showStories ? discoveryControls : undefined}
					/>
				)}
				{(!showStories || !showMates) && promotionalBanner}
			</div>
		</div>
	);
}
