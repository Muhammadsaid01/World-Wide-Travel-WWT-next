import { useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import { Skeleton } from '@mui/material';
import { currentUserVar } from '@/apollo/store';
import { restoreUserFromToken } from '@/libs/auth';
import TravelMateCreate from '@/libs/components/community/travel-mate/TravelMateCreate';
import withLayout from '@/libs/components/layout/withLayout';

function CreateTravelMatePage() {
	const router = useRouter();
	const user = useReactiveVar(currentUserVar);

	useEffect(() => {
		if (!router.isReady) return;
		const current = currentUserVar() ?? restoreUserFromToken();
		if (!current?._id) void router.replace('/account/login');
	}, [router, user?._id]);

	return (
		<>
			<Head><title>Create Travel Mate | WWT</title></Head>
			{!router.isReady || !user?._id ? (
				<Skeleton aria-label="Checking account access" height={220} />
			) : (
				<TravelMateCreate key={user._id} />
			)}
		</>
	);
}

export default withLayout(CreateTravelMatePage);
