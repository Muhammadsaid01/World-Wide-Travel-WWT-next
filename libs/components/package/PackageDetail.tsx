import { currentUserVar } from '@/apollo/store';
import { TOGGLE_SAVED_PACKAGE } from '@/apollo/user/mutation';
import {
	GET_PACKAGE_SCHEDULES,
	GET_SAVED_PACKAGES,
	GET_TRAVEL_PACKAGE,
	GET_TRAVEL_PACKAGES,
} from '@/apollo/user/query';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import Favorite from '@mui/icons-material/Favorite';
import FavoriteBorder from '@mui/icons-material/FavoriteBorder';
import ShareOutlined from '@mui/icons-material/ShareOutlined';
import { Alert, Breadcrumbs, Button, Chip, Skeleton } from '@mui/material';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import PackageAgentCard from './PackageAgentCard';
import PackageBookingCard from './PackageBookingCard';
import PackageCard from './PackageCard';
import PackageImage from './PackageImage';
import PackageInclusions from './PackageInclusions';
import PackageItinerary from './PackageItinerary';
import PackagePolicy from './PackagePolicy';
import PackageReviews from './PackageReviews';
import PackageSchedules from './PackageSchedules';
import PackageTags from './PackageTags';

export default function PackageDetail({ id, ready }: { id: string; ready: boolean }) {
	// The route keys this component by package ID, resetting selection on navigation.
	const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);
	const user = useReactiveVar(currentUserVar);
const router = useRouter();

const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
const [favoriteBusyId, setFavoriteBusyId] = useState<string | null>(null);

const [toggleSavedPackage] = useMutation(TOGGLE_SAVED_PACKAGE);
	const valid = /^[a-f\d]{24}$/i.test(id);
	const { data, loading, error, refetch } = useQuery(GET_TRAVEL_PACKAGE, {
		variables: { input: id },
		skip: !ready || !valid,
	});
	const item = data?.getTravelPackage;
	const schedules = useQuery(GET_PACKAGE_SCHEDULES, {
		variables: { packageId: item?._id ?? id },
		skip: !item,
		notifyOnNetworkStatusChange: true,
	});
	const related = useQuery(GET_TRAVEL_PACKAGES, {
		variables: { input: { page: 1, limit: 5, search: { packageCategory: item?.packageCategory } } },
		skip: !item,
	});
	const savedPackagesQuery = useQuery(GET_SAVED_PACKAGES, {
		variables: {
			input: {
				page: 1,
				limit: 100,
			},
		},
		skip: !user,
		fetchPolicy: 'no-cache',
	});

	useEffect(() => {
  if (!user) {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSavedIds(new Set());
    return;
  }

  const savedPackages = savedPackagesQuery.data?.getFavorities?.list;

  if (!savedPackages) return;
  setSavedIds(
    new Set(savedPackages.map((savedPackage) => savedPackage._id)),
  );
}, [user, savedPackagesQuery.data]);

