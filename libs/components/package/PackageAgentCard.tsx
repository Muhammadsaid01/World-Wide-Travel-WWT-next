import type { PackageDetailData } from '@/apollo/user/query';
import { AgentVerificationStatus } from '@/libs/enums/member.enum';
import LuggageOutlined from '@mui/icons-material/LuggageOutlined';
import Star from '@mui/icons-material/Star';
import Verified from '@mui/icons-material/Verified';
import { Avatar, Box, Button, Paper, Snackbar, Stack, Tooltip, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { packageImageUrl } from './PackageImage';
import { useTranslation } from 'react-i18next';

export default function PackageAgentCard({ agent }: { agent: NonNullable<PackageDetailData['agentData']> }) {
	const { t } = useTranslation('packages');
	const [notice, setNotice] = useState('');
	const name =
		agent.memberData?.memberFullName?.trim() ||
		agent.memberData?.memberNick?.trim() ||
		agent.companyName?.trim() ||
		t('detail.agentFallback');
	const router = useRouter();

	function handleAskQuestion(memberId: string) {
		if (!memberId) return;
		// Future createConversation input.memberTwoId must use this Member ID,
		// never agent._id. Chat components and routing are currently unimplemented.
		setNotice(t('detail.messageUnavailable'));
	}

	return (
		<section className="detail-section">
			<h2>{t('detail.agent')}</h2>
			<Paper
				variant="outlined"
				sx={{ p: { xs: 2.5, sm: 3 }, borderRadius: 2, boxShadow: '0 4px 18px rgba(7,31,55,0.04)' }}
			>
				<Stack
					direction={{ xs: 'column', sm: 'row' }}
					spacing={3}
					sx={{ alignItems: { xs: 'stretch', sm: 'center' }, justifyContent: 'space-between' }}
				>
					<Stack direction="row" spacing={2} sx={{ minWidth: 0, flex: 1, alignItems: 'center' }}>
						<Avatar
							src={packageImageUrl(agent.memberData?.memberImage)}
							alt={name}
							sx={{ width: 64, height: 64, bgcolor: 'primary.main', flexShrink: 0 }}
						>
							{name.charAt(0).toUpperCase()}
						</Avatar>
						<Box sx={{ minWidth: 0, overflowWrap: 'anywhere' }}>
							<Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
								<Typography component="h3" variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.main' }}>
									{name}
								</Typography>
								{agent.verificationStatus === AgentVerificationStatus.APPROVED && (
									<Tooltip title={t('detail.verifiedAgent')}>
										<Verified fontSize="small" color="primary" aria-label={t('detail.verifiedAgent')} sx={{ flexShrink: 0 }} />
									</Tooltip>
								)}
							</Stack>
							{agent.companyName && (
								<Typography variant="body2" color="text.secondary">
									{agent.companyName}
								</Typography>
							)}
							<Stack direction="row" useFlexGap spacing={2} sx={{ mt: 1, flexWrap: 'wrap' }}>
								{typeof agent.agentRating === 'number' && (
									<Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
										<Star fontSize="small" sx={{ color: 'secondary.main' }} />
										<Typography variant="body2" aria-label={t('detail.agentRating', { rating: agent.agentRating })}>
											{agent.agentRating.toFixed(1)}
										</Typography>
									</Stack>
								)}
								{typeof agent.agentPackageCount === 'number' && (
									<Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
										<LuggageOutlined fontSize="small" color="action" />
										<Typography variant="body2" color="text.secondary">
											{t('detail.agentPackages', { count: agent.agentPackageCount })}
										</Typography>
									</Stack>
								)}
							</Stack>
						</Box>
					</Stack>
					<Stack spacing={1} sx={{ width: { xs: '100%', sm: 170 }, flexShrink: 0 }}>
						<Button variant="contained" disabled={!agent.memberId} onClick={() => handleAskQuestion(agent.memberId)}>
							{t('detail.askQuestion')}
						</Button>
						{/* No Agent Profile route exists. Future navigation must use agent._id. */}
						<Button variant="outlined"  aria-describedby="agent-profile-unavailable" onClick={() => router.push(`/agent/${agent._id}`)}>
							{t('detail.viewProfile')}
						</Button>
					</Stack>
				</Stack>
			</Paper>
			<Snackbar open={Boolean(notice)} message={notice} autoHideDuration={5000} onClose={() => setNotice('')} />
		</section>
	);
}
