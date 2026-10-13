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
import { useTranslation } from 'react-i18next';

const pageSize = 6;
const searchDebounceMs = 300;

const categoryOptions: Array<ArticleCategory | null> = [null, ...Object.values(ArticleCategory)];

export default function TravelStoriesPage() {
	const { t } = useTranslation(['community', 'common']);
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
					<Breadcrumbs separator="›" aria-label={t('stories.breadcrumb')}>
						<Link href="/"><HomeOutlined fontSize="small" /> {t('navigation.home', { ns: 'common' })}</Link>
						<Link href="/community">{t('navigation.community', { ns: 'common' })}</Link>
						<span aria-current="page">{t('stories.title')}</span>
					</Breadcrumbs>
				</div>
			</div>

			<header className="travel-stories-header travel-stories-container">
				<div>
					<Typography component="h1">{t('stories.title')}</Typography>
					<Typography className="travel-stories-description">
						{t('stories.description')}
					</Typography>
				</div>
				<Button component={Link} href="/community/stories/create" variant="contained" startIcon={<Add />}>
					{t('stories.share')}
				</Button>
			</header>

			<main className="travel-stories-container">
			<section className="travel-stories-toolbar" aria-label={t('stories.category')}>
					<form className="travel-stories-search" onSubmit={submitSearch} role="search">
						<TextField
							fullWidth
							size="small"
							placeholder={t('stories.search')}
							value={searchDraft}
							onChange={(event) => setSearchDraft(event.target.value)}
							slotProps={{
								htmlInput: { 'aria-label': t('stories.searchLabel') },
								input: { startAdornment: <InputAdornment position="start"><Search /></InputAdornment> },
							}}
						/>
						<Button type="submit" variant="contained">{t('actions.search', { ns: 'common' })}</Button>
					</form>
					<div className="travel-stories-filter-row">
						<div className="travel-stories-categories" role="group" aria-label={t('stories.category')}>
							{categoryOptions.map((item) => (
								<Button
									key={item ?? 'all'}
									className={category === item ? 'is-active' : ''}
									aria-pressed={category === item}
									onClick={() => selectCategory(item)}
								>
									{item ? t(`categories.${item}`) : t('stories.all')}
								</Button>
							))}
						</div>
						<TextField
							select
							size="small"
							label={t('sort.label', { ns: 'common' })}
							value={sort}
							onChange={(event) => changeSort(event.target.value as 'newest' | 'oldest')}
						>
							<MenuItem value="newest">{t('sort.newest', { ns: 'common' })}</MenuItem>
							<MenuItem value="oldest">{t('sort.oldest', { ns: 'common' })}</MenuItem>
						</TextField>
					</div>
				</section>

				<section className="travel-stories-results" ref={gridRef} aria-labelledby="travel-stories-results-title">
					<div className="travel-stories-results-heading">
						<div>
							<Typography variant="overline">{t('home.storiesEyebrow')}</Typography>
							<Typography component="h2" id="travel-stories-results-title">{t('home.storiesTitle')}</Typography>
						</div>
						{!loading && !error && (
							<Typography className="travel-stories-result-count" role="status">
								{t('stories.count', { count: total })}
							</Typography>
						)}
					</div>
					{loading ? (
						<div className="travel-stories-grid" aria-label={t('stories.loading')}>
							{Array.from({ length: pageSize }, (_, index) => (
								<Skeleton key={index} variant="rounded" height={485} />
							))}
						</div>
					) : error ? (
						<Alert
							severity="error"
							action={<Button onClick={() => void refetch().catch(() => undefined)}>{t('actions.retry', { ns: 'common' })}</Button>}
						>
							{t('stories.error')}
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
							<Typography component="h2">{t('stories.empty')}</Typography>
							{filtered && <Button onClick={clearFilters}>{t('actions.clearAll', { ns: 'common' })}</Button>}
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
