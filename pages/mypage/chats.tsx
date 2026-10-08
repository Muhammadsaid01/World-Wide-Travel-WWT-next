import { currentUserVar } from '@/apollo/store';
import ChatRoom from '@/libs/components/chat/ChatRoom';
import withLayout from '@/libs/components/layout/withLayout';
import { restoreUserFromToken } from '@/libs/auth';
import { MemberType } from '@/libs/enums/member.enum';
import { useReactiveVar } from '@apollo/client';
import { CircularProgress } from '@mui/material';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

function ChatsPage() {
	const router = useRouter();
	const user = useReactiveVar(currentUserVar);
	const canUseChat =
		user?.memberType === MemberType.USER ||
		user?.memberType === MemberType.AGENT ||
		user?.memberType === MemberType.ADMIN;
	useEffect(() => {
		const current = currentUserVar() ?? restoreUserFromToken();
		if (!current) {
			void router.replace('/account/login');
			return;
		}
	}, [router]);

	return (
		<>
			<Head><title>Chats | WWT</title></Head>
			{user?._id && canUseChat ? <ChatRoom memberId={user._id} /> : <div className="chat-page-loading"><CircularProgress /></div>}
		</>
	);
}

export default withLayout(ChatsPage);
