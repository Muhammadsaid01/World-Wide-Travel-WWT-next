import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useReactiveVar } from '@apollo/client';
import {
	Alert,
	Button,
	IconButton,
	InputAdornment,
	MenuItem,
	Pagination,
	Paper,
	Select,
	Skeleton,
	Snackbar,
	TextField,
	Typography,
} from '@mui/material';
import Close from '@mui/icons-material/Close';
import ReviewsOutlined from '@mui/icons-material/ReviewsOutlined';
import Search from '@mui/icons-material/Search';
import SupportAgentOutlined from '@mui/icons-material/SupportAgentOutlined';
import VerifiedOutlined from '@mui/icons-material/VerifiedOutlined';
import { currentUserVar } from '@/apollo/store';
import { GET_AGENTS } from '@/apollo/user/query';
import { AgentVerificationStatus, MemberType } from '@/libs/enums/member.enum';
import AgentCard, { type AgentCardNotice } from './AgentCard';

const LIMIT = 6;
const sorts = [
	{ value: 'agentRank', label: 'Recommended' },
	{ value: 'agentRating', label: 'Highest Rated' },
	{ value: 'agentReviewCount', label: 'Most Reviews' },
	{ value: 'createdAt', label: 'Newest' },
];
const benefits = [
	{
		title: 'Verified Professionals',
		description: 'Approved agents are clearly identified so travelers can make informed choices.',
		icon: VerifiedOutlined,
	},
	{
		title: 'Trusted Reviews',
		description: 'Agent ratings and review counts help travelers compare available experts.',
		icon: ReviewsOutlined,
	},
	{
		title: 'Expert Support',
		description: 'WWT agents can help travelers explore packages and available travel options.',
		icon: SupportAgentOutlined,
	},
];

