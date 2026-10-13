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
import { useTranslation } from 'react-i18next';

const tabs: { value: CommunityTab; labelKey: string }[] = [
	{ value: 'all', labelKey: 'home.all' },
	{ value: 'stories', labelKey: 'home.stories' },
	{ value: 'mates', labelKey: 'home.mates' },
];

export default function CommunityHome() {
	const { t } = useTranslation(['community', 'common']);
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
			<div className="community-tabs" role="tablist" aria-label={t('navigation.community', { ns: 'common' })}>
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
						{t(item.labelKey)}
					</Button>
				))}
			</div>
			<div className="community-sort">
				<Typography component="span">{t('sort.label', { ns: 'common' })}</Typography>
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
					<MenuItem value="DESC">{t('sort.newest', { ns: 'common' })}</MenuItem>
					<MenuItem value="ASC">{t('sort.oldest', { ns: 'common' })}</MenuItem>
				</TextField>
			</div>
		</div>
	);
	const promotionalBanner = (
		<section className="community-promo" aria-labelledby="community-promo-title">
			<div className="community-promo-copy">
				<Typography component="span" className="community-eyebrow">
					{t('home.bannerEyebrow')}
				</Typography>
				<Typography component="h2" id="community-promo-title">
					{t('home.bannerTitle')}
				</Typography>
				<Typography>
					{t('home.bannerText')}
				</Typography>
			</div>
			<div className="community-promo-actions">
				<Button component={Link} href={user ? '/community/stories/create' : '/account/login'} variant="contained">
					{t('home.share')}
				</Button>
				<Button component={Link} href="/community/travel-mate" variant="outlined">
					{t('home.findMate')}
				</Button>
			</div>
		</section>
	);
	return (
		<div className="community-page">
			<section className="community-hero">
				<div className="community-shell">
					<Typography component="span" className="community-hero-eyebrow">
						{t('home.eyebrow')}
					</Typography>
					<Typography component="h1">
						{t('home.titleBefore')} <strong>{t('home.titleAccent')}</strong>
					</Typography>
					<Typography component="p">
						{t('home.description')}
					</Typography>
					<form className="community-hero-search" role="search" onSubmit={submitSearch}>
						<TextField
							placeholder={t('home.search')}
							value={draft}
							onChange={(event) => setDraft(event.target.value)}
							slotProps={{
								htmlInput: { 'aria-label': t('home.searchLabel') },
								input: {
									startAdornment: (
										<InputAdornment position="start">
											<Search />
										</InputAdornment>
									),
									endAdornment: (draft || search) && (
										<InputAdornment position="end">
										<IconButton aria-label={t('home.clear')} size="small" onClick={clearSearch}>
												<Close />
											</IconButton>
										</InputAdornment>
									),
								},
							}}
						/>
						<Button type="submit" variant="contained">
							{t('actions.search', { ns: 'common' })}
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
