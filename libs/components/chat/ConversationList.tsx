import { Alert, Button, Pagination, Skeleton, Typography } from '@mui/material';
import type { PrivateConversation } from '@/libs/types/chat/private-conversation';
import ConversationItem from './ConversationItem';

export default function ConversationList({
	conversations,
	currentMemberId,
	selectedId,
	loading,
	error,
	page,
	pageCount,
	onPageChange,
	onSelect,
	onRetry,
}: {
	conversations: PrivateConversation[];
	currentMemberId: string;
	selectedId?: string;
	loading: boolean;
	error?: string;
	page: number;
	pageCount: number;
	onPageChange: (page: number) => void;
	onSelect: (conversation: PrivateConversation) => void;
	onRetry: () => void;
}) {
	return (
		<div className="chat-conversation-list">
			<header><Typography component="h1">Chats</Typography><Typography color="text.secondary">Your private conversations</Typography></header>
			{loading ? Array.from({ length: 6 }, (_, index) => <Skeleton key={index} height={72} />)
				: error ? <Alert severity="error" action={<Button onClick={onRetry}>Retry</Button>}>{error}</Alert>
				: conversations.length === 0 ? <div className="chat-empty"><Typography component="h2">No conversations yet</Typography><Typography color="text.secondary">Start a conversation from an agent profile.</Typography></div>
				: conversations.map((conversation) => (
					<ConversationItem key={conversation._id} conversation={conversation} currentMemberId={currentMemberId}
						selected={conversation._id === selectedId} onSelect={() => onSelect(conversation)} />
				))}
			{pageCount > 1 && <Pagination size="small" page={page} count={pageCount} onChange={(_, value) => onPageChange(value)} />}
		</div>
	);
}