export default function AgentList() {
	const user = useReactiveVar(currentUserVar);
	const [draft, setDraft] = useState('');
	const [text, setText] = useState('');
	const [verified, setVerified] = useState(false);
	const [sort, setSort] = useState('agentRank');
	const [page, setPage] = useState(1);
	const [notice, setNotice] = useState<AgentCardNotice | null>(null);
	const { data, loading, error, refetch } = useQuery(GET_AGENTS, {
		variables: {
			input: {
				page,
				limit: LIMIT,
				sort,
				direction: 'DESC',
				search: {
					...(text ? { text } : {}),
					...(verified ? { verificationStatus: AgentVerificationStatus.APPROVED } : {}),
				},
			},
		},
		fetchPolicy: 'network-only',
		notifyOnNetworkStatusChange: true,
	});
	const result = data?.getAgents;
	const total = result?.metaCounter?.[0]?.total ?? 0;
	const showBecomeAgent = !user || user.memberType === MemberType.USER;

	function clearSearch() {
		setDraft('');
		setText('');
		setPage(1);
	}

	function clearFilters() {
		setDraft('');
		setText('');
		setVerified(false);
		setSort('agentRank');
		setPage(1);
	}

	return (
		<div className="agents-page">
			<section className="agents-hero" aria-labelledby="agents-page-title">
				<div className="agents-hero-content">
					<span className="agents-eyebrow">Meet your next travel guide</span>
					<Typography component="h1" id="agents-page-title">
						Find Your<br />Travel <span>Expert</span>
					</Typography>
					<Typography>Connect with trusted travel experts and discover your perfect journey.</Typography>
					<form
						className="agents-search"
						onSubmit={(event) => {
							event.preventDefault();
							setText(draft.trim());
							setPage(1);
						}}
					>
						<TextField
							fullWidth
							placeholder="Search by name, company, location or description..."
							value={draft}
							onChange={(event) => setDraft(event.target.value)}
							slotProps={{
								htmlInput: { 'aria-label': 'Search agents by name, company, location or description' },
								input: {
									startAdornment: <InputAdornment position="start"><Search aria-hidden="true" /></InputAdornment>,
									endAdornment: draft || text ? (
										<InputAdornment position="end">
											<IconButton size="small" aria-label="Clear agent search" onClick={clearSearch}><Close /></IconButton>
										</InputAdornment>
									) : undefined,
								},
							}}
						/>
						<Button type="submit" variant="contained">Search</Button>
					</form>
				</div>
			</section>

			<section className="agents-list-section" aria-labelledby="travel-agents-title">
				<header className="agents-section-head">
					<div>
						<Typography component="h2" id="travel-agents-title">Travel Agents</Typography>
						{loading ? (
							<Skeleton width={120} />
						) : !error && result ? (
							<Typography color="text.secondary" role="status">{total} agents found</Typography>
						) : null}
					</div>
					<div className="agents-sort">
						<span id="agents-sort-label">Sort by:</span>
						<Select
							labelId="agents-sort-label"
							size="small"
							value={sort}
							onChange={(event) => {
								if (sorts.some((option) => option.value === event.target.value)) {
									setSort(event.target.value);
									setPage(1);
								}
							}}
						>
							{sorts.map((option) => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}
						</Select>
					</div>
				</header>

				<div className="agents-filter-row">
					<div className="agents-filter-controls">
						<span>Filter:</span>
						<Select
							className="agents-filter"
							size="small"
							inputProps={{ 'aria-label': 'Agent verification filter' }}
							value={verified ? 'verified' : 'all'}
							onChange={(event) => {
								setVerified(event.target.value === 'verified');
								setPage(1);
							}}
						>
							<MenuItem value="all">All agents</MenuItem>
							<MenuItem value="verified">Verified only</MenuItem>
						</Select>
						{(text || verified) ? <Button className="agents-clear-button" onClick={clearFilters}>Clear filters</Button> : null}
					</div>
					{showBecomeAgent ? (
						<Button
							component={Link}
							href="/mypage/agent-request"
							className="agents-become-button"
							variant="contained"
							startIcon={<VerifiedOutlined />}
						>
							Become Agent
						</Button>
					) : null}
				</div>

				<div aria-busy={loading}>
					{loading ? (
						<div className="agents-grid" aria-label="Loading agents">
							{Array.from({ length: LIMIT }, (_, index) => (
								<Paper className="agent-card agent-card-skeleton" key={index} elevation={0}>
									<div className="agent-card-media">
										<Skeleton variant="rectangular" className="agent-card-image" />
									</div>
									<div className="agent-card-content">
										<Skeleton width="72%" height={30} />
										<Skeleton width="48%" />
										<Skeleton height={92} />
										<Skeleton height={44} />
									</div>
								</Paper>
							))}
						</div>
					) : error ? (
						<Alert
							severity="error"
							action={<Button onClick={() => void refetch().catch(() => undefined)}>Retry</Button>}
						>
							Agents could not be loaded.
						</Alert>
					) : !result?.list.length ? (
						<Paper className="agents-empty" elevation={0}>
							<Typography component="h3">{text || verified ? 'No agents match your search.' : 'No agents found.'}</Typography>
							{(text || verified || sort !== 'agentRank' || page > 1) ? <Button onClick={clearFilters}>Clear filters</Button> : null}
						</Paper>
					) : (
						<div className="agents-grid">
							{result.list.map((agent) => <AgentCard key={agent._id} agent={agent} onNotice={setNotice} />)}
						</div>
					)}
				</div>

				{!loading && !error && total > LIMIT ? (
					<Pagination
						className="agents-pagination"
						page={page}
						count={Math.ceil(total / LIMIT)}
						onChange={(_, value) => {
							setPage(value);
							document.getElementById('travel-agents-title')?.scrollIntoView({ block: 'start' });
						}}
					/>
				) : null}
			</section>

			<section className="agents-benefits" aria-labelledby="agents-benefits-title">
				<Typography component="h2" id="agents-benefits-title">Why Book with WWT Agents</Typography>
				<div>
					{benefits.map(({ title, description, icon: Icon }) => (
						<article key={title}>
							<span className="agents-benefit-icon"><Icon aria-hidden="true" /></span>
							<Typography component="h3">{title}</Typography>
							<Typography color="text.secondary">{description}</Typography>
						</article>
					))}
				</div>
			</section>

			<Snackbar open={Boolean(notice)} autoHideDuration={6000} onClose={() => setNotice(null)}>
				<Alert severity={notice?.severity ?? 'info'} onClose={() => setNotice(null)}>{notice?.message}</Alert>
			</Snackbar>
		</div>
	);
}
