import { useRef, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { Alert, Avatar, Breadcrumbs, Button, Chip, Paper, Skeleton, Snackbar, Typography } from '@mui/material';
import Verified from '@mui/icons-material/Verified';
import EmailOutlined from '@mui/icons-material/EmailOutlined';
import { currentUserVar } from '@/apollo/store';
import { GET_AGENT, GET_MEMBER_FOLLOW_STATE, type AgentDetailData } from '@/apollo/user/query';
import { CREATE_CONVERSATION, SUBSCRIBE_MEMBER, UNSUBSCRIBE_MEMBER } from '@/apollo/user/mutation';
import { AgentVerificationStatus } from '@/libs/enums/member.enum';
import { PublicAgentPackages, PublicArticles, PublicConnections } from './AgentProfileTabs';
import { packageImageUrl } from '../package/PackageImage';

function Profile({ agent, userId }: { agent: AgentDetailData; userId?: string }) {
	const router = useRouter();
	const member = agent.memberData;
	const name = member?.memberFullName || member?.memberNick || agent.companyName;
	const location = [member?.memberCity, member?.memberCountry].filter(Boolean).join(', ') || agent.officeAddress;
	const self = userId === agent.memberId;
	const approved = agent.verificationStatus === AgentVerificationStatus.APPROVED;
	const [followBusy, setFollowBusy] = useState(false);
	const [messageBusy, setMessageBusy] = useState(false);
	const followLock = useRef(false);
	const messageLock = useRef(false);
	const [actionError, setActionError] = useState('');
	const [notice, setNotice] = useState('');
	const follow = useQuery(GET_MEMBER_FOLLOW_STATE, {
		variables: { memberId: agent.memberId },
		skip: !userId || self,
		fetchPolicy: 'no-cache',
		notifyOnNetworkStatusChange: true,
	});
	const [subscribe] = useMutation(SUBSCRIBE_MEMBER);
	const [unsubscribe] = useMutation(UNSUBSCRIBE_MEMBER);
	const [createConversation] = useMutation(CREATE_CONVERSATION);
	const isFollowing = follow.data?.getMember.meFollowed?.[0]?.myFollowing ?? false;
	async function toggleFollow() {
		if (!currentUserVar()?._id) {
			await router.push('/account/login');
			return;
		}
		if (self || followLock.current || follow.loading || follow.error || !follow.data) return;
		followLock.current = true;
		setFollowBusy(true);
		setActionError('');
		let changed = false;
		try {
			await (isFollowing ? unsubscribe : subscribe)({ variables: { input: agent.memberId } });
			changed = true;
			await follow.refetch();
		} catch (error) {
			setActionError(
				`${changed ? 'Follow updated, but refreshing its state failed. ' : ''}${error instanceof Error ? error.message : 'Unable to update follow status.'}`,
			);
		} finally {
			followLock.current = false;
			setFollowBusy(false);
		}
	}
	async function message() {
		if (!currentUserVar()?._id) {
			await router.push('/account/login');
			return;
		}
		if (self || messageLock.current) return;
		messageLock.current = true;
		setMessageBusy(true);
		setActionError('');
		try {
			const response = await createConversation({ variables: { input: { memberTwoId: agent.memberId } } });
			if (!response.data?.createConversation._id) throw new Error('Conversation could not be created.');
			setNotice('Conversation is ready. Messaging is not available in the frontend yet.');
		} catch (error) {
			setActionError(error instanceof Error ? error.message : 'Unable to create a conversation.');
		} finally {
			messageLock.current = false;
			setMessageBusy(false);
		}
	}
	const counts = follow.data?.getMember;
	const tabs = ['overview', 'packages', 'articles', 'travel-mates', 'followers', 'following'] as const;
	const tab = tabs.find((value) => value === router.query.tab) ?? 'overview';
	const groups = [
		{ title: 'Profile', items: [{ id: 'overview', label: 'Overview' }] },
		{ title: 'Agent', items: [{ id: 'packages', label: 'Packages' }] },
		{
			title: 'Community',
			items: [
				{ id: 'articles', label: 'Articles' },
				{ id: 'travel-mates', label: 'Travel Mates' },
			],
		},
		{
			title: 'Connections',
			items: [
				{ id: 'followers', label: 'Followers' },
				{ id: 'following', label: 'Following' },
			],
		},
	];
	const stats = [
		{ label: 'Packages', value: agent.agentPackageCount },
		{ label: 'Followers', value: counts?.memberFollowerCount ?? member?.memberFollowerCount },
		{ label: 'Following', value: counts?.memberFollowingCount ?? member?.memberFollowingCount },
	];
	const agencyRows: [string, string | number | undefined][] = [
		['Company', agent.companyName],
		['License Number', agent.licenseNumber],
		['Office Address', agent.officeAddress],
		['Phone', agent.companyPhone],
		['Email', agent.companyEmail],
		['Verification', agent.verificationStatus],
		['Rating', agent.agentRating],
		['Reviews', agent.agentReviewCount],
		['Packages', agent.agentPackageCount],
		['Bookings', agent.agentBookingCount],
		['Rank', agent.agentRank > 0 ? agent.agentRank : undefined],
	];
	const personalRows: [string, string | number | undefined][] = [
		[
			'Language',
			member?.memberLanguage
				? member.memberLanguage.charAt(0) + member.memberLanguage.slice(1).toLowerCase()
				: undefined,
		],
		['Country', member?.memberCountry],
		['City', member?.memberCity],
		['Profile Views', member?.memberViewCount],
	];
	function details(rows: [string, string | number | undefined][]) {
		return (
			<dl className="agent-detail-info">
				{rows
					.filter(([, value]) => value !== undefined && value !== null && value !== '')
					.map(([label, value]) => (
						<div key={label}>
							<dt>{label}</dt>
							<dd>{value}</dd>
						</div>
					))}
			</dl>
		);
	}

	return (
		<>
			<Head>
				<title>{name} | WWT Agent</title>
			</Head>
			<Breadcrumbs separator="/" className="agent-detail-breadcrumb">
				<Link href="/">Home</Link>
				<Link href="/agent">Agents</Link>
				<span aria-current="page">{name}</span>
			</Breadcrumbs>
			<div className="agent-detail-layout">
				<aside className="agent-public-sidebar" aria-label="Agent profile navigation">
					<Paper className="agent-public-profile">
						<Avatar className="agent-detail-avatar" src={packageImageUrl(member?.memberImage)} alt={name}>
							{name.slice(0, 1).toUpperCase()}
						</Avatar>
						<Typography component="h1">{name}</Typography>
						{location && <Typography color="text.secondary">{location}</Typography>}
						{approved && (
							<Chip icon={<Verified />} label="VERIFIED AGENT" color="primary" variant="outlined" size="small" />
						)}
						<Typography>{agent.companyName}</Typography>
						{!self && (
							<div className="agent-detail-actions">
								<Button
									variant={isFollowing ? 'outlined' : 'contained'}
									disabled={followBusy || Boolean(userId && (follow.loading || follow.error || !follow.data))}
									onClick={() => {
										void toggleFollow();
									}}
								>
									{followBusy
										? 'Updating…'
										: userId && follow.loading
											? 'Loading…'
											: isFollowing
												? 'Following'
												: 'Follow Agent'}
								</Button>
								<Button
									variant="outlined"
									startIcon={<EmailOutlined />}
									disabled={messageBusy}
									onClick={() => {
										void message();
									}}
								>
									{messageBusy ? 'Opening…' : 'Message'}
								</Button>
							</div>
						)}
					</Paper>
					<nav className="agent-public-nav">
						{groups.map((group) => (
							<section key={group.title}>
								<Typography component="h2">{group.title}</Typography>
								{group.items.map((item) => (
									<Button
										key={item.id}
										component={Link}
										href={`/agent/${agent._id}?tab=${item.id}`}
										shallow
										scroll={false}
										className={tab === item.id ? 'is-active' : undefined}
										aria-current={tab === item.id ? 'page' : undefined}
									>
										{item.label}
										{tab === item.id && <span className="agent-active-dot" aria-hidden="true" />}
									</Button>
								))}
							</section>
						))}
					</nav>
				</aside>
				<div className="agent-detail-main">
					{actionError && (
						<Alert severity="error" onClose={() => setActionError('')}>
							{actionError}
						</Alert>
					)}
					{follow.error && (
						<Alert
							severity="error"
							action={
								<Button
									onClick={() => {
										void follow.refetch().catch(() => undefined);
									}}
								>
									Retry
								</Button>
							}
						>
							Follow status could not be loaded.
						</Alert>
					)}
					{tab === 'overview' && (
						<>
							<Paper component="section" className="agent-detail-card">
								<Typography component="h2">About {name}</Typography>
								<Typography className="agent-detail-bio">
									{member?.memberDesc?.trim() ||
										agent.agentDesc?.trim() ||
										'This member has not added a description yet.'}
								</Typography>
								{details(personalRows)}
							</Paper>
							<Paper component="section" className="agent-detail-card">
								<Typography component="h2">Agent Information</Typography>
								{details(agencyRows)}
							</Paper>
							<Paper component="section" className="agent-detail-card">
								<Typography component="h2">Community &amp; Stats</Typography>
								<div className="agent-detail-stats">
									{stats
										.filter((stat) => typeof stat.value === 'number')
										.map((stat) => (
											<div key={stat.label}>
												<strong>{stat.value}</strong>
												<span>{stat.label}</span>
											</div>
										))}
								</div>
							</Paper>
						</>
					)}
					{tab === 'packages' && <PublicAgentPackages agentId={agent._id} name={name} />}
					{tab === 'articles' && <PublicArticles memberId={agent.memberId} />}
					{tab === 'travel-mates' && (
						<Paper className="agent-detail-card">
							<Typography component="h2">Travel Mates</Typography>
							<Typography color="text.secondary">Travel mate posts for this member are not available yet.</Typography>
						</Paper>
					)}
					{(tab === 'followers' || tab === 'following') && (
						<PublicConnections
							key={`${tab}-${counts?.memberFollowerCount ?? ''}`}
							memberId={agent.memberId}
							type={tab}
						/>
					)}
				</div>
			</div>
			<Snackbar open={Boolean(notice)} autoHideDuration={6000} onClose={() => setNotice('')}>
				<Alert severity="success" onClose={() => setNotice('')}>
					{notice}
				</Alert>
			</Snackbar>
		</>
	);
}
export default function AgentDetail() {
	const router = useRouter();
	const user = useReactiveVar(currentUserVar);
	const id = typeof router.query.agentId === 'string' ? router.query.agentId : '';
	const valid = /^[a-f0-9]{24}$/i.test(id);
	const { data, loading, error } = useQuery(GET_AGENT, {
		variables: { agentId: id },
		skip: !router.isReady || !valid,
		fetchPolicy: 'no-cache',
	});
	return (
		<div className="agent-detail-page">
			<Head>
				<title>Agent Profile | WWT</title>
			</Head>
			{!router.isReady || loading ? (
				<div aria-label="Loading agent profile" aria-busy="true">
					<Skeleton height={40} width="45%" />
					<div className="agent-detail-layout">
						<Skeleton variant="rounded" height={320} />
						<Skeleton variant="rounded" height={450} />
					</div>
				</div>
			) : !valid || error || !data?.getAgent ? (
				<Alert
					severity="error"
					action={
						<Button component={Link} href="/agent">
							Back to Agents
						</Button>
					}
				>
					Agent could not be found.
				</Alert>
			) : (
				<Profile key={`${id}-${user?._id ?? 'guest'}`} agent={data.getAgent} userId={user?._id} />
			)}
		</div>
	);
}
