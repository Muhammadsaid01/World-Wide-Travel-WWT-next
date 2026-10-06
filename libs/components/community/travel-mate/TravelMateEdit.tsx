import { useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useMutation, useQuery } from '@apollo/client';
import { Alert, Breadcrumbs, Button, Paper, Skeleton, Typography } from '@mui/material';
import { UPDATE_TRAVEL_MATE_POST } from '@/apollo/user/mutation';
import { GET_TRAVEL_MATE_DETAIL } from '@/apollo/user/query';
import ProfileSidebar from '@/libs/components/mypage/ProfileSidebar';
import TravelMateForm, { type TravelMateFormValues } from './TravelMateForm';

export default function TravelMateEdit({ id, memberId }: { id: string; memberId: string }) {
	const router = useRouter();
	const valid = /^[a-f\d]{24}$/i.test(id);
	const lock = useRef(false);
	const [submitError, setSubmitError] = useState('');
	const { data, loading, error, refetch } = useQuery(GET_TRAVEL_MATE_DETAIL, {
		variables: { postId: id },
		skip: !router.isReady || !valid,
		fetchPolicy: 'network-only',
	});
	const [updatePost, updateState] = useMutation(UPDATE_TRAVEL_MATE_POST);
	const post = data?.getTravelMatePost;
	const notFound =
		router.isReady &&
		(!valid || error?.graphQLErrors.some((item) => item.message === 'No data found!') || (!loading && !error && !post));

	async function submit(values: TravelMateFormValues) {
		if (!post || lock.current) return;
		lock.current = true;
		setSubmitError('');
		try {
			await updatePost({
				variables: {
					input: {
						_id: post._id,
						...values,
						departureCountry: values.departureCountry ?? '',
						departureCity: values.departureCity ?? '',
					},
				},
			});
			await router.push(`/community/travel-mate/${post._id}`);
		} catch (failure) {
			setSubmitError(failure instanceof Error ? failure.message : 'The travel mate post could not be updated.');
		} finally {
			lock.current = false;
		}
	}

	return (
		<div className="my-bookings-page travel-mate-form-page">
			<Breadcrumbs separator="›" className="my-bookings-breadcrumb">
				<Link href="/">Home</Link>
				<Link href="/mypage">My Profile</Link>
				<Link href="/mypage/travel-mates">My Travel Mates</Link>
				<span aria-current="page">Edit</span>
			</Breadcrumbs>
			<div className="my-bookings-layout">
				<ProfileSidebar active="My Travel Mates" />
				{!router.isReady || loading ? (
					<div className="travel-mate-form-shell" aria-label="Loading travel mate form">
						<Skeleton width="55%" height={64} />
						<Skeleton variant="rounded" height={600} />
					</div>
				) : notFound ? (
					<Paper className="travel-mate-form-state" variant="outlined">
						<Typography component="h1">Travel mate unavailable</Typography>
						<Typography>This post could not be found or is no longer editable.</Typography>
						<Button component={Link} href="/mypage/travel-mates">Back to My Travel Mates</Button>
					</Paper>
				) : error ? (
					<Alert severity="error" action={<Button onClick={() => void refetch()}>Retry</Button>}>
						Unable to load this travel mate. {error.message}
					</Alert>
				) : post?.memberId !== memberId ? (
					<Paper className="travel-mate-form-state" variant="outlined">
						<Typography component="h1">You cannot edit this post</Typography>
						<Typography>The post belongs to another member.</Typography>
						<Button component={Link} href="/mypage/travel-mates">Back to My Travel Mates</Button>
					</Paper>
				) : post ? (
					<TravelMateForm
						mode="edit"
						minimumCapacity={Math.max(2, post.currentMembers)}
						initialValues={{
							departureCountry: post.departureCountry,
							departureCity: post.departureCity,
							destinationCountry: post.destinationCountry,
							destinationCity: post.destinationCity,
							travelDate: post.travelDate,
							maxMembers: post.maxMembers,
							matePostTitle: post.matePostTitle,
							matePostContent: post.matePostContent,
						}}
						submitting={updateState.loading}
						submitError={submitError}
						onSubmit={(values) => void submit(values)}
						onCancel={() => void router.push('/mypage/travel-mates')}
					/>
				) : null}
			</div>
		</div>
	);
}
