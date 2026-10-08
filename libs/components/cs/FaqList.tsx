import { GET_PUBLIC_FAQS, type PublicFaqsInput } from '@/apollo/user/query';
import { FaqCategory } from '@/libs/enums/system.enum';
import { useQuery } from '@apollo/client';
import SearchOutlined from '@mui/icons-material/SearchOutlined';
import { Alert, Button, InputAdornment, Pagination, Skeleton, TextField, Typography } from '@mui/material';
import { type ChangeEvent, useEffect, useMemo, useState } from 'react';
import FaqDetail from './FaqDetail';
import { FAQ_CATEGORY_OPTIONS } from './faqState';

const PAGE_SIZE = 10;
const SEARCH_DELAY = 350;
const CATEGORIES: { value: 'ALL' | FaqCategory; label: string }[] = [
	{ value: 'ALL', label: 'All' },
	...FAQ_CATEGORY_OPTIONS,
];

function FaqSkeleton() {
	return (
		<div className="faq-skeleton" aria-label="Loading frequently asked questions">
			{Array.from({ length: 6 }, (_, index) => (
				<Skeleton key={index} variant="rounded" height={74} />
			))}
		</div>
	);
}

export default function FaqList() {
	const [page, setPage] = useState(1);
	const [category, setCategory] = useState<'ALL' | FaqCategory>('ALL');
	const [search, setSearch] = useState('');
	const [debouncedSearch, setDebouncedSearch] = useState('');
	const [expandedId, setExpandedId] = useState('');

	useEffect(() => {
		const timer = window.setTimeout(() => {
			setDebouncedSearch(search.trim());
			setPage(1);
			setExpandedId('');
		}, SEARCH_DELAY);
		return () => window.clearTimeout(timer);
	}, [search]);

	const variables = useMemo<{ input: PublicFaqsInput }>(
		() => ({
			input: {
				page,
				limit: PAGE_SIZE,
				sort: 'faqOrder',
				direction: 'ASC',
				search: {
					faqCategory: category === 'ALL' ? undefined : category,
					text: debouncedSearch || undefined,
				},
			},
		}),
		[category, debouncedSearch, page],
	);

	const { data, loading, error, refetch } = useQuery(GET_PUBLIC_FAQS, {
		variables,
		fetchPolicy: 'network-only',
		notifyOnNetworkStatusChange: true,
	});
	const faqs = data?.getFaqs.list ?? [];
	const total = data?.getFaqs.metaCounter?.[0]?.total ?? 0;
	const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

	function selectCategory(value: 'ALL' | FaqCategory) {
		setCategory(value);
		setPage(1);
		setExpandedId('');
	}

	function changePage(_: ChangeEvent<unknown>, value: number) {
		setPage(value);
		setExpandedId('');
		document.querySelector('.faq-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}

	return (
		<div className="faq-page">
			<section className="faq-hero" aria-labelledby="faq-page-title">
				<div className="faq-hero-content">
					<Typography component="p" className="faq-kicker">
						WWT SUPPORT
					</Typography>
					<Typography component="h1" id="faq-page-title">
						Help Center
					</Typography>
					<Typography component="p">
						Find answers to common questions about travel packages, bookings, payments and more.
					</Typography>
					<TextField
						fullWidth
						value={search}
						placeholder="Search questions and answers"
						onChange={(event) => setSearch(event.target.value)}
						slotProps={{
							input: {
								startAdornment: (
									<InputAdornment position="start">
										<SearchOutlined />
									</InputAdornment>
								),
								endAdornment: search ? (
									<InputAdornment position="end">
										<Button size="small" onClick={() => setSearch('')}>
											Clear
										</Button>
									</InputAdornment>
								) : undefined,
							},
							htmlInput: { maxLength: 200, 'aria-label': 'Search frequently asked questions' },
						}}
					/>
				</div>
			</section>

			<section className="faq-content" aria-labelledby="faq-results-title">
				<div className="faq-category-tabs" role="group" aria-label="FAQ categories">
					{CATEGORIES.map((item) => (
						<Button
							key={item.value}
							variant={category === item.value ? 'contained' : 'outlined'}
							aria-pressed={category === item.value}
							onClick={() => selectCategory(item.value)}
						>
							{item.label}
						</Button>
					))}
				</div>

				<div className="faq-results">
					<div className="faq-results-heading">
						<div>
							<Typography component="p" className="faq-kicker">
								FREQUENTLY ASKED QUESTIONS
							</Typography>
							<Typography component="h2" id="faq-results-title">
								{category === 'ALL'
									? 'How can we help?'
									: `${CATEGORIES.find((item) => item.value === category)?.label} questions`}
							</Typography>
						</div>
						{!loading && !error ? (
							<span>
								{total} {total === 1 ? 'answer' : 'answers'}
							</span>
						) : null}
					</div>

					{error ? (
						<Alert severity="error" action={<Button onClick={() => void refetch()}>Retry</Button>}>
							Frequently asked questions could not be loaded.
						</Alert>
					) : loading && !data ? (
						<FaqSkeleton />
					) : faqs.length === 0 ? (
						<div className="faq-empty">
							<Typography component="h2">No answers found</Typography>
							<Typography>
								{debouncedSearch || category !== 'ALL'
									? 'Try a different search or category.'
									: 'No published FAQs are available yet.'}
							</Typography>
							{debouncedSearch || category !== 'ALL' ? (
								<Button
									onClick={() => {
										setSearch('');
										selectCategory('ALL');
									}}
								>
									Clear filters
								</Button>
							) : null}
						</div>
					) : (
						<div className="faq-accordion-list">
							{faqs.map((faq) => (
								<FaqDetail
									key={faq._id}
									faq={faq}
									expanded={expandedId === faq._id}
									onChange={() => setExpandedId((current) => (current === faq._id ? '' : faq._id))}
								/>
							))}
						</div>
					)}

					{pageCount > 1 ? <Pagination page={page} count={pageCount} onChange={changePage} color="primary" /> : null}
				</div>
			</section>
		</div>
	);
}
