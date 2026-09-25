import { useState, type FormEvent } from 'react';
import { useQuery } from '@apollo/client';
import { Alert, Button, Chip, MenuItem, Pagination, Skeleton, TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import TuneIcon from '@mui/icons-material/Tune';
import { GET_TRAVEL_PACKAGES, type PackageListInput } from '@/apollo/user/query';
import { PackageCategory } from '@/libs/enums/package.enum';
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
const categoryLabel = (value: string) => value.charAt(0) + value.slice(1).toLowerCase();

export default function PackageList() {
	const [input, setInput] = useState(initialInput);
	const [text, setText] = useState('');
	const [country, setCountry] = useState('');
	const [city, setCity] = useState('');
	const [category, setCategory] = useState<PackageCategory | ''>('');
	const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
	const { data, loading, error, refetch } = useQuery(GET_TRAVEL_PACKAGES, {
		variables: { input },
		notifyOnNetworkStatusChange: true,
	});
	const list = data?.getTravelPackages.list ?? [];
	const counters = data?.getTravelPackages.metaCounter;
	const total = counters?.length === 0 ? 0 : counters?.[0]?.total;
	const activeFilters = filterKeys.filter((key) => input.search?.[key]);
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
	}

	function removeFilter(key: FilterKey) {
		if (key === 'text') setText('');
		if (key === 'destinationCountry') setCountry('');
		if (key === 'destinationCity') setCity('');
		if (key === 'packageCategory') setCategory('');
		setInput((previous) => ({ ...previous, page: 1, search: { ...previous.search, [key]: undefined } }));
	}

	return (
		<div className="wwt-home wwt-packages">
			<section className="packages-hero" aria-labelledby="packages-title">
				<div className="home-container">
					<h1 id="packages-title">Explore Travel Packages</h1>
					<p>Find the perfect journey for your next adventure.</p>
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
						<Button type="submit" variant="contained">
							Search
						</Button>
					</form>
				</div>
			</section>
			<div className="home-container packages-content">
				<Button
					className="packages-filter-toggle"
					variant="outlined"
					startIcon={<TuneIcon />}
					aria-expanded={mobileFiltersOpen}
					aria-controls="packages-filters"
					onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
				>
					Filters{activeFilters.length > 0 ? ` (${activeFilters.length})` : ''}
				</Button>
				<aside
					id="packages-filters"
					className={`packages-sidebar${mobileFiltersOpen ? ' is-open' : ''}`}
					aria-label="Package filters"
				>
					<form onSubmit={applyFilters}>
						<div className="packages-filter-heading">
							<h2>Filters</h2>
							<Button size="small" onClick={resetFilters}>
								Clear Filters
							</Button>
						</div>
						<div className="packages-filter-section">
							<h3>Destination</h3>
							<TextField
								fullWidth
								size="small"
								label="Country"
								value={country}
								onChange={(event) => setCountry(event.target.value)}
							/>
							<TextField
								fullWidth
								size="small"
								label="City"
								value={city}
								onChange={(event) => setCity(event.target.value)}
							/>
						</div>
						<div className="packages-filter-section">
							<h3>Travel Style</h3>
							<TextField
								fullWidth
								size="small"
								select
								label="Category"
								value={category}
								onChange={(event) =>
									setCategory(Object.values(PackageCategory).find((value) => value === event.target.value) ?? '')
								}
							>
								<MenuItem value="">All categories</MenuItem>
								{Object.values(PackageCategory).map((value) => (
									<MenuItem key={value} value={value}>
										{categoryLabel(value)}
									</MenuItem>
								))}
							</TextField>
						</div>
						{/* Duration/rating filters are unsupported. Price ranges have no currency filter;
						    periodsRange filters creation dates, not departure dates. Omit those controls. */}
						<Button fullWidth type="submit" variant="contained">
							Apply Filters
						</Button>
					</form>
				</aside>
				<section className="packages-results" aria-labelledby="packages-results-title" aria-busy={loading}>
					<div className="packages-results-heading">
						<div>
							<h2 id="packages-results-title">Travel Packages</h2>
							<p role="status">
								{loading
									? 'Finding your next adventure…'
									: !error && total != null
										? `${total} packages found`
										: 'Explore available journeys'}
							</p>
						</div>
						<TextField
							className="packages-sort"
							select
							size="small"
							label="Sort by"
							value={sortIndex}
							onChange={(event) => {
								const sort = sorts[Number(event.target.value)];
								if (sort)
									setInput((previous) => ({ ...previous, page: 1, sort: sort.sort, direction: sort.direction }));
							}}
						>
							{sorts.map((sort, index) => (
								<MenuItem key={sort.label} value={index}>
									{sort.label}
								</MenuItem>
							))}
						</TextField>
					</div>
					{activeFilters.length > 0 && (
						<div className="packages-chips" aria-label="Active filters">
							{activeFilters.map((key) => (
								<Chip
									key={key}
									label={key === 'packageCategory' ? categoryLabel(input.search?.[key] ?? '') : input.search?.[key]}
									onDelete={() => removeFilter(key)}
								/>
							))}
						</div>
					)}
					{loading ? (
						<div className="packages-grid" aria-label="Loading packages">
							{Array.from({ length: initialInput.limit }, (_, index) => (
								<div className="packages-skeleton" key={index}>
									<Skeleton variant="rectangular" className="packages-skeleton-image" />
									<div>
										<Skeleton width="60%" />
										<Skeleton height={32} />
										<Skeleton width="45%" />
										<Skeleton width="70%" />
									</div>
								</div>
							))}
						</div>
					) : error ? (
						<Alert
							severity="error"
							action={
								<Button
									color="inherit"
									onClick={() => {
										void refetch().catch(() => undefined);
									}}
								>
									Retry
								</Button>
							}
						>
							Unable to load packages. Please try again.
						</Alert>
					) : list.length === 0 ? (
						<div className="packages-state" role="status">
							<SearchIcon />
							<h2>No packages found</h2>
							<p>
								{activeFilters.length
									? 'Try a different search or clear your filters.'
									: 'New journeys will appear here when available.'}
							</p>
							{activeFilters.length > 0 && <Button onClick={resetFilters}>Clear Filters</Button>}
						</div>
					) : (
						<div className="packages-grid">
							{list.map((item) => (
								<PackageCard key={item._id} item={item} />
							))}
						</div>
					)}
					{!loading && !error && total != null && total > 0 && (
						<Pagination
							className="packages-pagination"
							count={Math.ceil(total / input.limit)}
							page={input.page}
							onChange={(_, page) => setInput((previous) => ({ ...previous, page }))}
							color="primary"
						/>
					)}
				</section>
			</div>
		</div>
	);
}
