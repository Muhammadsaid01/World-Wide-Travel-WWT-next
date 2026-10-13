import { useQuery } from '@apollo/client';
import { Alert, Box, Button, Skeleton, Stack, Typography } from '@mui/material';
import { GET_PACKAGE_ITINERARIES } from '@/apollo/user/query';
import { useTranslation } from 'react-i18next';

export default function PackageItinerary({ packageId }: { packageId: string }) {
	const { t } = useTranslation(['packages', 'common']);
	const { data, loading, error, refetch } = useQuery(GET_PACKAGE_ITINERARIES, {
		variables: { packageId },
		notifyOnNetworkStatusChange: true,
	});

	return (
		<section className="detail-section" aria-labelledby="itinerary-title" aria-busy={loading}>
			<h2 id="itinerary-title">{t('detail.itinerary')}</h2>
			{loading ? (
				<Stack spacing={2} role="status" aria-label={t('detail.loadingItinerary')}>
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
					{t('detail.itineraryError')}
				</Alert>
			) : data.getItineraries.length === 0 ? (
				<Alert severity="info">{t('detail.noItinerary')}</Alert>
			) : (
				<Box component="ol" sx={{ listStyle: 'none', p: 0, m: 0 }}>
					{[...data.getItineraries]
						.sort((a, b) => a.dayNumber - b.dayNumber)
						.map((day, index, days) => (
							<Box
								component="li"
								key={day._id}
								sx={{
									position: 'relative',
									ml: 0.75,
									pl: { xs: 2.5, sm: 3.5 },
									pb: index < days.length - 1 ? 3 : 0,
									borderLeft: '2px solid',
									borderColor: index < days.length - 1 ? 'divider' : 'transparent',
									minWidth: 0,
									overflowWrap: 'anywhere',
									'&::before': {
										content: '""',
										position: 'absolute',
										left: -7,
										top: 6,
										width: 12,
										height: 12,
										borderRadius: '50%',
										bgcolor: 'primary.main',
									},
								}}
							>
								<Typography component="div" variant="overline" sx={{ color: 'primary.main', fontWeight: 700 }}>
									{t('detail.day', { number: day.dayNumber })}
								</Typography>
								<Typography component="h3" variant="subtitle1" sx={{ fontWeight: 700 }}>
									{day.title}
								</Typography>
								<Typography className="detail-prose" variant="body2" color="text.secondary">
									{day.description}
								</Typography>
							</Box>
						))}
				</Box>
			)}
		</section>
	);
}
