import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { IconButton } from '@mui/material';
import FavoriteBorder from '@mui/icons-material/FavoriteBorder';
import Star from '@mui/icons-material/Star';
import PlaceOutlined from '@mui/icons-material/PlaceOutlined';
import AccessTime from '@mui/icons-material/AccessTime';
import type { PackageListItem } from '@/apollo/user/query';
import { API_URL } from '@/libs/config';

export default function PackageCard({ item }: { item: PackageListItem }) {
	const [failedImage, setFailedImage] = useState<string | null>(null);
	const path = item.packageImages.find((image) => image.trim());
	// The backend uploader returns uploads/<target>/<filename> paths.
	const image =
		path &&
		(/^https?:\/\//i.test(path)
			? path
			: API_URL
				? `${API_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`
				: undefined);
	return (
		<article className="home-card">
			<div className="home-card-image">
				{image && failedImage !== image ? (
					<Image
						src={image}
						alt={item.packageTitle}
						fill
						unoptimized
						sizes="(max-width: 600px) 100vw, (max-width: 760px) 50vw, (max-width: 1100px) 35vw, 300px"
						onError={() => setFailedImage(image)}
					/>
				) : (
					<div className="packages-image-placeholder">Image unavailable</div>
				)}
				<IconButton className="home-favorite" disabled aria-label={`Save ${item.packageTitle} (coming soon)`}>
					<FavoriteBorder fontSize="small" />
				</IconButton>
			</div>
			<div className="home-card-body">
				<div className="packages-card-meta">
					<p className="home-location">
						<PlaceOutlined />
						{item.destinationCity}, {item.destinationCountry}
					</p>
					<p
						className="home-rating"
						aria-label={
							item.packageReviewCount > 0
								? `${item.packageRating.toFixed(1)} out of 5 from ${item.packageReviewCount} reviews`
								: 'No reviews yet'
						}
					>
						<Star />
						{item.packageReviewCount > 0 ? <>{item.packageRating.toFixed(1)}</> : <span>No reviews yet</span>}
					</p>
				</div>
				<h3 title={item.packageTitle}>
					<Link href={`/package/${item._id}`}>{item.packageTitle}</Link>
				</h3>
				<p className="home-duration">
					<AccessTime />
					{item.packageDays} days / {item.packageNights} nights
				</p>
				{/* No starting-price or per-person pricing contract: omit "From" and "/ person". */}
				<div className="home-price">
					<span>
						Price{' '}
						<strong>
							{item.currency} {item.packagePrice.toLocaleString('en-US')}
						</strong>
					</span>
				</div>
			</div>
		</article>
	);
}
