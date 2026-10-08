import ArrowBack from '@mui/icons-material/ArrowBack';
import { Avatar, IconButton, Typography } from '@mui/material';
import { packageImageUrl } from '@/libs/components/package/PackageImage';
import type { ChatMember } from './chatUtils';
import { chatMemberName } from './chatUtils';

export default function ChatHeader({ member, onBack }: { member?: ChatMember; onBack: () => void }) {
	const name = chatMemberName(member);
	return (
		<header className="chat-room-header">
			<IconButton className="chat-mobile-back" onClick={onBack} aria-label="Back to conversations"><ArrowBack /></IconButton>
			<Avatar src={packageImageUrl(member?.memberImage)} alt={name}>{name.slice(0, 1).toUpperCase()}</Avatar>
			<div><Typography component="h2">{name}</Typography><Typography color="text.secondary">Private conversation</Typography></div>
		</header>
	);
}
