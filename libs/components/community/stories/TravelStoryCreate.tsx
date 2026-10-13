import { useEffect, useRef, useState } from 'react';
import { useMutation, useReactiveVar } from '@apollo/client';
import { Breadcrumbs, Button, Skeleton } from '@mui/material';
import ArrowBack from '@mui/icons-material/ArrowBack';
import HomeOutlined from '@mui/icons-material/HomeOutlined';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { currentUserVar } from '@/apollo/store';
import { CREATE_BOARD_ARTICLE, UPLOAD_ARTICLE_IMAGE } from '@/apollo/user/mutation';
import { restoreUserFromToken } from '@/libs/auth';
import ArticleForm, { type ArticleFormValues } from '../article/ArticleForm';
import { useTranslation } from 'react-i18next';

function errorMessage(error: unknown, fallback: string) {
	return error instanceof Error && error.message ? `${fallback} ${error.message}` : fallback;
}

export default function TravelStoryCreate() {
	const { t } = useTranslation(['community', 'common']);
	const router = useRouter();
	const user = useReactiveVar(currentUserVar);
	const [submitError, setSubmitError] = useState('');
	const [submitting, setSubmitting] = useState(false);
	const submitLock = useRef(false);
	const cancelRequested = useRef(false);
	const [uploadImage] = useMutation(UPLOAD_ARTICLE_IMAGE, { fetchPolicy: 'no-cache' });
	const [createArticle] = useMutation(CREATE_BOARD_ARTICLE, { fetchPolicy: 'no-cache' });

	useEffect(() => {
		if (!router.isReady) return;
		const current = currentUserVar() ?? restoreUserFromToken();
		if (!current?._id) void router.replace('/account/login');
	}, [router, user?._id]);

	async function submit(values: ArticleFormValues) {
		if (submitLock.current) return;
		submitLock.current = true;
		cancelRequested.current = false;
		setSubmitting(true);
		setSubmitError('');
		try {
			const current = currentUserVar() ?? restoreUserFromToken();
			if (!current?._id) {
				await router.replace('/account/login');
				return;
			}

			let uploadedPath = '';
			if (values.coverFile) {
				try {
					const uploadResponse = await uploadImage({ variables: { file: values.coverFile } });
					uploadedPath = uploadResponse.data?.imageUploader ?? '';
					if (!uploadedPath) throw new Error(t('create.uploadNoPath'));
				} catch (error: unknown) {
					setSubmitError(errorMessage(error, t('create.uploadError')));
					return;
				}
			}
			if (cancelRequested.current) return;

			let createResponse;
			try {
				createResponse = await createArticle({
					variables: {
						input: {
							articleCategory: values.articleCategory,
							articleTitle: values.articleTitle,
							articleContent: values.articleContent,
							articleImages: uploadedPath ? [uploadedPath] : [],
						},
					},
				});
			} catch (error: unknown) {
				setSubmitError(errorMessage(error, t('create.publishError')));
				return;
			}
			if (cancelRequested.current) return;
			const createdArticle = createResponse.data?.createBoardArticle;
			if (!createdArticle?._id) throw new Error(t('create.missingId'));
			await router.push(`/community/stories/${createdArticle._id}`);
		} catch (error: unknown) {
			setSubmitError(errorMessage(error, t('create.publishRetry')));
		} finally {
			submitLock.current = false;
			setSubmitting(false);
		}
	}

	if (!router.isReady || !user?._id) {
		return (
			<div className="travel-story-create">
				<Skeleton className="travel-story-create-checking" aria-label={t('create.checking')} height={240} />
			</div>
		);
	}

	return (
		<div className="travel-story-create">
			<div className="travel-stories-container">
				<Breadcrumbs separator="›" aria-label={t('create.breadcrumb')}>
					<Link href="/"><HomeOutlined fontSize="small" /> {t('navigation.home', { ns: 'common' })}</Link>
					<Link href="/community">{t('navigation.community', { ns: 'common' })}</Link>
					<Link href="/community/stories">{t('stories.title')}</Link>
					<span aria-current="page">{t('create.breadcrumb')}</span>
				</Breadcrumbs>
				<Button component={Link} href="/community/stories" startIcon={<ArrowBack />} className="travel-story-detail-back">
					{t('create.back')}
				</Button>
				<ArticleForm
					member={user}
					submitting={submitting}
					submitError={submitError}
					onSubmit={(values) => void submit(values)}
					onCancel={() => {
						cancelRequested.current = true;
						void router.push('/community/stories');
					}}
				/>
			</div>
		</div>
	);
}
