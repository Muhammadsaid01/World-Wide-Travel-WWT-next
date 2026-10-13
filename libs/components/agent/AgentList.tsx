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
import { useTranslation } from 'react-i18next';

const LIMIT = 6;
const sorts = [
	{ value: 'agentRank', labelKey: 'sort.recommended' },
	{ value: 'agentRating', labelKey: 'sort.rating' },
	{ value: 'agentReviewCount', labelKey: 'sort.reviews' },
	{ value: 'createdAt', labelKey: 'sort.newest' },
];
const benefits = [
	{
		titleKey: 'benefits.verifiedTitle',
		descriptionKey: 'benefits.verifiedText',
		icon: VerifiedOutlined,
	},
	{
		titleKey: 'benefits.reviewsTitle',
		descriptionKey: 'benefits.reviewsText',
		icon: ReviewsOutlined,
	},
	{
		titleKey: 'benefits.supportTitle',
		descriptionKey: 'benefits.supportText',
		icon: SupportAgentOutlined,
	},
];

export default function AgentList() {
	const { t } = useTranslation(['agents', 'common']);
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
					<span className="agents-eyebrow">{t('hero.eyebrow')}</span>
					<Typography component="h1" id="agents-page-title">
						{t('hero.titleBefore')}<br /><span>{t('hero.titleAccent')}</span>
					</Typography>
					<Typography>{t('hero.description')}</Typography>
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
							placeholder={t('hero.placeholder')}
							value={draft}
							onChange={(event) => setDraft(event.target.value)}
							slotProps={{
								htmlInput: { 'aria-label': t('hero.searchLabel') },
								input: {
									startAdornment: <InputAdornment position="start"><Search aria-hidden="true" /></InputAdornment>,
									endAdornment: draft || text ? (
										<InputAdornment position="end">
										<IconButton size="small" aria-label={t('actions.clear', { ns: 'common' })} onClick={clearSearch}><Close /></IconButton>
										</InputAdornment>
									) : undefined,
								},
							}}
						/>
						<Button type="submit" variant="contained">{t('actions.search', { ns: 'common' })}</Button>
					</form>
				</div>
			</section>

			<section className="agents-list-section" aria-labelledby="travel-agents-title">
				<header className="agents-section-head">
					<div>
						<Typography component="h2" id="travel-agents-title">{t('list.title')}</Typography>
						{loading ? (
							<Skeleton width={120} />
						) : !error && result ? (
							<Typography color="text.secondary" role="status">{t('list.count', { count: total })}</Typography>
						) : null}
					</div>
					<div className="agents-sort">
						<span id="agents-sort-label">{t('sort.label', { ns: 'common' })}</span>
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
							{sorts.map((option) => <MenuItem key={option.value} value={option.value}>{t(option.labelKey)}</MenuItem>)}
						</Select>
					</div>
				</header>

				<div className="agents-filter-row">
					<div className="agents-filter-controls">
						<span>{t('list.filter')}</span>
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
							<MenuItem value="all">{t('list.all')}</MenuItem>
							<MenuItem value="verified">{t('list.verified')}</MenuItem>
						</Select>
						{(text || verified) ? <Button className="agents-clear-button" onClick={clearFilters}>{t('list.clear')}</Button> : null}
					</div>
					{showBecomeAgent ? (
						<Button
							component={Link}
							href="/mypage/agent-request"
							className="agents-become-button"
							variant="contained"
							startIcon={<VerifiedOutlined />}
						>
							{t('list.become')}
						</Button>
					) : null}
				</div>

				<div aria-busy={loading}>
					{loading ? (
						<div className="agents-grid" aria-label={t('list.loading')}>
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
							action={<Button onClick={() => void refetch().catch(() => undefined)}>{t('actions.retry', { ns: 'common' })}</Button>}
						>
							{t('list.error')}
						</Alert>
					) : !result?.list.length ? (
						<Paper className="agents-empty" elevation={0}>
							<Typography component="h3">{t(text || verified ? 'list.emptySearch' : 'list.empty')}</Typography>
							{(text || verified || sort !== 'agentRank' || page > 1) ? <Button onClick={clearFilters}>{t('list.clear')}</Button> : null}
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
				<Typography component="h2" id="agents-benefits-title">{t('benefits.title')}</Typography>
				<div>
					{benefits.map(({ titleKey, descriptionKey, icon: Icon }) => (
						<article key={titleKey}>
							<span className="agents-benefit-icon"><Icon aria-hidden="true" /></span>
							<Typography component="h3">{t(titleKey)}</Typography>
							<Typography color="text.secondary">{t(descriptionKey)}</Typography>
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
