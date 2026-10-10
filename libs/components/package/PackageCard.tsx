import type { PackageListItem } from '@/apollo/user/query';
import AccessTime from '@mui/icons-material/AccessTime';
import ArrowForward from '@mui/icons-material/ArrowForward';
import Favorite from '@mui/icons-material/Favorite';
import FavoriteBorder from '@mui/icons-material/FavoriteBorder';
import LandscapeOutlined from '@mui/icons-material/LandscapeOutlined';
import PlaceOutlined from '@mui/icons-material/PlaceOutlined';
import Star from '@mui/icons-material/Star';
import { IconButton } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import { packageImageUrl } from './PackageImage';

type FavoriteAction = {
  active: boolean;
  onToggle: () => void;
  disabled?: boolean;
  unavailable?: boolean;
};

export default function PackageCard({
  item,
  favoriteAction,
  variant = 'default',
}: {
  item: PackageListItem;
  favoriteAction?: FavoriteAction;
  variant?: 'default' | 'listing';
}) {
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const image = item.packageImages
    .map(packageImageUrl)
    .find(
      (candidate): candidate is string =>
        typeof candidate === 'string' && !failedImages.has(candidate),
    );
  const fallbackImage = item.destinationCity.trim().toLowerCase() === 'seoul'
    ? '/images/home/hero/04-east-asia/seoul.jpg'
    : '/images/packages/pack_background.png';

  const isSaved = favoriteAction?.active ?? false;
  const listing = variant === 'listing';

  return (
    <article
      className={`home-card${isSaved ? ' saved-package-card' : ''}${listing ? ' package-list-card' : ''}`}
    >
      {listing && (
        <Link
          className="package-card-overlay"
          href={`/package/${item._id}`}
          aria-label={`View ${item.packageTitle}`}
        />
      )}
      <div className="home-card-image">
        {image ? (
          <Image
            src={image}
            alt={item.packageTitle}
            fill
            unoptimized
            sizes="(max-width: 600px) 100vw, (max-width: 760px) 50vw, (max-width: 1100px) 35vw, 300px"
            onError={() => {
              setFailedImages((previous) => {
                const next = new Set(previous);
                next.add(image);
                return next;
              });
            }}
          />
        ) : listing ? (
          <div className="package-image-fallback" aria-label="Package image unavailable">
            <Image
              src={fallbackImage}
              alt=""
              fill
              sizes="(max-width: 600px) 100vw, (max-width: 1100px) 50vw, 300px"
            />
            <span>Image unavailable</span>
          </div>
        ) : (
          <div className="packages-image-placeholder" aria-label="Package image unavailable"><LandscapeOutlined /></div>
        )}

        {favoriteAction && (
          <IconButton
            className="home-favorite"
            disabled={favoriteAction.disabled ?? false}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              favoriteAction.onToggle();
            }}
            aria-label={
              isSaved
                ? `Remove ${item.packageTitle} from saved packages`
                : `Save ${item.packageTitle}`
            }
          >
            {isSaved ? (
              <Favorite fontSize="small" color="error" />
            ) : (
              <FavoriteBorder fontSize="small" />
            )}
          </IconButton>
        )}
      </div>

      <div className="home-card-body">
        {isSaved && !listing && (
          <p className="saved-package-country">{item.destinationCountry}</p>
        )}

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

            {item.packageReviewCount > 0 ? (
              <>
                {item.packageRating.toFixed(1)}
                {(isSaved || listing) && ` (${item.packageReviewCount})`}
              </>
            ) : (
              <span>No reviews yet</span>
            )}
          </p>
        </div>

        <h3 title={item.packageTitle}>
          {listing ? item.packageTitle : <Link href={`/package/${item._id}`}>{item.packageTitle}</Link>}
        </h3>

        <p className="home-duration">
          <AccessTime />
          {item.packageDays} days / {item.packageNights} nights
        </p>

        <div className="home-price">
          <span>
            Price{' '}
            <strong>
              {item.currency} {item.packagePrice.toLocaleString('en-US')}
            </strong>
          </span>

          {listing ? (
            <span className="package-card-arrow" aria-hidden="true">
              <ArrowForward fontSize="small" />
            </span>
          ) : isSaved ? (
            <Link
              className="saved-package-view"
              href={`/package/${item._id}`}
            >
              View <ArrowForward fontSize="small" />
            </Link>
          ) : null}
        </div>

        {favoriteAction?.unavailable && (
          <p className="saved-package-unavailable">
            This package is unavailable. Removal is not supported by the current API.
          </p>
        )}
      </div>
    </article>
  );
}
