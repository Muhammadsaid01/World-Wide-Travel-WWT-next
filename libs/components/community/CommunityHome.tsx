import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useReactiveVar } from '@apollo/client';
import { Button, InputAdornment, MenuItem, TextField, Typography } from '@mui/material';
import Search from '@mui/icons-material/Search';
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
	const showStories = tab !== 'mates';
	const showMates = tab !== 'stories';
	const articleQuery = useQuery(GET_COMMUNITY_ARTICLES, {
		variables: {
			input: {
				page: 1,
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
		setSearch(draft.trim());
	};
	const showOnly = (nextTab: Exclude<CommunityTab, 'all'>, sectionId: string) => {
		setTab(nextTab);
		requestAnimationFrame(() =>
			document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
		);
	};

	return (
		<div className="community-page">
			<section className="community-hero">
				<div className="community-shell">
					<Typography component="h1">WWT Community</Typography>
					<Typography component="p">
						Share your journey, discover real travel stories, and find the perfect companion for your next adventure.
					</Typography>
					<Button component="a" href="#community-content" variant="contained">
						EXPLORE COMMUNITY
					</Button>
				</div>
			</section>

			<div className="community-shell community-content" id="community-content">
				<div className="community-toolbar">
					<div className="community-tabs" role="tablist" aria-label="Community content">
						{tabs.map((item) => (
							<Button
								key={item.value}
								role="tab"
								aria-selected={tab === item.value}
								className={tab === item.value ? 'is-active' : ''}
								onClick={() => setTab(item.value)}
							>
								{item.label}
							</Button>
						))}
					</div>
					<form className="community-search" role="search" onSubmit={submitSearch}>
						<TextField
							size="small"
							placeholder="Search stories and travel mates"
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
								},
							}}
						/>
						<Button type="submit" variant="contained">
							Search
						</Button>
					</form>
					<TextField
						select
						size="small"
						label="Sort"
						value={direction}
						onChange={(event) => setDirection(event.target.value === 'ASC' ? 'ASC' : 'DESC')}
					>
						<MenuItem value="DESC">Newest</MenuItem>
						<MenuItem value="ASC">Oldest</MenuItem>
					</TextField>
					{search && (
						<Button
							onClick={() => {
								setDraft('');
								setSearch('');
							}}
						>
							Clear
						</Button>
					)}
				</div>

				{showStories && (
					<ArticleList
						query={articleQuery}
						filtered={Boolean(search)}
					/>
				)}
				{showMates && (
					<TravelMateList
						query={mateQuery}
						filtered={Boolean(search)}
						onViewAll={() => showOnly('mates', 'community-mates')}
					/>
				)}

				<section className="community-cta">
					<div>
						<Typography component="h2">Join the WWT Community</Typography>
						<Typography>
							Share your experiences, meet fellow travelers, and make every journey more meaningful.
						</Typography>
					</div>
					<div className="community-cta-actions">
						<Button component={Link} href={user ? '/community/stories/create' : '/account/login'} variant="contained">
							SHARE A STORY
						</Button>
						<Button component={Link} href={user ? '/mypage/travel-mates' : '/account/login'} variant="outlined">
							FIND TRAVEL MATE
						</Button>
					</div>
				</section>
			</div>
		</div>
	);
}
