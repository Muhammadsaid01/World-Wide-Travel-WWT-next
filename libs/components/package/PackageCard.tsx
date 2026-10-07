import type { PackageListItem } from '@/apollo/user/query';
import { API_URL } from '@/libs/config';
import AccessTime from '@mui/icons-material/AccessTime';
import ArrowForward from '@mui/icons-material/ArrowForward';
import Favorite from '@mui/icons-material/Favorite';
import FavoriteBorder from '@mui/icons-material/FavoriteBorder';
import PlaceOutlined from '@mui/icons-material/PlaceOutlined';
import LandscapeOutlined from '@mui/icons-material/LandscapeOutlined';
import Star from '@mui/icons-material/Star';
import { IconButton } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

type FavoriteAction = {
  active: boolean;
  onToggle: () => void;
  disabled?: boolean;
  unavailable?: boolean;
};

export default function PackageCard({
  item,
  favoriteAction,
}: {
  item: PackageListItem;
  favoriteAction?: FavoriteAction;
}) {
  const [failedImage, setFailedImage] = useState<string | null>(null);

  const path = item.packageImages.find((image) => image.trim());

  const image =
    path &&
    (/^https?:\/\//i.test(path)
      ? path
      : API_URL
        ? `${API_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`
        : undefined);

  const isSaved = favoriteAction?.active ?? false;

  return (
    <article className={isSaved ? 'home-card saved-package-card' : 'home-card'}>
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
        {isSaved && (
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
                {isSaved && ` (${item.packageReviewCount} reviews)`}
              </>
            ) : (
              <span>No reviews yet</span>
            )}
          </p>
        </div>

        <h3 title={item.packageTitle}>
          <Link href={`/package/${item._id}`}>{item.packageTitle}</Link>
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

          {isSaved && (
            <Link
              className="saved-package-view"
              href={`/package/${item._id}`}
            >
              View <ArrowForward fontSize="small" />
            </Link>
          )}
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
