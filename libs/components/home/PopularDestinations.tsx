import { GET_TRAVEL_PACKAGES } from '@/apollo/user/query';
import { packageImageUrl } from '@/libs/components/package/PackageImage';
import { useQuery } from '@apollo/client';
import LandscapeOutlined from '@mui/icons-material/LandscapeOutlined';
import { Alert, Button, Skeleton } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

const localDestinationImages: Record<string, string> = {
	seoul: '/images/home/hero/04-east-asia/seoul.jpg',
	busan: '/images/home/hero/04-east-asia/busan.jpg',
	tokyo: '/images/home/tokyo.svg',
	paris: '/images/home/hero/03-europe/paris.jpg',
	dubai: '/images/home/dubai.svg',
};

function normalizedPlace(value: string) {
	return value.trim().toLocaleLowerCase();
}

function isSensiblePlace(city: string, country: string) {
	const placePattern = /^[\p{L}][\p{L}\p{M} .'-]{1,47}$/u;
	return placePattern.test(city.trim()) && country.trim().length >= 4 && placePattern.test(country.trim());
}

function DestinationImage({ city, image }: { city: string; image?: string }) {
	const local = localDestinationImages[normalizedPlace(city)];
	const src = local ?? packageImageUrl(image);
	const [failed, setFailed] = useState(false);
	return src && !failed ? (
		<Image src={src} alt="" fill unoptimized={!local} sizes="(max-width: 767px) 100vw, (max-width: 1100px) 50vw, 300px" onError={() => setFailed(true)} />
	) : <div className="home-image-placeholder" aria-hidden="true"><LandscapeOutlined /></div>;
}

export default function PopularDestinations() {
	const query = useQuery(GET_TRAVEL_PACKAGES, {
		variables: { input: { page: 1, limit: 50, sort: 'packageRating', direction: 'DESC' } },
	});
	const destinations = (query.data?.getTravelPackages.list ?? [])
		.filter((item) => isSensiblePlace(item.destinationCity, item.destinationCountry))
		.filter((item, index, list) => {
			const key = `${normalizedPlace(item.destinationCity)}|${normalizedPlace(item.destinationCountry)}`;
			return list.findIndex((candidate) => `${normalizedPlace(candidate.destinationCity)}|${normalizedPlace(candidate.destinationCountry)}` === key) === index;
		})
			.slice(0, 3);
	return (
		<section className="home-section" aria-labelledby="home-destinations-title">
			<div className="home-section-heading"><div><span className="home-section-kicker">Ideas for your next escape</span>
				<h2 id="home-destinations-title">Popular Destinations</h2></div><Link href="/package">Explore all packages →</Link></div>
			{query.loading ? <div className="home-destinations-grid">{Array.from({ length: 3 }, (_, index) => <Skeleton key={index} variant="rounded" height={320} />)}</div>
				: query.error ? <Alert severity="info" action={<Button onClick={() => void query.refetch()}>Retry</Button>}>Destinations could not be loaded.</Alert>
				: destinations.length === 0 ? <div className="home-empty-state">No destinations are available yet.</div>
				: <div className="home-destinations-grid">{destinations.map((item) => (
					<Link className="home-destination" key={item._id} href={{ pathname: '/package', query: { country: item.destinationCountry } }}>
						<DestinationImage city={item.destinationCity} image={item.packageImages.find((image) => image.trim())} />
						<div><h3>{item.destinationCity}</h3><p>{item.destinationCountry}</p></div>
					</Link>
				))}</div>}
		</section>
	);
}
