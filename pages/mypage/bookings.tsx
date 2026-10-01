import { useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import { Skeleton } from '@mui/material';
import withLayout from '@/libs/components/layout/withLayout';
import AgentBookings from '@/libs/components/mypage/AgentBookings';
import { currentUserVar } from '@/apollo/store';
import { restoreUserFromToken } from '@/libs/auth';
import { MemberType } from '@/libs/enums/member.enum';
function AgentBookingsPage() {
	const router = useRouter();
	const user = useReactiveVar(currentUserVar);
	useEffect(() => {
		if (!router.isReady) return;
		const current = currentUserVar() ?? restoreUserFromToken();
		if (!current?._id) void router.replace('/account/login');
		else if (current.memberType !== MemberType.AGENT) void router.replace('/mypage');
	}, [router, user?._id, user?.memberType]);
	return (
		<>
			<Head>
				<title>Business Bookings | WWT</title>
			</Head>
			{!router.isReady || !user?._id || user.memberType !== MemberType.AGENT ? (
				<Skeleton aria-label="Checking agent access" height={180} />
			) : (
				<AgentBookings key={user._id} memberId={user._id} />
			)}
		</>
	);
}
export default withLayout(AgentBookingsPage);
