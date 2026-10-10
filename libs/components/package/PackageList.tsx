import { currentUserVar } from '@/apollo/store';
import { TOGGLE_SAVED_PACKAGE } from '@/apollo/user/mutation';
import { GET_SAVED_PACKAGES, GET_TRAVEL_PACKAGES, type PackageListInput } from '@/apollo/user/query';
import { PackageCategory } from '@/libs/enums/package.enum';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import CloseIcon from '@mui/icons-material/Close';
import FilterAltOutlined from '@mui/icons-material/FilterAltOutlined';
import PlaceOutlined from '@mui/icons-material/PlaceOutlined';
import SearchIcon from '@mui/icons-material/Search';
import TuneIcon from '@mui/icons-material/Tune';
import {
	Alert,
	Button,
	Chip,
	Drawer,
	FormControlLabel,
	IconButton,
	InputAdornment,
	MenuItem,
	Pagination,
	Radio,
	RadioGroup,
	Skeleton,
	TextField,
} from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState, type FormEvent } from 'react';

import PackageCard from './PackageCard';

// Confirmed against availablePackageSorts in the backend config.
const sorts = [
	{ label: 'Newest', sort: 'createdAt', direction: 'DESC' },
	{ label: 'Price: low to high', sort: 'packagePrice', direction: 'ASC' },
	{ label: 'Price: high to low', sort: 'packagePrice', direction: 'DESC' },
	{ label: 'Highest rated', sort: 'packageRating', direction: 'DESC' },
] as const;

const initialInput: PackageListInput = { page: 1, limit: 9, sort: 'createdAt', direction: 'DESC' };
type FilterKey = 'text' | 'destinationCountry' | 'destinationCity' | 'packageCategory';
const filterKeys: FilterKey[] = ['text', 'destinationCountry', 'destinationCity', 'packageCategory'];
const categoryLabel = (value: string) =>
	value
		.toLowerCase()
		.replaceAll('_', ' ')
		.replace(/^./, (letter) => letter.toUpperCase());

const heroCategories: { label: string; image: string; value?: PackageCategory | '' }[] = [
	{ label: 'All', image: '/images/packages/catigories/all.png', value: '' },
	{ label: 'Beach', image: '/images/packages/catigories/beach.png' },
	{ label: 'City', image: '/images/packages/catigories/city.png' },
	{ label: 'Mountains', image: '/images/packages/catigories/mountains.png' },
	{ label: 'Culture', image: '/images/packages/catigories/culture.png', value: PackageCategory.CULTURE },
	{ label: 'Adventure', image: '/images/packages/catigories/adventure.png', value: PackageCategory.ADVENTURE },
	{ label: 'Family', image: '/images/packages/catigories/family.png', value: PackageCategory.FAMILY },
	{ label: 'Luxury', image: '/images/packages/catigories/luxury.png', value: PackageCategory.LUXURY },
];

