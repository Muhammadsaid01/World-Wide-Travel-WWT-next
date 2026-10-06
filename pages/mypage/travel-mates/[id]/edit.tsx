import { useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import { Skeleton } from '@mui/material';
import { currentUserVar } from '@/apollo/store';
import { restoreUserFromToken } from '@/libs/auth';
import TravelMateEdit from '@/libs/components/community/travel-mate/TravelMateEdit';
import withLayout from '@/libs/components/layout/withLayout';

function EditTravelMatePage() {
	const router = useRouter();
	const user = useReactiveVar(currentUserVar);
	const id = typeof router.query.id === 'string' ? router.query.id : '';

	useEffect(() => {
		if (!router.isReady) return;
		const current = currentUserVar() ?? restoreUserFromToken();
		if (!current?._id) void router.replace('/account/login');
	}, [router, user?._id]);

	return (
		<>
			<Head><title>Edit Travel Mate | WWT</title></Head>
			{!router.isReady || !user?._id ? (
				<Skeleton aria-label="Checking account access" height={220} />
			) : (
				<TravelMateEdit key={`${id}:${user._id}`} id={id} memberId={user._id} />
			)}
		</>
	);
}

export default withLayout(EditTravelMatePage);
