import { GET_OPEN_CHAT_MESSAGES } from '@/apollo/user/query';
import { packageImageUrl } from '@/libs/components/package/PackageImage';
import type { ChatSocket, SocketEvent } from '@/libs/hooks/useSocket';
import type { CustomJwtPayload } from '@/libs/types/customJwtPayload';
import type { OpenChatMessage } from '@/libs/types/chat/open-chat';
import Send from '@mui/icons-material/Send';
import { useQuery } from '@apollo/client';
import { Alert, Avatar, Button, CircularProgress, IconButton, TextField, Typography } from '@mui/material';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { chatMemberName, chatTime } from '../../chat/chatUtils';

const OPEN_PAGE_SIZE = 20;

function unique(messages: OpenChatMessage[]) {
	return Array.from(new Map(messages.map((message) => [message._id, message])).values()).sort((a, b) => {
		const difference = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
		return difference || a._id.localeCompare(b._id);
	});
}

export default function OpenChat({ user, socket }: { user: CustomJwtPayload | null; socket: ChatSocket }) {
	const { status: socketStatus, error: socketError, send, subscribe } = socket;
	const [messages, setMessages] = useState<OpenChatMessage[]>([]);
	const [page, setPage] = useState(1);
	const [value, setValue] = useState('');
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState('');
	const scroller = useRef<HTMLDivElement>(null);
	const pendingMessage = useRef('');
	const query = useQuery(GET_OPEN_CHAT_MESSAGES, {
		variables: { input: { page: 1, limit: OPEN_PAGE_SIZE, sort: 'createdAt', direction: 'DESC' } },
		skip: !user?._id,
		fetchPolicy: 'network-only',
	});
	const total = query.data?.getOpenChatMessages.metaCounter?.[0]?.total ?? 0;

	useEffect(() => {
		if (query.data) {
			// Apollo supplies the authoritative persisted page; socket events extend it.
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setMessages([...query.data.getOpenChatMessages.list].reverse());
		}
	}, [query.data]);

	useEffect(() => {
		if (socketStatus !== 'connected') return;
		send('openChatJoin');
		return () => { send('openChatLeave'); };
	}, [send, socketStatus]);

	useEffect(() => {
		const history = subscribe<{ list: OpenChatMessage[] }>('openChatMessages', (event) => {
			if (event.data?.list) setMessages((current) => unique([...event.data!.list].reverse().concat(current)));
		});
		const incoming = subscribe<OpenChatMessage>('openChatMessage', (event) => {
			if (!event.data) return;
			setMessages((current) => unique([...current, event.data!]));
			if (event.data.senderId === user?._id && event.data.messageContent === pendingMessage.current) {
				pendingMessage.current = '';
				setValue('');
				setBusy(false);
			}
		});
		const failed = subscribe('openChatError', (event: SocketEvent) => {
			setBusy(false); setError(event.message || 'Open Chat request failed.');
		});
		return () => { history(); incoming(); failed(); };
	}, [subscribe, user?._id]);

	useEffect(() => {
		// Socket connectivity is external state; release an in-flight UI lock after disconnect.
		// eslint-disable-next-line react-hooks/set-state-in-effect
		if (socketStatus !== 'connected') setBusy(false);
	}, [socketStatus]);

	useEffect(() => {
		const node = scroller.current;
		if (node) node.scrollTop = node.scrollHeight;
	}, [messages.length]);

	if (!user) return <div className="chat-auth-state"><Typography component="h3">Sign in to join Open Chat</Typography><Typography color="text.secondary">Open Chat uses your WWT member identity.</Typography><Button component={Link} href="/account/login" variant="contained">Sign in</Button></div>;

	async function loadOlder() {
		if (messages.length >= total) return;
		const next = page + 1;
		try {
			const result = await query.fetchMore({ variables: { input: { page: next, limit: OPEN_PAGE_SIZE, sort: 'createdAt', direction: 'DESC' } } });
			setMessages((current) => unique([...result.data.getOpenChatMessages.list].reverse().concat(current)));
			setPage(next);
		} catch { setError('Older Open Chat messages could not be loaded.'); }
	}

	function sendMessage() {
		const content = value.trim();
		if (!content || busy) return;
		setError(''); setBusy(true); pendingMessage.current = content;
		if (!send('openChatMessage', content)) { setBusy(false); setError('Open Chat is reconnecting.'); return; }
	}

	return <div className="open-chat">
		{(error || (socketError && socketStatus !== 'connected')) && <Alert severity="warning" onClose={() => setError('')}>{error || socketError}</Alert>}
		<div className="open-chat-messages" ref={scroller}>
			{messages.length < total && <Button size="small" onClick={() => { void loadOlder(); }}>Load older</Button>}
			{query.loading && !messages.length ? <CircularProgress size={24} /> : query.error ? <Alert severity="error" action={<Button onClick={() => { void query.refetch(); }}>Retry</Button>}>Open Chat could not be loaded.</Alert>
				: !messages.length ? <div className="chat-empty"><Typography component="h3">Start the conversation</Typography><Typography color="text.secondary">Be the first traveler to say hello.</Typography></div>
				: <ol>{messages.map((message) => { const name = chatMemberName(message.memberData); return <li key={message._id} className={message.senderId === user._id ? 'is-own' : ''}><Avatar src={packageImageUrl(message.memberData?.memberImage)} alt={name}>{name.slice(0, 1)}</Avatar><div><strong>{name}</strong><Typography>{message.messageContent}</Typography><time>{chatTime(message.createdAt)}</time></div></li>; })}</ol>}
		</div>
		<div className="open-chat-composer"><TextField value={value} multiline maxRows={3} placeholder="Message Open Chat…" slotProps={{ htmlInput: { maxLength: 2000, 'aria-label': 'Open Chat message' } }} onChange={(event) => setValue(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); sendMessage(); } }} /><IconButton color="primary" onClick={sendMessage} disabled={!value.trim() || busy || socketStatus !== 'connected'} aria-label="Send to Open Chat"><Send /></IconButton></div>
	</div>;
}
