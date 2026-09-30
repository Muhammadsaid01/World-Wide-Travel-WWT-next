import { useReactiveVar } from '@apollo/client';
import { useEffect } from 'react';
import { Alert, Skeleton } from '@mui/material';
import Link from 'next/link';
import { restoreUserFromToken } from '@/libs/auth';
import { MemberType } from '@/libs/enums/member.enum';
import Head from 'next/head';
import { useRouter } from 'next/router';

import { currentUserVar } from '@/apollo/store';
import withLayout from '@/libs/components/layout/withLayout';
import MyPackages from '@/libs/components/mypage/MyPackages';
import PackageForm from '@/libs/components/package/PackageForm/PackageForm';

function MyPackagesPage() {
	const router = useRouter();
	const user = useReactiveVar(currentUserVar);

	useEffect(() => {
		if (!router.isReady) return;
		const current = currentUserVar() ?? restoreUserFromToken();
		if (!current?._id) void router.replace('/account/login');
		else if (current.memberType !== MemberType.AGENT) void router.replace('/mypage');
	}, [router, user?._id, user?.memberType]);
	const editId = typeof router.query.edit === 'string' ? router.query.edit : undefined;

	return (
		<>
			<Head>
				<title>{editId ? 'Edit Package' : 'My Packages'} | WWT</title>
			</Head>

			{!router.isReady || !user?._id || user.memberType !== MemberType.AGENT ? (
				<Skeleton aria-label="Checking agent access" height={180} />
			) : router.query.edit !== undefined && (!editId || !/^[a-f0-9]{24}$/i.test(editId)) ? (
				<Alert severity="error">
					Invalid package ID. <Link href="/mypage/packages">Back to My Packages</Link>
				</Alert>
			) : editId ? (
				<PackageForm key={`${user._id}:${editId}`} memberId={user._id} mode="edit" packageId={editId} />
			) : (
				<MyPackages />
			)}
		</>
	);
}

export default withLayout(MyPackagesPage);
