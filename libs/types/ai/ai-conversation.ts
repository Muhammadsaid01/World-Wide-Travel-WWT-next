export interface AIConversation {
	_id: string;
	memberId: string;

	lastMessage?: string;
	lastMessageAt?: string;

	createdAt: string;
	updatedAt: string;
}