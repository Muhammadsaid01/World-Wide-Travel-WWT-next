import { useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { Avatar, Button, CircularProgress, IconButton, Paper, Typography } from '@mui/material';
import ArrowForward from '@mui/icons-material/ArrowForward';
import EmailOutlined from '@mui/icons-material/EmailOutlined';
import LanguageOutlined from '@mui/icons-material/LanguageOutlined';
import LocationOnOutlined from '@mui/icons-material/LocationOnOutlined';
import LuggageOutlined from '@mui/icons-material/LuggageOutlined';
import PersonAddAltOutlined from '@mui/icons-material/PersonAddAltOutlined';
import Star from '@mui/icons-material/Star';
import Verified from '@mui/icons-material/Verified';
import { currentUserVar } from '@/apollo/store';
import { CREATE_CONVERSATION, SUBSCRIBE_MEMBER, UNSUBSCRIBE_MEMBER } from '@/apollo/user/mutation';
import { GET_MEMBER_FOLLOW_STATE, type AgentListItem } from '@/apollo/user/query';
import { AgentVerificationStatus, MemberLanguage } from '@/libs/enums/member.enum';
import { packageImageUrl } from '../package/PackageImage';

const languages: Record<MemberLanguage, string> = {
	ENGLISH: 'English',
	KOREAN: 'Korean',
	CHINESE: 'Chinese',
	RUSSIAN: 'Russian',
	ARABIC: 'Arabic',
	UZBEK: 'Uzbek',
};

export type AgentCardNotice = {
	message: string;
	severity: 'error' | 'info' | 'success';
};

export default function AgentCard({
	agent,
	onNotice,
}: {
	agent: AgentListItem;
	onNotice: (notice: AgentCardNotice) => void;
}) {
	const router = useRouter();
	const user = useReactiveVar(currentUserVar);
	const member = agent.memberData;
	const name = member?.memberFullName?.trim() || member?.memberNick?.trim() || agent.companyName;
	const location = [member?.memberCity, member?.memberCountry].filter(Boolean).join(', ') || agent.officeAddress;
	const verified = agent.verificationStatus === AgentVerificationStatus.APPROVED;
	const self = user?._id === agent.memberId;
	const [followBusy, setFollowBusy] = useState(false);
	const [messageBusy, setMessageBusy] = useState(false);
	const followLock = useRef(false);
	const messageLock = useRef(false);
	const follow = useQuery(GET_MEMBER_FOLLOW_STATE, {
		variables: { memberId: agent.memberId },
		skip: !user?._id || self,
		fetchPolicy: 'no-cache',
		notifyOnNetworkStatusChange: true,
	});
	const [subscribe] = useMutation(SUBSCRIBE_MEMBER);
	const [unsubscribe] = useMutation(UNSUBSCRIBE_MEMBER);
	const [createConversation] = useMutation(CREATE_CONVERSATION);
	const isFollowing = follow.data?.getMember.meFollowed?.[0]?.myFollowing ?? false;
	const followStatePending = Boolean(user?._id && !self && follow.loading);

	async function toggleFollow() {
		if (!currentUserVar()?._id) {
			await router.push('/account/login');
			return;
		}
		if (self || followLock.current || follow.loading) return;
		if (follow.error || !follow.data) {
			followLock.current = true;
			setFollowBusy(true);
			try {
				await follow.refetch();
			} catch (error) {
				onNotice({
					message: error instanceof Error ? error.message : 'Follow status could not be loaded.',
					severity: 'error',
				});
			} finally {
				followLock.current = false;
				setFollowBusy(false);
			}
			return;
		}

		followLock.current = true;
		setFollowBusy(true);
		try {
			await (isFollowing ? unsubscribe : subscribe)({ variables: { input: agent.memberId } });
			await follow.refetch();
		} catch (error) {
			onNotice({
				message: error instanceof Error ? error.message : 'Follow status could not be updated.',
				severity: 'error',
			});
		} finally {
			followLock.current = false;
			setFollowBusy(false);
		}
	}

	async function openConversation() {
		if (!currentUserVar()?._id) {
			await router.push('/account/login');
			return;
		}
		if (self || messageLock.current) return;

		messageLock.current = true;
		setMessageBusy(true);
		try {
			const response = await createConversation({ variables: { input: { memberTwoId: agent.memberId } } });
			const conversationId = response.data?.createConversation._id;
			if (!conversationId) throw new Error('Conversation could not be created.');
			await router.push({ pathname: '/mypage/chats', query: { conversation: conversationId } });
		} catch (error) {
			onNotice({
				message: error instanceof Error ? error.message : 'The conversation could not be opened.',
				severity: 'error',
			});
		} finally {
			messageLock.current = false;
			setMessageBusy(false);
		}
	}

	return (
		<Paper component="article" className="agent-card" elevation={0}>
			<div className="agent-card-media">
				<Avatar
					variant="rounded"
					className="agent-card-image"
					src={packageImageUrl(member?.memberImage)}
					alt={member?.memberImage ? name : ''}
				>
					{name.slice(0, 1).toUpperCase()}
				</Avatar>
				{verified ? (
					<span className="agent-card-badge">
						<Verified aria-hidden="true" /> Verified
					</span>
				) : null}
			</div>

			<div className="agent-card-content">
				<div className="agent-card-information">
					<div className="agent-card-primary">
						<div className="agent-card-name">
							<Typography component="h3">{name}</Typography>
							{verified ? <Verified titleAccess="Verified agent" /> : null}
						</div>
						<Typography className="agent-card-company">{agent.companyName}</Typography>

						<div className={`agent-card-rating${agent.agentReviewCount ? '' : ' has-no-reviews'}`}>
							{agent.agentReviewCount > 0 ? (
								<>
									<Star aria-hidden="true" />
									<strong>{agent.agentRating.toFixed(1)}</strong>
									<span>({agent.agentReviewCount} reviews)</span>
								</>
							) : (
								<span>No reviews yet</span>
							)}
						</div>

						{agent.agentDesc ? (
							<Typography className="agent-card-description">{agent.agentDesc}</Typography>
						) : null}
					</div>

					<div className="agent-card-facts">
						{location ? (
							<span>
								<LocationOnOutlined aria-hidden="true" />
								<span>{location}</span>
							</span>
						) : null}
						<span>
							<LuggageOutlined aria-hidden="true" />
							<span>{agent.agentPackageCount} Packages</span>
						</span>
						{member?.memberLanguage && languages[member.memberLanguage] ? (
							<span>
								<LanguageOutlined aria-hidden="true" />
								<span>{languages[member.memberLanguage]}</span>
							</span>
						) : null}
					</div>
				</div>

				<div className={`agent-card-actions${self ? ' is-self' : ''}`}>
					{!self ? (
						<>
							<Button
								className="agent-card-follow"
								variant={isFollowing ? 'outlined' : 'contained'}
								startIcon={followBusy || followStatePending ? <CircularProgress size={15} /> : <PersonAddAltOutlined />}
								disabled={followBusy || followStatePending}
								onClick={() => void toggleFollow()}
							>
								{follow.error ? 'Retry' : isFollowing ? 'Following' : 'Follow'}
							</Button>
							<IconButton
								className="agent-card-message"
								aria-label={`Message ${name}`}
								disabled={messageBusy}
								onClick={() => void openConversation()}
							>
								{messageBusy ? <CircularProgress size={18} /> : <EmailOutlined />}
							</IconButton>
						</>
					) : null}
					<Button
						component={Link}
						href={`/agent/${agent._id}`}
						variant="outlined"
						className="agent-card-profile"
						endIcon={<ArrowForward />}
					>
						View Profile
					</Button>
				</div>
			</div>
		</Paper>
	);
}
