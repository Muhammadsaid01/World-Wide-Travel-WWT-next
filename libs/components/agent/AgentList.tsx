import { useState } from 'react';
import { useQuery } from '@apollo/client';
import {
	Alert,
	Button,
	MenuItem,
	Select,
	Pagination,
	Paper,
	Skeleton,
	Snackbar,
	TextField,
	Typography,
} from '@mui/material';
import Search from '@mui/icons-material/Search';
import VerifiedOutlined from '@mui/icons-material/VerifiedOutlined';
import ReviewsOutlined from '@mui/icons-material/ReviewsOutlined';
import SupportAgentOutlined from '@mui/icons-material/SupportAgentOutlined';
import { GET_AGENTS } from '@/apollo/user/query';
import { AgentVerificationStatus } from '@/libs/enums/member.enum';
import AgentCard from './AgentCard';
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
		description: 'WWT agents can help travelers explore packages and travel options.',
		icon: SupportAgentOutlined,
	},
];
export default function AgentList() {
	const [draft, setDraft] = useState('');
	const [text, setText] = useState('');
	const [verified, setVerified] = useState(false);
	const [sort, setSort] = useState('agentRank');
	const [page, setPage] = useState(1);
	const [notice, setNotice] = useState('');
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
	function clearFilters() {
		setDraft('');
		setText('');
		setVerified(false);
		setSort('agentRank');
		setPage(1);
	}
	return (
		<div className="agents-page">
			<section className="agents-hero">
				<div className="agents-hero-content">
					<span className="agents-eyebrow">Meet your next travel guide</span>
					<Typography component="h1">Find Your Travel Expert</Typography>
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
							placeholder="Search agents by name, company or location..."
							value={draft}
							onChange={(event) => setDraft(event.target.value)}
							slotProps={{ htmlInput: { 'aria-label': 'Search agents by name, company or location' } }}
						/>
						<Button type="submit" variant="contained" startIcon={<Search />}>
							Search
						</Button>
					</form>
				</div>
			</section>
			<section className="agents-list-section" aria-labelledby="travel-agents-title">
				<header className="agents-section-head">
					<div>
						<Typography component="h2" id="travel-agents-title">
							Travel Agents
						</Typography>
						{loading ? (
							<Skeleton width={120} />
						) : !error && result ? (
							<Typography color="text.secondary" role="status">
								{total} agents found
							</Typography>
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
							{sorts.map((option) => (
								<MenuItem key={option.value} value={option.value}>
									{option.label}
								</MenuItem>
							))}
						</Select>
					</div>
				</header>
				<div className="agents-filter-row">
					<Select
						className="agents-filter"
						size="small"
						inputProps={{ 'aria-label': 'Verification filter' }}
						value={verified ? 'verified' : 'all'}
						onChange={(event) => {
							setVerified(event.target.value === 'verified');
							setPage(1);
						}}
					>
						<MenuItem value="all">All Agents</MenuItem>
						<MenuItem value="verified">Verified Only</MenuItem>
					</Select>
					<Button
						className="agents-become-button"
						variant="contained"
						startIcon={<VerifiedOutlined />}
						onClick={() => setNotice('Agent applications are not available yet.')}
					>
						Become Agent
					</Button>
				</div>
				<div aria-busy={loading}>
					{loading ? (
						<div className="agents-grid" aria-label="Loading agents">
							{Array.from({ length: LIMIT }, (_, index) => (
								<Paper className="agent-card" key={index}>
									<Skeleton variant="rectangular" className="agent-card-image" />
									<div className="agent-card-content">
										<Skeleton width="65%" height={32} />
										<Skeleton width="45%" />
										<Skeleton height={100} />
										<Skeleton height={48} />
									</div>
								</Paper>
							))}
						</div>
					) : error ? (
						<Alert
							severity="error"
							action={
								<Button
									onClick={() => {
										void refetch().catch(() => undefined);
									}}
								>
									Retry
								</Button>
							}
						>
							Agents could not be loaded.
						</Alert>
					) : !result?.list.length ? (
						<Paper className="agents-empty">
							<Typography component="h3">
								{text || verified ? 'No agents match your search.' : 'No agents found.'}
							</Typography>
							{(text || verified || sort !== 'agentRank' || page > 1) && (
								<Button onClick={clearFilters}>Clear filters</Button>
							)}
						</Paper>
					) : (
						<div className="agents-grid">
							{result.list.map((agent) => (
								<AgentCard key={agent._id} agent={agent} />
							))}
						</div>
					)}
				</div>
				{!loading && !error && total > LIMIT && (
					<Pagination
						className="agents-pagination"
						color="primary"
						page={page}
						count={Math.ceil(total / LIMIT)}
						onChange={(_, value) => {
							setPage(value);
							document.getElementById('travel-agents-title')?.scrollIntoView({ block: 'start' });
						}}
					/>
				)}
			</section>
			<section className="agents-benefits">
				<Typography component="h2">Why Book with WWT Agents</Typography>
				<div>
					{benefits.map(({ title, description, icon: Icon }) => (
						<article key={title}>
							<Icon />
							<Typography component="h3">{title}</Typography>
							<Typography color="text.secondary">{description}</Typography>
						</article>
					))}
				</div>
			</section>
			<Snackbar open={Boolean(notice)} autoHideDuration={6000} onClose={() => setNotice('')}>
				<Alert severity="info" onClose={() => setNotice('')}>
					{notice}
				</Alert>
			</Snackbar>
		</div>
	);
}
