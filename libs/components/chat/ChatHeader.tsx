import ArrowBack from '@mui/icons-material/ArrowBack';
import { Avatar, IconButton, Typography } from '@mui/material';
import { packageImageUrl } from '@/libs/components/package/PackageImage';
import type { ChatMember } from './chatUtils';
import { chatMemberName } from './chatUtils';
import { useTranslation } from 'react-i18next';

export default function ChatHeader({ member, onBack }: { member?: ChatMember; onBack: () => void }) {
	const { t } = useTranslation('chat');
	const name = chatMemberName(member);
	return (
		<header className="chat-room-header">
			<IconButton className="chat-mobile-back" onClick={onBack} aria-label={t('back')}><ArrowBack /></IconButton>
			<Avatar src={packageImageUrl(member?.memberImage)} alt={name}>{name.slice(0, 1).toUpperCase()}</Avatar>
			<div><Typography component="h2">{name}</Typography><Typography color="text.secondary">{t('private')}</Typography></div>
		</header>
	);
}
