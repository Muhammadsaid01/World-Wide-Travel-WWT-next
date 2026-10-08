import { currentUserVar } from '@/apollo/store';
import useSocket from '@/libs/hooks/useSocket';
import ChatBubbleOutline from '@mui/icons-material/ChatBubbleOutlineOutlined';
import Close from '@mui/icons-material/Close';
import { IconButton, Paper, Tab, Tabs, Typography } from '@mui/material';
import { useReactiveVar } from '@apollo/client';
import { useRouter } from 'next/router';
import { useState } from 'react';
import AiBot from './AiBot';
import OpenChat from './OpenChat';

export default function ChatWidget() {
	const user = useReactiveVar(currentUserVar);
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const [tab, setTab] = useState<'open' | 'ai'>('open');
	const socket = useSocket(open && Boolean(user?._id));

	if (router.pathname === '/mypage/chats') return null;

	return (
		<div className={`wwt-chat-widget${open ? ' is-open' : ''}`}>
			{open && (
				<Paper className="wwt-chat-panel" role="dialog" aria-modal="false" aria-labelledby="wwt-chat-title">
					<header><div><Typography id="wwt-chat-title" component="h2">WWT Chat</Typography><Typography color="text.secondary">Connect and plan your journey</Typography></div>
						<IconButton onClick={() => setOpen(false)} aria-label="Close WWT Chat"><Close /></IconButton></header>
					<Tabs value={tab} onChange={(_, value: 'open' | 'ai') => setTab(value)} variant="fullWidth" aria-label="WWT chat modes">
						<Tab value="open" label="Open Chat" /><Tab value="ai" label="AI Assistant" />
					</Tabs>
					<div className="wwt-chat-panel-body">
						{tab === 'open' ? <OpenChat user={user} socket={socket} /> : <AiBot user={user} socket={socket} />}
					</div>
				</Paper>
			)}
			<IconButton className="wwt-chat-launcher" onClick={() => setOpen((value) => !value)} aria-label={open ? 'Close WWT Chat' : 'Open WWT Chat'} aria-expanded={open}>
				{open ? <Close /> : <ChatBubbleOutline />}
			</IconButton>
		</div>
	);
}
