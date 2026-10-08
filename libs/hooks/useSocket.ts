import { getJwtToken } from '@/libs/auth';
import { WS_URL } from '@/libs/config';
import { useCallback, useEffect, useRef, useState } from 'react';
import { isAuthenticatedSocketReady } from './socketState';

export type SocketStatus = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error';
export type SocketEvent<T = unknown> = { event: string; data?: T; message?: string };
type SocketHandler<T = unknown> = (event: SocketEvent<T>) => void;
export interface ChatSocket {
	status: SocketStatus;
	error: string;
	send: (event: string, data?: unknown) => boolean;
	subscribe: <T>(event: string, handler: SocketHandler<T>) => () => void;
}

function buildSocketUrl(token: string): string | null {
	if (!WS_URL.trim()) return null;
	try {
		const url = new URL(WS_URL);
		if (url.protocol === 'http:') url.protocol = 'ws:';
		if (url.protocol === 'https:') url.protocol = 'wss:';
		if (!url.pathname || url.pathname === '/') url.pathname = '/chat';
		url.searchParams.set('token', token);
		return url.toString();
	} catch {
		return null;
	}
}

export default function useSocket(enabled = true): ChatSocket {
	const [status, setStatus] = useState<SocketStatus>('idle');
	const [error, setError] = useState('');
	const socketRef = useRef<WebSocket | null>(null);
	const handlersRef = useRef(new Map<string, Set<SocketHandler>>());
	const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		if (!enabled) {
			// Reflect the intentionally disabled transport in the public API.
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setStatus('idle');
			return;
		}

		const token = getJwtToken();
		const socketUrl = token ? buildSocketUrl(token) : null;
		if (!socketUrl) {
			setStatus('error');
			setError(token ? 'Realtime chat is not configured.' : 'Sign in to use chat.');
			return;
		}

		let disposed = false;
		let attempt = 0;
		const connect = () => {
			if (disposed) return;
			setStatus('connecting');
			const socket = new WebSocket(socketUrl);
			socketRef.current = socket;

			socket.onopen = () => {
				// The transport is open, but the backend still has to verify the JWT and
				// register this socket. Keep sends disabled until its authenticated
				// `connected` acknowledgement arrives.
				setStatus('connecting');
			};
			socket.onmessage = (message) => {
				try {
					const parsed = JSON.parse(String(message.data)) as SocketEvent;
					if (!parsed?.event) return;
					if (isAuthenticatedSocketReady(parsed)) {
						attempt = 0;
						setError('');
						setStatus('connected');
					}
					handlersRef.current.get(parsed.event)?.forEach((handler) => handler(parsed));
					handlersRef.current.get('*')?.forEach((handler) => handler(parsed));
				} catch {
					setError('Chat received an invalid server response.');
				}
			};
			socket.onerror = () => {
				setStatus('error');
				setError('Realtime chat connection failed.');
			};
			socket.onclose = () => {
				if (socketRef.current === socket) socketRef.current = null;
				if (disposed) return;
				setStatus('disconnected');
				attempt += 1;
				const delay = Math.min(1000 * 2 ** Math.min(attempt, 4), 15_000);
				reconnectTimer.current = setTimeout(connect, delay);
			};
		};

		connect();
		return () => {
			disposed = true;
			if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
			reconnectTimer.current = null;
			socketRef.current?.close();
			socketRef.current = null;
		};
	}, [enabled]);

	const send = useCallback((event: string, data?: unknown) => {
		const socket = socketRef.current;
		if (!socket || socket.readyState !== WebSocket.OPEN) return false;
		socket.send(JSON.stringify({ event, data }));
		return true;
	}, []);

	const subscribe = useCallback(<T,>(event: string, handler: SocketHandler<T>) => {
		const handlers = handlersRef.current;
		const existing = handlers.get(event) ?? new Set<SocketHandler>();
		existing.add(handler as SocketHandler);
		handlers.set(event, existing);
		return () => {
			existing.delete(handler as SocketHandler);
			if (existing.size === 0) handlers.delete(event);
		};
	}, []);

	return { status, error, send, subscribe };
}