export default function PackageList() {
	const [input, setInput] = useState(initialInput);
	const [text, setText] = useState('');
	const [country, setCountry] = useState('');
	const [city, setCity] = useState('');
	const [category, setCategory] = useState<PackageCategory | ''>('');
	const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
	const user = useReactiveVar(currentUserVar);
	const router = useRouter();
	const initialQueryApplied = useRef(false);

	const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
	const [favoriteBusyId, setFavoriteBusyId] = useState<string | null>(null);
	const [toggleSavedPackage] = useMutation(TOGGLE_SAVED_PACKAGE);
	const { data, loading, error, refetch } = useQuery(GET_TRAVEL_PACKAGES, {
		variables: { input },
		notifyOnNetworkStatusChange: true,
	});
	const savedPackagesQuery = useQuery(GET_SAVED_PACKAGES, {
		variables: { input: { page: 1, limit: 100 } },
		skip: !user,
		fetchPolicy: 'no-cache',
	});

	useEffect(() => {
		if (!router.isReady || initialQueryApplied.current) return;
		const timeout = window.setTimeout(() => {
			initialQueryApplied.current = true;
			const rawText = Array.isArray(router.query.text) ? router.query.text[0] : router.query.text;
			const rawCountry = Array.isArray(router.query.country) ? router.query.country[0] : router.query.country;
			const rawCategory = Array.isArray(router.query.category) ? router.query.category[0] : router.query.category;
			const queryCategory = Object.values(PackageCategory).includes(rawCategory as PackageCategory)
				? (rawCategory as PackageCategory)
				: undefined;
			setText(rawText ?? '');
			setCountry(rawCountry ?? '');
			setCategory(queryCategory ?? '');
			if (rawText || rawCountry || queryCategory) {
				setInput((previous) => ({
					...previous,
					page: 1,
					search: {
						text: rawText?.trim() || undefined,
						destinationCountry: rawCountry?.trim() || undefined,
						packageCategory: queryCategory,
					},
				}));
			}
		}, 0);
		return () => window.clearTimeout(timeout);
	}, [router.isReady, router.query.category, router.query.country, router.query.text]);

	useEffect(() => {
		if (!user) {
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setSavedIds(new Set());
			return;
		}
		const savedPackages = savedPackagesQuery.data?.getFavorities?.list;
		if (!savedPackages) return;
		setSavedIds(new Set(savedPackages.map((savedPackage) => savedPackage._id)));
	}, [user, savedPackagesQuery.data]);

	async function handleFavoriteToggle(packageId: string) {
		if (!user) {
			await router.push('/account/login');
			return;
		}
		if (favoriteBusyId) return;
		const wasSaved = savedIds.has(packageId);
		setFavoriteBusyId(packageId);
		setSavedIds((previous) => {
			const next = new Set(previous);
			if (wasSaved) next.delete(packageId);
			else next.add(packageId);
			return next;
		});
		try {
			await toggleSavedPackage({ variables: { packageId } });
			await savedPackagesQuery.refetch();
		} catch (failure) {
			setSavedIds((previous) => {
				const next = new Set(previous);
				if (wasSaved) next.add(packageId);
				else next.delete(packageId);
				return next;
			});
			console.error('Favorite toggle failed:', failure);
		} finally {
			setFavoriteBusyId(null);
		}
	}

	const list = data?.getTravelPackages.list ?? [];
	const counters = data?.getTravelPackages.metaCounter;
	const total = counters?.length === 0 ? 0 : counters?.[0]?.total;
	const activeFilters = filterKeys.filter((key) => input.search?.[key]);
	const appliedCategory = input.search?.packageCategory ?? '';
	const sortIndex = sorts.findIndex((sort) => sort.sort === input.sort && sort.direction === input.direction);

	function applyFilters(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setInput((previous) => ({
			...previous,
			page: 1,
			search: {
				...previous.search,
				destinationCountry: country.trim() || undefined,
				destinationCity: city.trim() || undefined,
				packageCategory: category || undefined,
			},
		}));
		setMobileFiltersOpen(false);
	}

	function resetFilters() {
		setText('');
		setCountry('');
		setCity('');
		setCategory('');
		setInput((previous) => ({ ...previous, page: 1, search: undefined }));
		setMobileFiltersOpen(false);
	}

	function removeFilter(key: FilterKey) {
		if (key === 'text') setText('');
		if (key === 'destinationCountry') setCountry('');
		if (key === 'destinationCity') setCity('');
		if (key === 'packageCategory') setCategory('');
		setInput((previous) => ({ ...previous, page: 1, search: { ...previous.search, [key]: undefined } }));
	}

	function selectHeroCategory(value: PackageCategory | '') {
		setCategory(value);
		setInput((previous) => ({
			...previous,
			page: 1,
			search: { ...previous.search, packageCategory: value || undefined },
		}));
	}

	function filterForm(mobile = false) {
		return (
			<form onSubmit={applyFilters} className="packages-filter-form">
				<div className="packages-filter-heading">
					<h2>Filters</h2>
					<div>
						<Button size="small" onClick={resetFilters}>Clear All</Button>
						{mobile ? (
							<IconButton aria-label="Close filters" onClick={() => setMobileFiltersOpen(false)}><CloseIcon /></IconButton>
						) : null}
					</div>
				</div>
				<div className="packages-filter-section">
					<h3>Destination</h3>
					<TextField
						fullWidth size="small" placeholder="Country" value={country}
						onChange={(event) => setCountry(event.target.value)}
						slotProps={{
							htmlInput: { 'aria-label': 'Destination country' },
							input: { startAdornment: <InputAdornment position="start"><PlaceOutlined /></InputAdornment> },
						}}
					/>
					<TextField
						fullWidth size="small" placeholder="City" value={city}
						onChange={(event) => setCity(event.target.value)}
						slotProps={{
							htmlInput: { 'aria-label': 'Destination city' },
							input: { startAdornment: <InputAdornment position="start"><PlaceOutlined /></InputAdornment> },
						}}
					/>
				</div>
				<div className="packages-filter-section">
					<h3>Travel Style</h3>
					<RadioGroup
						name={`${mobile ? 'mobile' : 'desktop'}-package-category`}
						value={category}
						onChange={(event) => setCategory(Object.values(PackageCategory).find((value) => value === event.target.value) ?? '')}
					>
						<FormControlLabel value="" control={<Radio size="small" />} label="All styles" />
						{Object.values(PackageCategory).map((value) => (
							<FormControlLabel key={value} value={value} control={<Radio size="small" />} label={categoryLabel(value)} />
						))}
					</RadioGroup>
				</div>
				<p className="packages-filter-note">Price, duration, and rating filters are unavailable for the current package API.</p>
				<Button fullWidth type="submit" variant="contained" startIcon={<FilterAltOutlined />}>Apply Filters</Button>
			</form>
		);
	}

	return (
		<div className="wwt-home wwt-packages">
			<section className="packages-hero" aria-labelledby="packages-title">
				<div className="home-container packages-hero-content">
					<div className="packages-hero-copy">
						<span className="packages-hero-eyebrow">Explore. Discover. Belong.</span>
						<h1 id="packages-title">Find Your<br />Next <span>Journey</span></h1>
						<p>Discover unforgettable travel experiences around the world with WWT. Explore amazing destinations, curated packages, and trusted travel experts.</p>
						<form
							className="packages-search"
							onSubmit={(event) => {
								event.preventDefault();
								setInput((previous) => ({
									...previous,
									page: 1,
									search: { ...previous.search, text: text.trim() || undefined },
								}));
							}}
						>
							<SearchIcon aria-hidden="true" />
							<input
								aria-label="Search packages"
								placeholder="Search by destination, city or package name..."
								value={text}
								onChange={(event) => setText(event.target.value)}
							/>
							<Button type="submit" variant="contained">Search</Button>
						</form>
					</div>
					<div className="packages-categories" aria-label="Package categories">
						{heroCategories.map((item) => {
							const supported = item.value !== undefined;
							const selected = supported && appliedCategory === item.value;
							return (
								<button
									key={item.label}
									type="button"
									className={selected ? 'is-selected' : undefined}
									disabled={!supported}
									aria-pressed={supported ? selected : undefined}
									title={supported ? `Filter by ${item.label}` : `${item.label} is not supported by the package API`}
									onClick={() => { if (item.value !== undefined) selectHeroCategory(item.value); }}
								>
									<span><Image src={item.image} alt="" width={52} height={52} /></span>
									<strong>{item.label}</strong>
								</button>
							);
						})}
					</div>
				</div>
			</section>

			<div className="home-container packages-content">
				<Button
					className="packages-filter-toggle" variant="contained" startIcon={<TuneIcon />}
					aria-expanded={mobileFiltersOpen} onClick={() => setMobileFiltersOpen(true)}
				>
					Filters{activeFilters.length > 0 ? ` (${activeFilters.length})` : ''}
				</Button>
				<aside className="packages-sidebar" aria-label="Package filters">{filterForm()}</aside>
				<section className="packages-results" aria-labelledby="packages-results-title" aria-busy={loading}>
					<div className="packages-results-heading">
						<div>
							<h2 id="packages-results-title">Travel Packages</h2>
							<p role="status">
								{loading
									? 'Finding your next adventure…'
									: !error && total != null
										? `${total} ${total === 1 ? 'package' : 'packages'} found`
										: 'Explore available journeys'}
							</p>
						</div>
						<TextField
							className="packages-sort" select size="small" label="Sort by" value={sortIndex}
							onChange={(event) => {
								const sort = sorts[Number(event.target.value)];
								if (sort) setInput((previous) => ({ ...previous, page: 1, sort: sort.sort, direction: sort.direction }));
							}}
						>
							{sorts.map((sort, index) => <MenuItem key={sort.label} value={index}>{sort.label}</MenuItem>)}
						</TextField>
					</div>
					{activeFilters.length > 0 ? (
						<div className="packages-chips" aria-label="Active filters">
							{activeFilters.map((key) => (
								<Chip
									key={key}
									label={key === 'packageCategory' ? categoryLabel(input.search?.[key] ?? '') : input.search?.[key]}
									onDelete={() => removeFilter(key)}
								/>
							))}
						</div>
					) : null}
					{loading ? (
						<div className="packages-grid" aria-label="Loading packages">
							{Array.from({ length: initialInput.limit }, (_, index) => (
								<div className="packages-skeleton" key={index}>
									<Skeleton variant="rectangular" className="packages-skeleton-image" />
									<div><Skeleton width="60%" /><Skeleton height={32} /><Skeleton width="45%" /><Skeleton width="70%" /></div>
								</div>
							))}
						</div>
					) : error ? (
						<Alert severity="error" action={<Button color="inherit" onClick={() => void refetch().catch(() => undefined)}>Retry</Button>}>
							Unable to load packages. Please try again.
						</Alert>
					) : list.length === 0 ? (
						<div className="packages-state" role="status">
							<SearchIcon /><h2>No packages found</h2>
							<p>{activeFilters.length ? 'Try a different search or clear your filters.' : 'New journeys will appear here when available.'}</p>
							{activeFilters.length > 0 ? <Button onClick={resetFilters}>Clear Filters</Button> : null}
						</div>
					) : (
						<div className="packages-grid">
							{list.map((item) => (
								<PackageCard
									key={item._id} item={item} variant="listing"
									favoriteAction={{
										active: savedIds.has(item._id),
										disabled: favoriteBusyId === item._id,
										onToggle: () => void handleFavoriteToggle(item._id),
									}}
								/>
							))}
						</div>
					)}
					{!loading && !error && total != null && total > input.limit ? (
						<Pagination
							className="packages-pagination" count={Math.ceil(total / input.limit)} page={input.page}
							onChange={(_, page) => setInput((previous) => ({ ...previous, page }))} color="primary"
						/>
					) : null}
				</section>
			</div>

			<div className="home-container packages-offer-wrap">
				<section className="packages-offer" aria-labelledby="packages-offer-title">
					<div>
						<span>Plan your next escape</span>
						<h2 id="packages-offer-title">Make Your Dream Trip Happen</h2>
						<p>Discover active WWT travel packages and choose the journey that fits you.</p>
					</div>
					<Button component={Link} href="#packages-results-title" variant="contained">Explore Packages</Button>
				</section>
			</div>

			<Drawer
				anchor="right" open={mobileFiltersOpen} onClose={() => setMobileFiltersOpen(false)}
				slotProps={{ paper: { className: 'packages-filter-drawer' } }}
			>
				{filterForm(true)}
			</Drawer>
		</div>
	);
}
