import { useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useMutation } from '@apollo/client';
import { Breadcrumbs } from '@mui/material';
import { CREATE_TRAVEL_MATE_POST } from '@/apollo/user/mutation';
import ProfileSidebar from '@/libs/components/mypage/ProfileSidebar';
import TravelMateForm, { type TravelMateFormValues } from './TravelMateForm';

export default function TravelMateCreate() {
	const router = useRouter();
	const lock = useRef(false);
	const [submitError, setSubmitError] = useState('');
	const [createPost, { loading }] = useMutation(CREATE_TRAVEL_MATE_POST);

	async function submit(values: TravelMateFormValues) {
		if (lock.current) return;
		lock.current = true;
		setSubmitError('');
		try {
			const response = await createPost({ variables: { input: values } });
			const id = response.data?.createTravelMatePost._id;
			if (!id) throw new Error('The server did not return the new post ID.');
			await router.push(`/community/travel-mate/${id}`);
		} catch (error) {
			setSubmitError(error instanceof Error ? error.message : 'The travel mate post could not be created.');
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
				<span aria-current="page">Create</span>
			</Breadcrumbs>
			<div className="my-bookings-layout">
				<ProfileSidebar active="My Travel Mates" />
				<TravelMateForm
					mode="create"
					submitting={loading}
					submitError={submitError}
					onSubmit={(values) => void submit(values)}
					onCancel={() => void router.push('/mypage/travel-mates')}
				/>
			</div>
		</div>
	);
}
