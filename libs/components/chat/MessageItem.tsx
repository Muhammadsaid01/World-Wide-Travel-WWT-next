import { Typography } from '@mui/material';
import type { PrivateMessage } from '@/libs/types/chat/private-message';
import { chatTime } from './chatUtils';
import { useTranslation } from 'react-i18next';

export default function MessageItem({ message, own }: { message: PrivateMessage; own: boolean }) {
	const { t } = useTranslation('chat');
	return (
		<li className={`chat-message${own ? ' is-own' : ''}`}>
			<div><Typography>{message.messageContent || t('image')}</Typography><time>{chatTime(message.createdAt)}</time></div>
		</li>
	);
}
