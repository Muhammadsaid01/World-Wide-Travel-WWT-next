export function isAuthenticatedSocketReady(event: { event: string }): boolean {
	return event.event === 'connected';
}