async function handleFavoriteToggle(packageId: string) {
  if (!user) {
    await router.push('/account/login');
    return;
  }

  if (favoriteBusyId) return;

  const wasSaved = savedIds.has(packageId);

  setFavoriteBusyId(packageId);

  setSavedIds((previous) => {
    const next = new Set(previous);

    if (wasSaved) {
      next.delete(packageId);
    } else {
      next.add(packageId);
    }

    return next;
  });

  try {
    await toggleSavedPackage({
      variables: {
        packageId,
      },
    });

    await savedPackagesQuery.refetch();
  } catch (error) {
    setSavedIds((previous) => {
      const next = new Set(previous);

      if (wasSaved) {
        next.add(packageId);
      } else {
        next.delete(packageId);
      }

      return next;
    });

    console.error('Favorite toggle failed:', error);
  } finally {
    setFavoriteBusyId(null);
  }
}
	const relatedItems = related.data?.getTravelPackages.list.filter((entry) => entry._id !== id).slice(0, 4) ?? [];
	const notFound =
		!valid ||
		error?.graphQLErrors.some((entry) => entry.extensions?.code === 'NOT_FOUND' || entry.message === 'No data found!');

	if (!ready || loading)
		return (
			<div className="package-detail detail-container" aria-busy="true" aria-label="Loading package">
				<Skeleton width="40%" height={40} />
				<Skeleton height={80} />
				<Skeleton variant="rounded" height={420} />
				<div className="detail-split">
					<Skeleton height={240} />
					<Skeleton height={240} />
				</div>
			</div>
		);
	if (notFound || (!error && !item))
		return (
			<div className="package-detail detail-container detail-state">
				<h1>Package not found</h1>
				<Button component={Link} href="/package">
					Back to Packages
				</Button>
			</div>
		);
	if (error || !item)
		return (
			<div className="package-detail detail-container detail-state">
				<Alert severity="error">Unable to load this package.</Alert>
				<Button
					onClick={() => {
						void refetch().catch(() => undefined);
					}}
				>
					Retry
				</Button>
				<Button component={Link} href="/package">
					Back to Packages
				</Button>
			</div>
		);

	const images = [...new Set(item.packageImages.filter((path) => path.trim()))];
	const agent = item.agentData;
	return (
		<div className="wwt-home wwt-packages package-detail">
			<Head>
				<title>{item.packageTitle} | WWT</title>
			</Head>
			<div className="detail-container">
				<Breadcrumbs className="detail-breadcrumbs">
					<Link href="/">Home</Link>
					<Link href="/package">Packages</Link>
					<span aria-current="page">{item.packageTitle}</span>
				</Breadcrumbs>
				<header className="detail-header">
					<div>
						<Chip label={item.packageCategory.charAt(0) + item.packageCategory.slice(1).toLowerCase()} size="small" />
						<h1>{item.packageTitle}</h1>
						<div className="detail-meta">
							<span>
								{item.destinationCity}, {item.destinationCountry}
							</span>
							<span>
								{item.packageDays} days / {item.packageNights} nights
							</span>
							<span>
								{item.packageReviewCount > 0
									? `★ ${item.packageRating.toFixed(1)} (${item.packageReviewCount} reviews)`
									: 'No reviews yet'}
							</span>
						</div>
					</div>
					<div className="detail-actions">
						<Button disabled startIcon={<ShareOutlined />}>
							Share
						</Button>
						<Button
							disabled={favoriteBusyId === item._id}
							startIcon={
								savedIds.has(item._id) ? (
									<Favorite color="error" />
								) : (
									<FavoriteBorder />
								)
							}
							onClick={() => {
								void handleFavoriteToggle(item._id);
							}}
						>
							{savedIds.has(item._id) ? 'Saved' : 'Save'}
						</Button>
					</div>
				</header>
				<div className={`detail-gallery${images.length > 1 ? ' has-secondary' : ''}`}>
					<div className="detail-gallery-main">
						<PackageImage path={images[0]} alt={item.packageTitle} />
					</div>
					{images.slice(1, 3).map((path, index) => (
						<div className="detail-gallery-secondary" key={path}>
							<PackageImage path={path} alt={`${item.packageTitle}, photo ${index + 2}`} />
						</div>
					))}
				</div>
				<div className="detail-split">
					<div className="detail-main">
						<PackageSchedules
							query={schedules}
							selectedScheduleId={selectedScheduleId}
							onSelectSchedule={setSelectedScheduleId}
						/>
						<section className="detail-section">
							<h2>About this journey</h2>
							{item.packageShortDesc && <p className="detail-lead detail-prose">{item.packageShortDesc}</p>}
							<p className="detail-prose">{item.packageDesc}</p>
						</section>
						<PackageInclusions packageId={item._id} />
						<PackageTags packageId={item._id} />
						<PackageItinerary packageId={item._id} />
						{agent && <PackageAgentCard agent={agent} />}
						<PackagePolicy packageId={item._id} />
						<PackageReviews packageId={id} rating={item.packageRating} count={item.packageReviewCount} />
					</div>
					<PackageBookingCard
						key={selectedScheduleId ?? 'unselected'}
						item={item}
						selectedScheduleId={selectedScheduleId}
						schedule={schedules.data?.getPackageSchedules.find((schedule) => schedule._id === selectedScheduleId)}
						schedulesReady={!schedules.loading && !schedules.error && Boolean(schedules.data)}
					/>
				</div>
				{!related.error && relatedItems.length > 0 && (
					<section className="detail-related">
						<h2>You May Also Like</h2>
						<p>More journeys in the same category.</p>
						<div className="detail-related-grid">
							{relatedItems.map((entry) => (
								<PackageCard
									key={entry._id}
									item={entry}
									favoriteAction={{
										active: savedIds.has(entry._id),
										disabled: favoriteBusyId === entry._id,
										onToggle: () => {
											void handleFavoriteToggle(entry._id);
										},
									}}
								/>
							))}
						</div>
					</section>
				)}
			</div>
		</div>
	);
}
