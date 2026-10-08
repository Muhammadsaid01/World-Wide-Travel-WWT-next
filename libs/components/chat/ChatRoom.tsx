import {
	GET_MY_CONVERSATIONS,
	GET_MY_UNREAD_MESSAGE_COUNT,
	GET_PRIVATE_CONVERSATION,
	GET_PRIVATE_MESSAGES,
} from '@/apollo/user/query';
import { MARK_CONVERSATION_AS_READ } from '@/apollo/user/mutation';
import useSocket, { type SocketEvent } from '@/libs/hooks/useSocket';
import type { PrivateConversation } from '@/libs/types/chat/private-conversation';
import type { PrivateMessage } from '@/libs/types/chat/private-message';
import { useApolloClient, useMutation, useQuery } from '@apollo/client';
import { Alert, Paper, Snackbar, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ChatHeader from './ChatHeader';
import ConversationList from './ConversationList';
import MessageInput from './MessageInput';
import MessageList from './MessageList';
import { conversationMember } from './chatUtils';
import { mergePrivateMessage, privateMessageEventAction } from './chatRealtimeState';

const PAGE_SIZE = 20;
const MESSAGE_PAGE_SIZE = 30;

export default function ChatRoom({ memberId, onUnreadChange }: { memberId: string; onUnreadChange?: () => void }) {
	const router = useRouter();
	const apolloClient = useApolloClient();
	const requestedId = typeof router.query.conversation === 'string' ? router.query.conversation : '';
	const [page, setPage] = useState(1);
	const [selectedId, setSelectedId] = useState('');
	const [messages, setMessages] = useState<PrivateMessage[]>([]);
	const [messagePage, setMessagePage] = useState(1);
	const [loadingOlder, setLoadingOlder] = useState(false);
	const [sending, setSending] = useState(false);
	const [sentKey, setSentKey] = useState(0);
	const [notice, setNotice] = useState('');
	const [mobileRoom, setMobileRoom] = useState(false);
	const readConversationRef = useRef('');
	const { status: socketStatus, error: socketError, send: sendSocket, subscribe } = useSocket(true);

	const conversationsQuery = useQuery(GET_MY_CONVERSATIONS, {
		variables: { input: { page, limit: PAGE_SIZE, sort: 'lastMessageAt', direction: 'DESC' } },
		fetchPolicy: 'network-only',
		notifyOnNetworkStatusChange: true,
	});
	const conversations = useMemo(
		() => conversationsQuery.data?.getMyConversations.list ?? [],
		[conversationsQuery.data],
	);
	const refetchConversations = conversationsQuery.refetch;
	const total = conversationsQuery.data?.getMyConversations.metaCounter?.[0]?.total ?? 0;

	useEffect(() => {
		if (!router.isReady || !requestedId) return;
		// Synchronize shallow-route selection with the responsive chat view.
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setSelectedId(requestedId);
		setMobileRoom(true);
	}, [requestedId, router.isReady]);

	const detailQuery = useQuery(GET_PRIVATE_CONVERSATION, {
		variables: { conversationId: selectedId },
		skip: !selectedId || conversations.some((item) => item._id === selectedId),
		fetchPolicy: 'network-only',
	});
	const selected = useMemo(
		() => conversations.find((item) => item._id === selectedId) ?? detailQuery.data?.getConversation,
		[conversations, detailQuery.data, selectedId],
	);

	const messagesQuery = useQuery(GET_PRIVATE_MESSAGES, {
		variables: {
			conversationId: selectedId,
			input: { page: 1, limit: MESSAGE_PAGE_SIZE, sort: 'createdAt', direction: 'DESC' },
		},
		skip: !selectedId,
		fetchPolicy: 'network-only',
		notifyOnNetworkStatusChange: true,
	});
	const [markRead] = useMutation(MARK_CONVERSATION_AS_READ);
	const messageTotal = messagesQuery.data?.getMessages.metaCounter?.[0]?.total ?? 0;
	const refetchMessages = messagesQuery.refetch;

	useEffect(() => {
		// A conversation switch starts a separate paginated message stream.
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setMessages([]);
		setMessagePage(1);
		readConversationRef.current = '';
	}, [selectedId]);

	useEffect(() => {
		if (!messagesQuery.data || !selectedId) return;
		// Apollo owns the authoritative first page; realtime events extend this local ordered view.
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setMessages([...messagesQuery.data.getMessages.list].reverse());
		if (readConversationRef.current === selectedId) return;
		readConversationRef.current = selectedId;
		void markRead({ variables: { conversationId: selectedId } })
			.then(async () => {
				await refetchConversations();
				onUnreadChange?.();
			})
			.catch(() => { readConversationRef.current = ''; });
	}, [markRead, messagesQuery.data, onUnreadChange, refetchConversations, selectedId]);

	const refreshConversationState = useCallback(() => {
		void refetchConversations().catch(() => undefined);
		void apolloClient
			.refetchQueries({ include: [GET_MY_UNREAD_MESSAGE_COUNT] })
			.catch(() => undefined);
		onUnreadChange?.();
	}, [apolloClient, onUnreadChange, refetchConversations]);

	useEffect(() => {
		const onNewMessage = (event: SocketEvent<PrivateMessage>) => {
			const message = event.data;
			if (!message) return;
			const action = privateMessageEventAction('incoming', message, memberId, selectedId);
			if (!action.refreshConversationList) return;
			if (action.appendToActiveConversation) {
				setMessages((current) => mergePrivateMessage(current, message));
			}
			if (action.markActiveConversationRead) {
				void markRead({ variables: { conversationId: selectedId } }).then(refreshConversationState).catch(() => undefined);
			} else {
				refreshConversationState();
			}
		};
		const onSent = (event: SocketEvent<PrivateMessage>) => {
			setSending(false);
			if (!event.data) return;
			const action = privateMessageEventAction('sent', event.data, memberId, selectedId);
			if (!action.refreshConversationList) return;
			if (action.appendToActiveConversation) {
				setMessages((current) => mergePrivateMessage(current, event.data!));
				setSentKey((current) => current + 1);
			}
			refreshConversationState();
		};
		const onError = (event: SocketEvent) => {
			setSending(false);
			setNotice(event.message || 'The message could not be sent.');
		};
		const unsubscribeNew = subscribe('newMessage', onNewMessage);
		const unsubscribeSent = subscribe('messageSent', onSent);
		const unsubscribeError = subscribe('messageError', onError);
		const unsubscribeConversationError = subscribe('conversationError', onError);
		return () => { unsubscribeNew(); unsubscribeSent(); unsubscribeError(); unsubscribeConversationError(); };
	}, [markRead, memberId, refreshConversationState, selectedId, subscribe]);

	useEffect(() => {
		// Socket connectivity is external state; release an in-flight UI lock after disconnect.
		// eslint-disable-next-line react-hooks/set-state-in-effect
		if (socketStatus !== 'connected') setSending(false);
	}, [socketStatus]);

	useEffect(() => {
		if (socketStatus !== 'connected' || !selectedId) return;
		sendSocket('joinConversation', { conversationId: selectedId });
		// A message can be persisted while this browser is disconnected. Reconcile
		// the active room and counters once the authenticated socket is ready so a
		// missed event never requires a page refresh.
		void Promise.allSettled([
			refetchMessages(),
			refetchConversations(),
			apolloClient.refetchQueries({ include: [GET_MY_UNREAD_MESSAGE_COUNT] }),
		]).then(() => onUnreadChange?.());
		return () => { sendSocket('leaveConversation', { conversationId: selectedId }); };
	}, [apolloClient, onUnreadChange, refetchConversations, refetchMessages, selectedId, sendSocket, socketStatus]);

	async function loadOlder() {
		if (!selectedId || loadingOlder || messages.length >= messageTotal) return;
		setLoadingOlder(true);
		const nextPage = messagePage + 1;
		try {
			const result = await messagesQuery.fetchMore({
				variables: { conversationId: selectedId, input: { page: nextPage, limit: MESSAGE_PAGE_SIZE, sort: 'createdAt', direction: 'DESC' } },
			});
			setMessages((current) =>
				current.reduce(
					mergePrivateMessage,
					result.data.getMessages.list.slice().reverse(),
				),
			);
			setMessagePage(nextPage);
		} catch {
			setNotice('Older messages could not be loaded.');
		} finally {
			setLoadingOlder(false);
		}
	}

	function chooseConversation(conversation: PrivateConversation) {
		setSelectedId(conversation._id);
		setMobileRoom(true);
		void router.replace({ pathname: '/mypage/chats', query: { conversation: conversation._id } }, undefined, { shallow: true });
	}

	return (
		<section className={`chat-page${mobileRoom && selected ? ' is-room-open' : ''}`}>
		<Paper className="chat-shell">
			<aside className="chat-sidebar">
				<ConversationList conversations={conversations} currentMemberId={memberId} selectedId={selectedId}
					loading={conversationsQuery.loading} error={conversationsQuery.error?.message} page={page}
					pageCount={Math.max(1, Math.ceil(total / PAGE_SIZE))} onPageChange={setPage}
					onSelect={chooseConversation} onRetry={() => { void conversationsQuery.refetch(); }} />
			</aside>
			<main className="chat-room">
				{selected ? <>
					<ChatHeader member={conversationMember(selected, memberId)} onBack={() => setMobileRoom(false)} />
					{socketError && socketStatus !== 'connected' && <Alert severity="warning" className="chat-connection-alert">{socketError}</Alert>}
					<MessageList conversationId={selected._id} messages={messages} currentMemberId={memberId}
						loading={messagesQuery.loading && !messages.length} error={messagesQuery.error?.message}
						hasOlder={messages.length < messageTotal} loadingOlder={loadingOlder} onLoadOlder={loadOlder}
						onRetry={() => { void messagesQuery.refetch(); }} />
					<MessageInput key={`${selected._id}-${sentKey}`} sending={sending} disabled={socketStatus !== 'connected'} onSend={(content) => {
						setSending(true);
						if (!sendSocket('privateMessage', { conversationId: selected._id, messageContent: content })) {
							setSending(false); setNotice('Realtime chat is reconnecting. Please try again.');
						}
					}} />
				</> : <div className="chat-room-placeholder"><Typography component="h2">Select a conversation</Typography><Typography color="text.secondary">Choose a member to view your messages.</Typography></div>}
			</main>
		</Paper>
		<Snackbar open={Boolean(notice)} autoHideDuration={5000} message={notice} onClose={() => setNotice('')} />
		</section>
	);
}
