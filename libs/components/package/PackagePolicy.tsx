import { useQuery } from '@apollo/client';
import { Alert, Button, Divider, Paper, Skeleton, Stack, Typography } from '@mui/material';
import { GET_PACKAGE_POLICY } from '@/apollo/user/query';

export default function PackagePolicy({ packageId }: { packageId: string }) {
	const { data, loading, error, refetch } = useQuery(GET_PACKAGE_POLICY, {
		variables: { packageId },
		notifyOnNetworkStatusChange: true,
	});

	return (
		<section className="detail-section" aria-labelledby="package-policy-title" aria-busy={loading}>
			<h2 id="package-policy-title">Package Policy</h2>
			{loading ? (
				<Stack spacing={2} role="status" aria-label="Loading package policy">
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
							Retry
						</Button>
					}
				>
					Policy information could not be loaded. Please try again.
				</Alert>
			) : !data.getPackagePolicy?.length ? (
				<Typography variant="body2" color="text.secondary">
					No policy information available.
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
										Cancellation
									</Typography>
									<Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
										{policy.cancelPolicy}
									</Typography>
								</div>
								<div>
									<Typography component="h3" variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.main' }}>
										Refund
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
