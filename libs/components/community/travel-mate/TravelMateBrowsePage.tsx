import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useQuery, useReactiveVar } from '@apollo/client';
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
import Add from '@mui/icons-material/Add';
import HomeOutlined from '@mui/icons-material/HomeOutlined';
import PlaceOutlined from '@mui/icons-material/PlaceOutlined';
import Search from '@mui/icons-material/Search';
import { currentUserVar } from '@/apollo/store';
import { GET_MORE_TRAVEL_MATES, type MyTravelMatesInput } from '@/apollo/user/query';
import { escapeTravelMateSearch } from '../communityState';
import TravelMateCard from './TravelMateCard';
import { useTranslation } from 'react-i18next';

const PAGE_SIZE = 9;

export default function TravelMateBrowsePage() {
	const { t } = useTranslation(['community', 'common']);
	const user = useReactiveVar(currentUserVar);
	const [draft, setDraft] = useState({ text: '', country: '', city: '' });
	const [filters, setFilters] = useState(draft);
	const [direction, setDirection] = useState<'ASC' | 'DESC'>('DESC');
	const [page, setPage] = useState(1);
	const resultsRef = useRef<HTMLElement>(null);
	const variables = useMemo<{ input: MyTravelMatesInput }>(
		() => ({
			input: {
				page,
				limit: PAGE_SIZE,
				sort: 'createdAt',
				direction,
				search: {
					text: filters.text ? escapeTravelMateSearch(filters.text) : undefined,
					destinationCountry: filters.country || undefined,
					destinationCity: filters.city || undefined,
				},
			},
		}),
		[direction, filters, page],
	);
	const { data, loading, error, refetch } = useQuery(GET_MORE_TRAVEL_MATES, {
		variables,
		fetchPolicy: 'no-cache',
		notifyOnNetworkStatusChange: true,
	});
	const result = data?.getTravelMatePosts;
	const total = result?.metaCounter?.[0]?.total ?? 0;
	const filtered = Boolean(filters.text || filters.country || filters.city);

	function applyFilters(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setFilters({ text: draft.text.trim(), country: draft.country.trim(), city: draft.city.trim() });
		setPage(1);
	}

	function reset() {
		const empty = { text: '', country: '', city: '' };
		setDraft(empty);
		setFilters(empty);
		setDirection('DESC');
		setPage(1);
	}

	return (
		<div className="travel-mate-browse-page">
			<div className="travel-mate-browse-breadcrumb">
				<div className="travel-mate-browse-container">
					<Breadcrumbs separator="›">
						<Link href="/"><HomeOutlined fontSize="small" /> {t('navigation.home', { ns: 'common' })}</Link>
						<Link href="/community">{t('navigation.community', { ns: 'common' })}</Link>
						<span aria-current="page">{t('mates.title')}</span>
					</Breadcrumbs>
				</div>
			</div>
			<header className="travel-mate-browse-header">
				<div className="travel-mate-browse-container">
					<div>
						<Typography variant="overline">{t('home.matesEyebrow')}</Typography>
						<Typography component="h1">{t('mates.title')}</Typography>
						<Typography>
							{t('mates.description')}
						</Typography>
					</div>
					<Button
						component={Link}
						href={user ? '/mypage/travel-mates/create' : '/account/login'}
						variant="contained"
						startIcon={<Add />}
					>
						{t('mates.create')}
					</Button>
				</div>
			</header>

			<main className="travel-mate-browse-container">
				<form className="travel-mate-browse-filters" onSubmit={applyFilters} role="search">
					<TextField
						className="travel-mate-browse-search"
						label={t('actions.search', { ns: 'common' })}
						placeholder={t('mates.search')}
						value={draft.text}
						onChange={(event) => setDraft((current) => ({ ...current, text: event.target.value }))}
						slotProps={{
							htmlInput: { 'aria-label': t('mates.searchLabel') },
							input: { startAdornment: <InputAdornment position="start"><Search /></InputAdornment> },
						}}
					/>
					<TextField
						label={t('mates.country')}
						placeholder={t('mates.country')}
						value={draft.country}
						onChange={(event) => setDraft((current) => ({ ...current, country: event.target.value }))}
						slotProps={{ input: { startAdornment: <InputAdornment position="start"><PlaceOutlined /></InputAdornment> } }}
					/>
					<TextField
						label={t('mates.city')}
						placeholder={t('mates.city')}
						value={draft.city}
						onChange={(event) => setDraft((current) => ({ ...current, city: event.target.value }))}
					/>
					<TextField
						select
						label={t('sort.label', { ns: 'common' })}
						value={direction}
						onChange={(event) => {
							setDirection(event.target.value === 'ASC' ? 'ASC' : 'DESC');
							setPage(1);
						}}
					>
						<MenuItem value="DESC">{t('sort.newest', { ns: 'common' })}</MenuItem>
						<MenuItem value="ASC">{t('sort.oldest', { ns: 'common' })}</MenuItem>
					</TextField>
					<div className="travel-mate-browse-filter-actions">
						<Button type="submit" variant="contained">{t('actions.search', { ns: 'common' })}</Button>
						{(filtered || direction === 'ASC') && <Button type="button" onClick={reset}>{t('actions.clearAll', { ns: 'common' })}</Button>}
					</div>
				</form>

				<section className="travel-mate-browse-results" ref={resultsRef} aria-labelledby="travel-mate-results-title">
					<header>
						<div>
							<Typography variant="overline">{t('home.matesEyebrow')}</Typography>
							<Typography component="h2" id="travel-mate-results-title">{t('mates.title')}</Typography>
						</div>
						{!loading && !error && <Typography role="status">{t('mates.count', { count: total })}</Typography>}
					</header>
					{loading ? (
						<div className="travel-mate-browse-grid" aria-label={t('mates.loading')}>
							{Array.from({ length: 6 }, (_, index) => <Skeleton key={index} variant="rounded" height={360} />)}
						</div>
					) : error ? (
						<Alert severity="error" action={<Button onClick={() => void refetch()}>{t('actions.retry', { ns: 'common' })}</Button>}>
							{t('mates.error')} {error.message}
						</Alert>
					) : result?.list.length ? (
						<div className="travel-mate-browse-grid">
							{result.list.map((post) => <TravelMateCard key={post._id} post={post} />)}
						</div>
					) : (
						<div className="travel-mate-browse-empty">
							<Typography component="h2">{t('mates.empty')}</Typography>
							{filtered && <Button onClick={reset}>{t('actions.clearAll', { ns: 'common' })}</Button>}
						</div>
					)}
					{!loading && !error && total > PAGE_SIZE && (
						<Pagination
							count={Math.ceil(total / PAGE_SIZE)}
							page={page}
							color="primary"
							onChange={(_, value) => {
								setPage(value);
								requestAnimationFrame(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
							}}
							aria-label="Travel mate pages"
						/>
					)}
				</section>
			</main>
		</div>
	);
}
