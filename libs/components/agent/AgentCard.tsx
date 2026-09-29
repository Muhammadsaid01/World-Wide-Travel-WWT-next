import Link from 'next/link';
import { Avatar, Button, Paper, Typography } from '@mui/material';
import Verified from '@mui/icons-material/Verified';
import Star from '@mui/icons-material/Star';
import LocationOnOutlined from '@mui/icons-material/LocationOnOutlined';
import LanguageOutlined from '@mui/icons-material/LanguageOutlined';
import LuggageOutlined from '@mui/icons-material/LuggageOutlined';
import type { AgentListItem } from '@/apollo/user/query';
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
export default function AgentCard({ agent }: { agent: AgentListItem }) {
	const member = agent.memberData;
	const name = member?.memberFullName || member?.memberNick;
	const location = [member?.memberCity, member?.memberCountry].filter(Boolean).join(', ') || agent.officeAddress;
	return (
		<Paper component="article" className="agent-card">
			<Avatar
				variant="rounded"
				className="agent-card-image"
				src={packageImageUrl(member?.memberImage)}
				alt={name || 'Agent profile image unavailable'}
			>
				{name?.slice(0, 1).toUpperCase()}
			</Avatar>
			<div className="agent-card-content">
				<div className="agent-card-name">
					<Typography component="h3">{name || 'Member profile unavailable'}</Typography>
					{agent.verificationStatus === AgentVerificationStatus.APPROVED && (
						<Verified color="primary" titleAccess="Verified agent" />
					)}
				</div>
				<Typography className="agent-card-company" color="text.secondary">
					{agent.companyName}
				</Typography>
				<div className="agent-card-rating">
					<Star aria-hidden="true" />
					<strong>{agent.agentRating}</strong>
					<span>({agent.agentReviewCount} reviews)</span>
				</div>
				<div className="agent-card-facts">
					{location && (
						<span>
							<LocationOnOutlined />
							{location}
						</span>
					)}
					<span>
						<LuggageOutlined />
						{agent.agentPackageCount} Packages
					</span>
					{member?.memberLanguage && languages[member.memberLanguage] && (
						<span>
							<LanguageOutlined />
							{languages[member.memberLanguage]}
						</span>
					)}
				</div>
				{agent.agentDesc && (
					<Typography variant="body2" className="agent-card-description" color="text.secondary">
						{agent.agentDesc}
					</Typography>
				)}
				<Button
					component={Link}
					href={`/agent/${agent._id}`}
					variant="outlined"
					fullWidth
					className="agent-card-action"
				>
					View Profile
				</Button>
			</div>
		</Paper>
	);
}
