import { Alert, Button, CircularProgress, Skeleton, Typography } from '@mui/material';
import { useLayoutEffect, useRef } from 'react';
import type { PrivateMessage } from '@/libs/types/chat/private-message';
import MessageItem from './MessageItem';
import { useTranslation } from 'react-i18next';

export default function MessageList({
	conversationId,
	messages,
	currentMemberId,
	loading,
	error,
	hasOlder,
	loadingOlder,
	onLoadOlder,
	onRetry,
}: {
	conversationId: string;
	messages: PrivateMessage[];
	currentMemberId: string;
	loading: boolean;
	error?: string;
	hasOlder: boolean;
	loadingOlder: boolean;
	onLoadOlder: () => Promise<void>;
	onRetry: () => void;
}) {
	const { t } = useTranslation(['chat', 'common']);
	const scroller = useRef<HTMLDivElement>(null);
	const previousConversation = useRef('');
	const preserve = useRef<{ height: number; top: number } | null>(null);
	const previousLast = useRef('');

	useLayoutEffect(() => {
		const node = scroller.current;
		if (!node) return;
		if (previousConversation.current !== conversationId) {
			previousConversation.current = conversationId;
			node.scrollTop = node.scrollHeight;
			previousLast.current = messages[messages.length - 1]?._id ?? '';
			return;
		}
		if (preserve.current) {
			node.scrollTop = preserve.current.top + (node.scrollHeight - preserve.current.height);
			preserve.current = null;
			return;
		}
		const last = messages[messages.length - 1]?._id ?? '';
		if (last && last !== previousLast.current) {
			const nearBottom = node.scrollHeight - node.scrollTop - node.clientHeight < 160;
			if (nearBottom) node.scrollTop = node.scrollHeight;
			previousLast.current = last;
		}
	}, [conversationId, messages]);

	return (
		<div className="chat-message-scroll" ref={scroller}>
			{hasOlder && <Button className="chat-load-older" disabled={loadingOlder} onClick={() => {
				const node = scroller.current;
				if (node) preserve.current = { height: node.scrollHeight, top: node.scrollTop };
				void onLoadOlder();
			}}>{loadingOlder ? <CircularProgress size={18} /> : t('loadOlder')}</Button>}
			{loading ? <div className="chat-message-skeleton"><Skeleton width="55%" height={60} /><Skeleton width="48%" height={60} /><Skeleton width="64%" height={60} /></div>
				: error ? <Alert severity="error" action={<Button onClick={onRetry}>{t('actions.retry', { ns: 'common' })}</Button>}>{error}</Alert>
				: messages.length === 0 ? <div className="chat-empty"><Typography component="h3">{t('sayHello')}</Typography><Typography color="text.secondary">{t('messageEmpty')}</Typography></div>
				: <ol>{messages.map((message) => <MessageItem key={message._id} message={message} own={message.senderId === currentMemberId} />)}</ol>}
		</div>
	);
}
