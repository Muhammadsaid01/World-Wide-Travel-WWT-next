import { useQuery } from '@apollo/client';
import { Alert, Box, Button, Skeleton, Stack, Typography } from '@mui/material';
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutlined';
import HighlightOff from '@mui/icons-material/HighlightOff';
import { GET_PACKAGE_INCLUSIONS } from '@/apollo/user/query';

export default function PackageInclusions({ packageId }: { packageId: string }) {
	const { data, loading, error, refetch } = useQuery(GET_PACKAGE_INCLUSIONS, {
		variables: { packageId },
		notifyOnNetworkStatusChange: true,
	});

	return (
		<section className="detail-section" aria-label="Package inclusions and exclusions" aria-busy={loading}>
			{loading ? (
				<Stack spacing={2} role="status" aria-label="Loading inclusions and exclusions">
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
					Inclusion and exclusion information could not be loaded.
				</Alert>
			) : data.getPackageIncludes.length === 0 && data.getPackageExcludes.length === 0 ? (
				<Alert severity="info">No inclusion or exclusion information available.</Alert>
			) : (
				<Box
					sx={{
						display: 'grid',
						gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'repeat(2, minmax(0, 1fr))' },
						gap: 3,
					}}
				>
					<Box sx={{ minWidth: 0 }}>
						<h2>What&apos;s Included</h2>
						{data.getPackageIncludes.length === 0 ? (
							<Typography variant="body2" color="text.secondary">
								No inclusion information available.
							</Typography>
						) : (
							<Stack component="ul" spacing={1.5} sx={{ listStyle: 'none', p: 0, m: 0 }}>
								{data.getPackageIncludes.map((entry) => (
									<Stack component="li" direction="row" spacing={1} key={entry._id} sx={{ alignItems: 'flex-start' }}>
										<CheckCircleOutline color="success" fontSize="small" sx={{ flexShrink: 0, mt: 0.25 }} />
										<Typography
											variant="body2"
											color="text.secondary"
											sx={{ minWidth: 0, overflowWrap: 'anywhere', whiteSpace: 'pre-wrap' }}
										>
											{entry.content}
										</Typography>
									</Stack>
								))}
							</Stack>
						)}
					</Box>
					<Box sx={{ minWidth: 0 }}>
						<h2>What&apos;s Not Included</h2>
						{data.getPackageExcludes.length === 0 ? (
							<Typography variant="body2" color="text.secondary">
								No exclusion information available.
							</Typography>
						) : (
							<Stack component="ul" spacing={1.5} sx={{ listStyle: 'none', p: 0, m: 0 }}>
								{data.getPackageExcludes.map((entry) => (
									<Stack component="li" direction="row" spacing={1} key={entry._id} sx={{ alignItems: 'flex-start' }}>
										<HighlightOff color="error" fontSize="small" sx={{ flexShrink: 0, mt: 0.25 }} />
										<Typography
											variant="body2"
											color="text.secondary"
											sx={{ minWidth: 0, overflowWrap: 'anywhere', whiteSpace: 'pre-wrap' }}
										>
											{entry.title}
										</Typography>
									</Stack>
								))}
							</Stack>
						)}
					</Box>
				</Box>
			)}
		</section>
	);
}
