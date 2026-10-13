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
import { useTranslation } from 'react-i18next';

export default function ChatWidget() {
	const { t } = useTranslation('chat');
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
					<header><div><Typography id="wwt-chat-title" component="h2">{t('widget.widgetTitle')}</Typography><Typography color="text.secondary">{t('widget.widgetSubtitle')}</Typography></div>
						<IconButton onClick={() => setOpen(false)} aria-label={t('widget.closeWidget')}><Close /></IconButton></header>
					<Tabs value={tab} onChange={(_, value: 'open' | 'ai') => setTab(value)} variant="fullWidth" aria-label={t('widget.modes')}>
						<Tab value="open" label={t('widget.openChat')} /><Tab value="ai" label={t('widget.aiAssistant')} />
					</Tabs>
					<div className="wwt-chat-panel-body">
						{tab === 'open' ? <OpenChat user={user} socket={socket} /> : <AiBot user={user} socket={socket} />}
					</div>
				</Paper>
			)}
			<IconButton className="wwt-chat-launcher" onClick={() => setOpen((value) => !value)} aria-label={t(open ? 'widget.closeWidget' : 'widget.openWidget')} aria-expanded={open}>
				{open ? <Close /> : <ChatBubbleOutline />}
			</IconButton>
		</div>
	);
}
