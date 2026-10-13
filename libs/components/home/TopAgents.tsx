import { GET_AGENTS, type AgentListItem } from '@/apollo/user/query';
import { memberName } from '@/libs/components/community/communityState';
import { packageImageUrl } from '@/libs/components/package/PackageImage';
import { AgentVerificationStatus } from '@/libs/enums/member.enum';
import { useQuery } from '@apollo/client';
import StarRounded from '@mui/icons-material/StarRounded';
import VerifiedRounded from '@mui/icons-material/VerifiedRounded';
import { Alert, Avatar, Button, Skeleton } from '@mui/material';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

function HomeAgentCard({ agent }: { agent: AgentListItem }) {
	const { t } = useTranslation('agents');
	const name = agent.memberData ? memberName(agent.memberData) : agent.companyName;
	return (
		<article className="home-agent-card">
			<Avatar src={packageImageUrl(agent.memberData?.memberImage)} alt={name}>{name.charAt(0).toUpperCase()}</Avatar>
			<h3>{name} <VerifiedRounded aria-label={t('card.verifiedAgent')} /></h3>
			<p className="home-agent-company">{agent.companyName}</p>
			<div className="home-agent-stats">
				{agent.agentReviewCount > 0 && <span><StarRounded /> {agent.agentRating.toFixed(1)} {t('card.reviews', { count: agent.agentReviewCount })}</span>}
				<span>{t('card.packages', { count: agent.agentPackageCount })}</span>
			</div>
			<Button component={Link} href={`/agent/${agent._id}`} variant="outlined">{t('card.view')}</Button>
		</article>
	);
}

export default function TopAgents() {
	const { t } = useTranslation(['home', 'common']);
	const query = useQuery(GET_AGENTS, { variables: { input: { page: 1, limit: 4, sort: 'agentRank', direction: 'DESC', search: { verificationStatus: AgentVerificationStatus.APPROVED } } } });
	const agents = query.data?.getAgents.list ?? [];
	return (
		<section className="home-section home-agents" aria-labelledby="home-agents-title">
			<div className="home-section-heading"><div><span className="home-section-kicker">{t('agents.eyebrow')}</span><h2 id="home-agents-title">{t('agents.title')}</h2></div><Link href="/agent">{t('agents.all')}</Link></div>
			{query.loading ? <div className="home-grid-four">{Array.from({ length: 4 }, (_, index) => <Skeleton key={index} variant="rounded" height={390} />)}</div>
				: query.error ? <Alert severity="info" action={<Button onClick={() => void query.refetch()}>{t('actions.retry', { ns: 'common' })}</Button>}>{t('agents.error')}</Alert>
				: agents.length === 0 ? <div className="home-empty-state">{t('agents.empty')}</div>
				: <div className="home-grid-four">{agents.map((agent) => <HomeAgentCard key={agent._id} agent={agent} />)}</div>}
		</section>
	);
}
