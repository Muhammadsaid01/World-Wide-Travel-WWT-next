import { ApolloClient, InMemoryCache } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import createUploadLink from 'apollo-upload-client/createUploadLink.mjs';

import { getJwtToken } from '@/libs/auth';
import { GRAPHQL_URL } from '@/libs/config';

let browserClient: ReturnType<typeof createApolloClient> | undefined;

/** Create an isolated client/cache for each server request. */
export function createApolloClient() {
	if (!GRAPHQL_URL.trim()) {
		throw new Error('NEXT_PUBLIC_GRAPHQL_URL must be configured before creating the Apollo client.');
	}

	const authLink = setContext((_, { headers }: { headers?: Record<string, string> }) => {
		const token = getJwtToken();

		return {
			headers: {
				...headers,
				...(token ? { Authorization: `Bearer ${token}` } : {}),
			},
		};
	});
	const uploadLink = createUploadLink({ uri: GRAPHQL_URL });

	return new ApolloClient({
		ssrMode: typeof window === 'undefined',
		cache: new InMemoryCache(),
		link: authLink.concat(uploadLink),
	});
}

/** Reuse the browser client without sharing cached data between SSR requests. */
export function getApolloClient() {
	if (typeof window === 'undefined') {
		return createApolloClient();
	}

	browserClient ??= createApolloClient();
	return browserClient;
}
