import { Avatar, Badge, Typography } from '@mui/material';
import { packageImageUrl } from '@/libs/components/package/PackageImage';
import type { PrivateConversation } from '@/libs/types/chat/private-conversation';
import { chatMemberName, chatTime, conversationMember } from './chatUtils';
import { useTranslation } from 'react-i18next';

export default function ConversationItem({
	conversation,
	currentMemberId,
	selected,
	onSelect,
}: {
	conversation: PrivateConversation;
	currentMemberId: string;
	selected: boolean;
	onSelect: () => void;
}) {
	const { t } = useTranslation('chat');
	const member = conversationMember(conversation, currentMemberId);
	const name = chatMemberName(member);
	return (
		<button
			type="button"
			className={`chat-conversation-item${selected ? ' is-active' : ''}`}
			onClick={onSelect}
			aria-pressed={selected}
		>
			<Badge color="secondary" badgeContent={conversation.unreadCount} invisible={!conversation.unreadCount} max={99}>
				<Avatar src={packageImageUrl(member?.memberImage)} alt={name}>{name.slice(0, 1).toUpperCase()}</Avatar>
			</Badge>
			<span className="chat-conversation-copy">
				<span className="chat-conversation-title"><Typography component="strong">{name}</Typography><time>{chatTime(conversation.lastMessageAt)}</time></span>
				<Typography component="span" color="text.secondary" noWrap>{conversation.lastMessage || t('start')}</Typography>
			</span>
		</button>
	);
}
