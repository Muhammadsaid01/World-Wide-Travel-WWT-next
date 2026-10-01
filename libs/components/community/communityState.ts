export type CommunityTab = 'all' | 'stories' | 'mates';
export type CommunityDirection = 'ASC' | 'DESC';

export const COMMUNITY_LIMIT = 6;

export function plainText(value: string): string {
	return value
		.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
		.replace(/<[^>]*>/g, ' ')
		.replace(/&nbsp;/gi, ' ')
		.replace(/&amp;/gi, '&')
		.replace(/&lt;/gi, '<')
		.replace(/&gt;/gi, '>')
		.replace(/&quot;/gi, '"')
		.replace(/&#39;/gi, "'")
		.replace(/\s+/g, ' ')
		.trim();
}

export function excerpt(value: string, maximum = 145): string {
	const text = plainText(value);
	return text.length <= maximum ? text : `${text.slice(0, maximum).trimEnd()}…`;
}

// The travel-mate backend currently constructs a RegExp from this value.
export function escapeTravelMateSearch(value: string): string {
	return value.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function memberName(member?: { memberFullName?: string | null; memberNick: string } | null): string {
	return member?.memberFullName?.trim() || member?.memberNick || 'WWT traveler';
}
