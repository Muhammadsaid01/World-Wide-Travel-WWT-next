import type { ChatSocket, SocketEvent } from '@/libs/hooks/useSocket';
import type { CustomJwtPayload } from '@/libs/types/customJwtPayload';
import type { AIMessage } from '@/libs/types/ai/ai-message';
import { AIMessageRole } from '@/libs/enums/chat-ai.enum';
import AutoAwesome from '@mui/icons-material/AutoAwesome';
import Send from '@mui/icons-material/Send';
import { Alert, Button, CircularProgress, IconButton, TextField, Typography } from '@mui/material';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { chatTime } from '../../chat/chatUtils';
import { useTranslation } from 'react-i18next';

export default function AiBot({ user, socket }: { user: CustomJwtPayload | null; socket: ChatSocket }) {
	const { t } = useTranslation('chat');
	const { status: socketStatus, send, subscribe } = socket;
	const [messages, setMessages] = useState<AIMessage[]>([]);
	const [available, setAvailable] = useState<boolean | null>(null);
	const [thinking, setThinking] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [value, setValue] = useState('');
	const [error, setError] = useState('');
	const scroller = useRef<HTMLDivElement>(null);
	const pendingMessage = useRef('');

	useEffect(() => {
		if (socketStatus === 'connected') send('aiChatJoin');
	}, [send, socketStatus]);

	useEffect(() => {
		const history = subscribe<{ list: AIMessage[]; available?: boolean }>('aiChatHistory', (event) => {
			setMessages(event.data?.list ?? []); setAvailable(event.data?.available ?? false);
		});
		const userMessage = subscribe<AIMessage>('aiUserMessage', (event) => {
			if (!event.data) return;
			setMessages((current) => [...current, event.data!]);
			if (event.data.messageContent === pendingMessage.current) {
				pendingMessage.current = '';
				setValue('');
			}
			setSubmitting(false);
		});
		const response = subscribe<AIMessage>('aiResponse', (event) => { if (event.data) setMessages((current) => [...current, event.data!]); setThinking(false); });
		const thinkingEvent = subscribe<{ isThinking: boolean }>('aiThinking', (event) => setThinking(Boolean(event.data?.isThinking)));
		const failed = subscribe<{ code?: string; message?: string }>('aiError', (event: SocketEvent<{ code?: string; message?: string }>) => {
			const message = event.data?.message || event.message || t('widget.aiRequestError');
			if (event.data?.code === 'AI_UNAVAILABLE') setAvailable(false);
			setThinking(false); setSubmitting(false); setError(message);
		});
		return () => { history(); userMessage(); response(); thinkingEvent(); failed(); };
	}, [subscribe, t]);

	useEffect(() => {
		// Socket connectivity is external state; release an in-flight UI lock after disconnect.
		// eslint-disable-next-line react-hooks/set-state-in-effect
		if (socketStatus !== 'connected') setSubmitting(false);
	}, [socketStatus]);

	useEffect(() => { const node = scroller.current; if (node) node.scrollTop = node.scrollHeight; }, [messages.length, thinking]);

	if (!user) return <div className="chat-auth-state"><AutoAwesome /><Typography component="h3">{t('widget.aiSignIn')}</Typography><Typography color="text.secondary">{t('widget.aiAccount')}</Typography><Button component={Link} href="/account/login" variant="contained">{t('widget.signIn')}</Button></div>;
	if (available === false) return <div className="chat-auth-state"><AutoAwesome /><Typography component="h3">{t('widget.aiUnavailable')}</Typography><Typography color="text.secondary">{t('widget.aiUnavailableText')}</Typography></div>;

	function sendMessage() {
		const content = value.trim();
		if (!content || thinking || submitting) return;
		setError(''); setSubmitting(true); pendingMessage.current = content;
		if (!send('aiMessage', content)) { setSubmitting(false); setError(t('widget.aiReconnecting')); }
	}

	return <div className="ai-chat">
		{error && <Alert severity="warning" onClose={() => setError('')}>{error}</Alert>}
		<div className="ai-chat-messages" ref={scroller}>
			{available === null && socketStatus === 'connected' ? <CircularProgress size={24} /> : !messages.length ? <div className="chat-empty"><AutoAwesome /><Typography component="h3">{t('widget.askAi')}</Typography><Typography color="text.secondary">{t('widget.askAiHelp')}</Typography></div>
				: <ol>{messages.map((message) => <li key={message._id} className={message.messageRole === AIMessageRole.USER ? 'is-own' : 'is-ai'}><div><strong>{message.messageRole === AIMessageRole.USER ? t('you') : t('widget.wwtAi')}</strong><Typography>{message.messageContent}</Typography><time>{chatTime(message.createdAt)}</time></div></li>)}</ol>}
			{thinking && <div className="ai-thinking"><CircularProgress size={16} /> {t('widget.aiThinking')}</div>}
		</div>
		<div className="open-chat-composer"><TextField value={value} multiline maxRows={3} placeholder={t('widget.aiPlaceholder')} slotProps={{ htmlInput: { maxLength: 2000, 'aria-label': t('widget.aiMessageLabel') } }} onChange={(event) => setValue(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); sendMessage(); } }} /><IconButton color="primary" onClick={sendMessage} disabled={!value.trim() || thinking || submitting || available !== true || socketStatus !== 'connected'} aria-label={t('widget.sendAi')}><Send /></IconButton></div>
	</div>;
}
