import type { Cookies } from '@sveltejs/kit';
import type { TokenRefreshResponse } from '$lib/types';
import { API_URL } from '$env/static/private';
import createClient, { type Client, type Middleware } from 'openapi-fetch';
import type { paths } from '$lib/server/api';

export type Fetch = typeof fetch;

export class ValidationError implements Error {
	constructor(message: string, errors: Record<string, string[]>) {
		this.name = 'ValidationError';
		this.message = message;
		this.fields = errors;
	}

	message: string;
	name: string;
	fields: Record<string, string[]>;
}

export class BaseAPI {
	baseUrl: string = `${API_URL}`;
	protected readonly cookies: Cookies;
	protected client: Client<paths>;

	constructor(cookies: Cookies, fetch: Fetch) {
		this.cookies = cookies;
		// Bind fetch to preserve context in Cloudflare Workers
		this.client = createClient({ baseUrl: this.baseUrl, fetch: fetch.bind(globalThis) });
		this.client.use(this.authMiddleware);
	}

	private authMiddleware: Middleware = {
		onRequest: async ({ request, schemaPath }) => {
			const UNPROTECTED_ROUTES = ['/api/auth/login/', '/api/auth/token/refresh/'];
			// Skip auth for certain paths
			if (UNPROTECTED_ROUTES.some((pathname) => schemaPath.startsWith(pathname))) {
				return undefined; // don’t modify request for certain paths
			}
			// Add Authorization header
			const token = await this.getAccessToken();
			if (token) {
				request.headers.set('Authorization', `Bearer ${token}`);
			}
			return request;
		}
	};

	/**
	 * Get access token from cookie and refresh if needed
	 * Server-side we store the access token in a cookie for SSR
	 */
	protected async getAccessToken(): Promise<string | undefined> {
		const accessToken = this.cookies.get('access_token');
		if (accessToken) {
			return accessToken;
		}
		const refreshed = await this.refreshAccessToken();
		if (!refreshed) {
			return;
		}
		return this.cookies.get('access_token');
	}

	/**
	 * Store tokens in cookies
	 */
	protected setTokens(data: TokenRefreshResponse) {
		// Store JWT tokens in cookies
		this.cookies.set('access_token', data.access_token, {
			path: '/',
			httpOnly: true,
			secure: true,
			sameSite: 'lax',
			maxAge: 60 * 15 // 15 minutes for access token
		});

		this.cookies.set('refresh_token', data.refresh_token, {
			path: '/',
			httpOnly: true,
			secure: true,
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 7 // 7 days for refresh token
		});
	}

	/**
	 * Clear tokens from cookies
	 */
	protected clearTokens() {
		this.cookies.delete('access_token', { path: '/' });
		this.cookies.delete('refresh_token', { path: '/' });
	}

	/**
	 * Refresh the access token using the refresh token
	 * This is called automatically when a request returns 401
	 */
	private async refreshAccessToken(): Promise<boolean> {
		try {
			const refreshToken = this.cookies.get('refresh_token');
			if (!refreshToken) {
				return false;
			}
			const { data, error } = await this.client.POST('/api/auth/token/refresh/', {
				body: { refresh_token: refreshToken }
			});

			if (error) {
				// Refresh token is invalid or expired
				this.clearTokens();
				return false;
			}

			this.setTokens(data);

			return true;
		} catch (error) {
			console.error('Token refresh failed:', error);
			return false;
		}
	}

	protected isAuthenticated() {
		// Check for access token
		return !!this.cookies.get('access_token') || !!this.cookies.get('refresh_token');
	}
}

/**
 * Convert snake_case object keys to camelCase recursively
 */
export function snakeToCamel<T>(obj: unknown): T {
	if (obj === null || obj === undefined) return obj as T;

	if (Array.isArray(obj)) {
		return obj.map((item) => snakeToCamel(item)) as T;
	}

	if (typeof obj === 'object' && obj.constructor === Object) {
		return Object.keys(obj).reduce(
			(acc, key) => {
				const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
				acc[camelKey] = snakeToCamel((obj as Record<string, unknown>)[key]);
				return acc;
			},
			{} as Record<string, unknown>
		) as T;
	}

	return obj as T;
}
