import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@apollo/client';
import {
	Alert,
	Breadcrumbs,
	Button,
	InputAdornment,
	MenuItem,
	Pagination,
	Skeleton,
	TextField,
	Typography,
} from '@mui/material';
import Search from '@mui/icons-material/Search';
import HomeOutlined from '@mui/icons-material/HomeOutlined';
import Add from '@mui/icons-material/Add';
import { GET_COMMUNITY_ARTICLES, type CommunityArticlesInput } from '@/apollo/user/query';
import { ArticleCategory } from '@/libs/enums/community.enum';
import ArticleCard from '../article/ArticleCard';

const pageSize = 6;
const searchDebounceMs = 300;

const categoryOptions: Array<{ value: ArticleCategory | null; label: string }> = [
	{ value: null, label: 'All' },
	{ value: ArticleCategory.FREE, label: 'Free' },
	{ value: ArticleCategory.TRAVEL_TIP, label: 'Travel Tips' },
	{ value: ArticleCategory.TRAVEL_REVIEW, label: 'Travel Reviews' },
	{ value: ArticleCategory.QUESTION, label: 'Questions' },
	{ value: ArticleCategory.FIND_COMPANION, label: 'Find Companion' },
	{ value: ArticleCategory.NOTICE, label: 'Notice' },
];

export default function TravelStoriesPage() {
	const [category, setCategory] = useState<ArticleCategory | null>(null);
	const [searchDraft, setSearchDraft] = useState('');
	const [search, setSearch] = useState('');
	const [sort, setSort] = useState<'newest' | 'oldest'>('newest');
	const [page, setPage] = useState(1);
	const gridRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const timer = setTimeout(() => {
			const nextSearch = searchDraft.trim();
			setSearch((current) => (current === nextSearch ? current : nextSearch));
			setPage(1);
		}, searchDebounceMs);

		return () => clearTimeout(timer);
	}, [searchDraft]);

	const variables = useMemo<{ input: CommunityArticlesInput }>(
		() => ({
			input: {
				page,
				limit: pageSize,
				sort: 'createdAt',
				direction: sort === 'newest' ? 'DESC' : 'ASC',
				search: {
					text: search || undefined,
					articleCategory: category || undefined,
				},
			},
		}),
		[category, page, search, sort],
	);
	const { data, loading, error, refetch } = useQuery(GET_COMMUNITY_ARTICLES, {
		variables,
		fetchPolicy: 'no-cache',
		notifyOnNetworkStatusChange: true,
	});

	const articles = data?.getBoardArticles.list ?? [];
	const total = data?.getBoardArticles.metaCounter?.[0]?.total ?? 0;
	const pageCount = Math.max(1, Math.ceil(total / pageSize));
	const filtered = Boolean(search || category);

	function selectCategory(nextCategory: ArticleCategory | null) {
		setCategory(nextCategory);
		setPage(1);
	}

	function submitSearch(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setSearch(searchDraft.trim());
		setPage(1);
	}

	function changeSort(value: 'newest' | 'oldest') {
		setSort(value);
		setPage(1);
	}

	function changePage(_: React.ChangeEvent<unknown>, nextPage: number) {
		setPage(nextPage);
		requestAnimationFrame(() => gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
	}

	function clearFilters() {
		setSearchDraft('');
		setSearch('');
		setCategory(null);
		setPage(1);
	}

	return (
		<div className="travel-stories-page">
			<div className="travel-stories-breadcrumb-bar">
				<div className="travel-stories-container">
					<Breadcrumbs separator="›" aria-label="Breadcrumb">
						<Link href="/"><HomeOutlined fontSize="small" /> Home</Link>
						<Link href="/community">Community</Link>
						<span aria-current="page">Travel Stories</span>
					</Breadcrumbs>
				</div>
			</div>

			<header className="travel-stories-header travel-stories-container">
				<div>
					<Typography component="h1">Travel Stories</Typography>
					<Typography className="travel-stories-description">
						Discover inspiring journeys, honest tips, and unforgettable moments shared by travelers around the world.
					</Typography>
				</div>
				<Button component={Link} href="/community/stories/create" variant="contained" startIcon={<Add />}>
					Share a Story
				</Button>
			</header>

			<main className="travel-stories-container">
				<section className="travel-stories-toolbar" aria-label="Travel story filters">
					<form className="travel-stories-search" onSubmit={submitSearch} role="search">
						<TextField
							fullWidth
							size="small"
							placeholder="Search travel stories..."
							value={searchDraft}
							onChange={(event) => setSearchDraft(event.target.value)}
							slotProps={{
								htmlInput: { 'aria-label': 'Search travel stories' },
								input: { startAdornment: <InputAdornment position="start"><Search /></InputAdornment> },
							}}
						/>
						<Button type="submit" variant="contained">Search</Button>
					</form>
					<div className="travel-stories-filter-row">
						<div className="travel-stories-categories" role="group" aria-label="Story categories">
							{categoryOptions.map((item) => (
								<Button
									key={item.label}
									className={category === item.value ? 'is-active' : ''}
									aria-pressed={category === item.value}
									onClick={() => selectCategory(item.value)}
								>
									{item.label}
								</Button>
							))}
						</div>
						<TextField
							select
							size="small"
							label="Sort"
							value={sort}
							onChange={(event) => changeSort(event.target.value as 'newest' | 'oldest')}
						>
							<MenuItem value="newest">Newest</MenuItem>
							<MenuItem value="oldest">Oldest</MenuItem>
						</TextField>
					</div>
				</section>

				<section className="travel-stories-results" ref={gridRef} aria-labelledby="travel-stories-results-title">
					<div className="travel-stories-results-heading">
						<div>
							<Typography variant="overline">From the WWT community</Typography>
							<Typography component="h2" id="travel-stories-results-title">Latest Travel Stories</Typography>
						</div>
						{!loading && !error && (
							<Typography className="travel-stories-result-count" role="status">
								{total} {total === 1 ? 'story' : 'stories'}
							</Typography>
						)}
					</div>
					{loading ? (
						<div className="travel-stories-grid" aria-label="Loading travel stories">
							{Array.from({ length: pageSize }, (_, index) => (
								<Skeleton key={index} variant="rounded" height={485} />
							))}
						</div>
					) : error ? (
						<Alert
							severity="error"
							action={<Button onClick={() => void refetch().catch(() => undefined)}>Retry</Button>}
						>
							Travel stories could not be loaded.
						</Alert>
					) : articles.length ? (
						<div className="travel-stories-grid">
							{articles.map((article) => (
								<ArticleCard
									key={article._id}
									article={article}
									href={`/community/stories/${article._id}`}
									variant="travel-stories"
								/>
							))}
						</div>
					) : (
						<div className="travel-stories-empty">
							<Typography component="h2">No stories found</Typography>
							<Typography>{filtered ? 'Try a different search term or category.' : 'No travel stories have been published yet.'}</Typography>
							{filtered && <Button onClick={clearFilters}>Clear filters</Button>}
						</div>
					)}
					{!loading && !error && total > pageSize && (
						<Pagination
							className="travel-stories-pagination"
							count={pageCount}
							page={page}
							onChange={changePage}
							color="primary"
							aria-label="Travel stories pages"
						/>
					)}
				</section>
			</main>
		</div>
	);
}
