import { jwtDecode } from 'jwt-decode';

import { currentUserVar } from '@/apollo/store';
import { LOGIN, SIGN_UP } from '@/apollo/user/mutation';
import type { CustomJwtPayload } from '@/libs/types/customJwtPayload';
import type { Member } from '@/libs/types/member/member';
import type { LoginInput, MemberInput } from '@/libs/types/member/member.input';

export const ACCESS_TOKEN_KEY = 'accessToken';

export function getJwtToken(): string {
	if (typeof window === 'undefined') return '';

	try {
		return window.localStorage.getItem(ACCESS_TOKEN_KEY) ?? '';
	} catch {
		return '';
	}
}

export function setJwtToken(token: string): void {
	if (typeof window === 'undefined') return;

	window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function removeJwtToken(): void {
	if (typeof window === 'undefined') return;

	window.localStorage.removeItem(ACCESS_TOKEN_KEY);
}

/** Decode client state only; JWT signature verification belongs to the backend. */
export function decodeJwtToken(token: string): CustomJwtPayload | null {
	try {
		const payload = jwtDecode<CustomJwtPayload>(token);
		if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return null;
		if (
			payload.exp !== undefined &&
			(typeof payload.exp !== 'number' || payload.exp <= Date.now() / 1000)
		) return null;

		return payload;
	} catch {
		return null;
	}
}

export function restoreUserFromToken(): CustomJwtPayload | null {
	const payload = decodeJwtToken(getJwtToken());
	currentUserVar(payload);
	return payload;
}

export function clearAuth(): void {
	try {
		removeJwtToken();
	} finally {
		currentUserVar(null);
	}
}

function restoreAuthFromResponse(accessToken: Member['accessToken']): CustomJwtPayload {
	if (!accessToken) {
		throw new Error('Authentication response did not include an access token.');
	}

	setJwtToken(accessToken);
	const user = restoreUserFromToken();
	if (!user) {
		clearAuth();
		throw new Error('Authentication response contained an invalid or expired access token.');
	}

	return user;
}

export async function login(input: LoginInput): Promise<CustomJwtPayload> {
	if (typeof window === 'undefined') {
		throw new Error('Login requires a browser session.');
	}

	// Load lazily because the Apollo client imports getJwtToken from this module.
	const { getApolloClient } = await import('@/apollo/client');
	const result = await getApolloClient().mutate<{ login: Member }, { input: LoginInput }>({
		mutation: LOGIN,
		variables: { input },
	});

	return restoreAuthFromResponse(result.data?.login?.accessToken);
}

export async function signup(input: MemberInput): Promise<CustomJwtPayload> {
	if (typeof window === 'undefined') {
		throw new Error('Signup requires a browser session.');
	}

	const { getApolloClient } = await import('@/apollo/client');
	const result = await getApolloClient().mutate<{ signup: Member }, { input: MemberInput }>({
		mutation: SIGN_UP,
		variables: { input },
	});

	return restoreAuthFromResponse(result.data?.signup?.accessToken);
}

export function logout(): void {
	clearAuth();
}
