import { useQuery } from '@apollo/client';
import { Alert, Button, Chip, Skeleton, Stack, Typography } from '@mui/material';
import { GET_PACKAGE_TAGS } from '@/apollo/user/query';

export default function PackageTags({ packageId }: { packageId: string }) {
	const { data, loading, error, refetch } = useQuery(GET_PACKAGE_TAGS, {
		variables: { packageId },
		notifyOnNetworkStatusChange: true,
	});

	return (
		<section className="detail-section" aria-labelledby="package-tags-title" aria-busy={loading}>
			<h2 id="package-tags-title">Tags</h2>
			{loading ? (
				<Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }} role="status" aria-label="Loading tags">
					{[0, 1, 2].map((key) => (
						<Skeleton key={key} variant="rounded" width={88} height={32} sx={{ borderRadius: 4 }} />
					))}
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
					Tags could not be loaded. Please try again.
				</Alert>
			) : data.getPackageTags.length === 0 ? (
				<Typography variant="body2" color="text.secondary">
					No tags available.
				</Typography>
			) : (
				<Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', minWidth: 0 }}>
					{data.getPackageTags.map((tag) => (
						<Chip
							key={tag._id}
							label={tag.tagName}
							variant="outlined"
							sx={{
								maxWidth: '100%',
								height: 'auto',
								minHeight: 32,
								'& .MuiChip-label': { whiteSpace: 'normal', overflowWrap: 'anywhere', py: 0.5 },
							}}
						/>
					))}
				</Stack>
			)}
		</section>
	);
}
