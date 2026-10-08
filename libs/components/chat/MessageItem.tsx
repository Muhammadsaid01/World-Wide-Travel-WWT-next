import { Typography } from '@mui/material';
import type { PrivateMessage } from '@/libs/types/chat/private-message';
import { chatTime } from './chatUtils';

export default function MessageItem({ message, own }: { message: PrivateMessage; own: boolean }) {
	return (
		<li className={`chat-message${own ? ' is-own' : ''}`}>
			<div><Typography>{message.messageContent || 'Image message'}</Typography><time>{chatTime(message.createdAt)}</time></div>
		</li>
	);
}
