import { Avatar, Chip, Paper, Skeleton, Typography } from '@mui/material';
import Verified from '@mui/icons-material/Verified';
import type { ProfileMember, AgentDetailData } from '@/apollo/user/query';
import { AgentVerificationStatus } from '@/libs/enums/member.enum';
import { packageImageUrl } from '../package/PackageImage';

export default function AgentProfileCard({
	member,
	agent,
	loading = false,
}: {
	member?: ProfileMember;
	agent?: AgentDetailData;
	loading?: boolean;
}) {
	const name = member?.memberFullName || member?.memberNick;
	return (
		<Paper className="agent-dashboard-profile">
			{loading ? (
				<>
					<Skeleton variant="circular" width={88} height={88} />
					<Skeleton width="80%" height={32} />
				</>
			) : member ? (
				<>
					<Avatar src={packageImageUrl(member.memberImage)} alt={name}>
						{name?.slice(0, 1)}
					</Avatar>
					<Typography component="h2">{name}</Typography>
					{(member.memberCity || member.memberCountry) && (
						<Typography color="text.secondary">
							{[member.memberCity, member.memberCountry].filter(Boolean).join(', ')}
						</Typography>
					)}
					{agent?.verificationStatus === AgentVerificationStatus.APPROVED && (
						<Chip icon={<Verified />} size="small" variant="outlined" color="primary" label="VERIFIED AGENT" />
					)}
					{(member.memberDesc || agent?.agentDesc) && (
						<Typography color="text.secondary">{member.memberDesc || agent?.agentDesc}</Typography>
					)}
				</>
			) : (
				<Typography>Profile unavailable.</Typography>
			)}
		</Paper>
	);
}
