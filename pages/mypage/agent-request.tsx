import { useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import { Skeleton } from '@mui/material';
import { currentUserVar } from '@/apollo/store';
import AgentRequest from '@/libs/components/agent/AgentRequest';
import withLayout from '@/libs/components/layout/withLayout';
import { restoreUserFromToken } from '@/libs/auth';
import { MemberType } from '@/libs/enums/member.enum';

function AgentRequestPage() {
	const router = useRouter();
	const user = useReactiveVar(currentUserVar);

	useEffect(() => {
		if (!router.isReady) return;
		const current = currentUserVar() ?? restoreUserFromToken();
		if (!current?._id) void router.replace('/account/login');
		else if (current.memberType !== MemberType.USER) void router.replace('/mypage');
	}, [router, user?._id, user?.memberType]);

	return (
		<>
			<Head>
				<title>Become an Agent | WWT</title>
			</Head>
			{!router.isReady || !user?._id || user.memberType !== MemberType.USER ? (
				<Skeleton aria-label="Checking member access" height={180} />
			) : (
				<AgentRequest key={user._id} />
			)}
		</>
	);
}

export default withLayout(AgentRequestPage);
