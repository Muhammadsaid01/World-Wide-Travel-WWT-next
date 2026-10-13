import { useQuery } from '@apollo/client';
import { Alert, Button, Divider, Paper, Skeleton, Stack, Typography } from '@mui/material';
import { GET_PACKAGE_POLICY } from '@/apollo/user/query';
import { useTranslation } from 'react-i18next';

export default function PackagePolicy({ packageId }: { packageId: string }) {
	const { t } = useTranslation(['packages', 'common']);
	const { data, loading, error, refetch } = useQuery(GET_PACKAGE_POLICY, {
		variables: { packageId },
		notifyOnNetworkStatusChange: true,
	});

	return (
		<section className="detail-section" aria-labelledby="package-policy-title" aria-busy={loading}>
			<h2 id="package-policy-title">{t('detail.policy')}</h2>
			{loading ? (
				<Stack spacing={2} role="status" aria-label={t('detail.loadingPolicy')}>
					<Skeleton variant="rounded" height={100} />
					<Skeleton variant="rounded" height={100} />
				</Stack>
			) : error || !data ? (
				<Alert
					severity="error"
					action={
						<Button
							color="inherit"
							onClick={() => {
								void refetch().catch(() => undefined);
							}}
						>
							{t('actions.retry', { ns: 'common' })}
						</Button>
					}
				>
					{t('detail.policyError')}
				</Alert>
			) : !data.getPackagePolicy?.length ? (
				<Typography variant="body2" color="text.secondary">
					{t('detail.noPolicy')}
				</Typography>
			) : (
				<Stack spacing={2}>
					{data.getPackagePolicy.map((policy) => (
						<Paper
							key={policy._id}
							variant="outlined"
							sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2, minWidth: 0, overflowWrap: 'anywhere' }}
						>
							<Stack spacing={2} divider={<Divider />}>
								<div>
									<Typography component="h3" variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.main' }}>
										{t('detail.cancellation')}
									</Typography>
									<Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
										{policy.cancelPolicy}
									</Typography>
								</div>
								<div>
									<Typography component="h3" variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.main' }}>
										{t('detail.refund')}
									</Typography>
									<Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
										{policy.refundPolicy}
									</Typography>
								</div>
							</Stack>
						</Paper>
					))}
				</Stack>
			)}
		</section>
	);
}
