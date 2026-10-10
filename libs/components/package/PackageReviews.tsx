import Link from 'next/link';
import { useState } from 'react';
import { useQuery, useReactiveVar } from '@apollo/client';
import { Alert, Avatar, Button, Pagination, Rating, Skeleton } from '@mui/material';
import { currentUserVar } from '@/apollo/store';
import { GET_PACKAGE_REVIEWS } from '@/apollo/user/query';
import { packageImageUrl } from './PackageImage';
import ReportForm from '../cs/ReportForm';
import { ReportTargetType } from '@/libs/enums/system.enum';

export default function PackageReviews({
	packageId,
	rating,
	count,
}: {
	packageId: string;
	rating: number;
	count: number;
}) {
	const user = useReactiveVar(currentUserVar);
	const [page, setPage] = useState(1);
	const { data, loading, error, refetch } = useQuery(GET_PACKAGE_REVIEWS, {
		variables: { packageId, input: { page, limit: 4 } },
		skip: !user,
		notifyOnNetworkStatusChange: true,
	});
	const total = data?.getPackageReviews.metaCounter?.[0]?.total ?? 0;
	return (
		<section className="detail-section">
			<h2>Traveler Reviews</h2>
			<p>{count > 0 ? `${rating.toFixed(1)} / 5 · ${count} reviews` : 'No reviews yet'}</p>
			{!user ? (
				<Button component={Link} href="/account/login">
					Log in to read reviews
				</Button>
			) : loading ? (
				<Skeleton height={100} />
			) : error ? (
				<Alert
					severity="error"
					action={
						<Button
							onClick={() => {
								void refetch().catch(() => undefined);
							}}
						>
							Retry
						</Button>
					}
				>
					Reviews could not be loaded.
				</Alert>
			) : (
				<>
					{data?.getPackageReviews.list.map((review) => (
						<article className="detail-review" key={review._id}>
							<div className="detail-review-topline">
								<div className="detail-review-author">
									<Avatar src={packageImageUrl(review.memberData?.memberImage)} />
									<div>
										{review.memberData?.memberNick}
										<time dateTime={review.createdAt}>
											{new Date(review.createdAt).toLocaleDateString('en-US', { timeZone: 'UTC' })}
										</time>
									</div>
								</div>
								{user?._id !== review.memberId ? (
									<ReportForm
										targetId={review._id}
										targetType={ReportTargetType.REVIEW}
										targetLabel={review.reviewTitle || 'Package review'}
									/>
								) : null}
							</div>
							<Rating value={review.reviewRating} precision={0.5} readOnly size="small" />
							{review.reviewTitle && <h3>{review.reviewTitle}</h3>}
							<p className="detail-prose">{review.reviewContent}</p>
						</article>
					))}
					{total > 4 && (
						<Pagination
							page={page}
							count={Math.ceil(total / 4)}
							onChange={(_, value) => setPage(value)}
							color="primary"
						/>
					)}
				</>
			)}
		</section>
	);
}
