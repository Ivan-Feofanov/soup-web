import type { Cookies } from '@sveltejs/kit';
import type { AuthResponse } from '$lib/types';
import { API_URL } from '$env/static/private';
import { handleErrorResponse, HttpStatus } from '$lib/server/errors';

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
	baseUrl: string = '';
	apiUrl: string = `${API_URL}/api`;
	protected readonly cookies: Cookies;
	private readonly fetch: Fetch;
	private headers: Record<string, string> = {
		'Content-Type': 'application/json'
	};
	private maxRetries = 3;

	constructor(cookies: Cookies, fetch: Fetch) {
		this.cookies = cookies;
		// Bind fetch to preserve context in Cloudflare Workers
		this.fetch = fetch.bind(globalThis);
	}

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
	protected setTokens(data: AuthResponse) {
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
	 * Set Authorization header with access token
	 */
	private async setAuthHeader(headers: Record<string, string>) {
		const token = await this.getAccessToken();
		if (token) {
			headers['Authorization'] = `Bearer ${token}`;
		}
	}

	private async request(
		method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
		url: string,
		body: Record<string, unknown> | null = null
	): Promise<Response> {
		const response = await this.requestWithAuth(method, `${this.baseUrl}${url}`, body);

		if (!response.ok) {
			await handleErrorResponse(response);
		}

		return response;
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

			const response = await this.fetch(`${this.apiUrl}/auth/token/refresh/`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ refresh_token: refreshToken })
			});

			if (!response.ok) {
				// Refresh token is invalid or expired
				this.clearTokens();
				return false;
			}

			const data: AuthResponse = await response.json();
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

	/**
	 * Make an HTTP request with automatic token refresh on 401
	 */
	private async requestWithAuth(
		method: string,
		url: string,
		body: Record<string, unknown> | null,
		retryCount = 0
	): Promise<Response> {
		const headers = { ...this.headers };
		await this.setAuthHeader(headers);

		const options: RequestInit = {
			method,
			headers
		};

		if (body) {
			options.body = JSON.stringify(body);
		}

		const response = await this.fetch(url, options);

		// If we get 401 or 403 and haven't retried yet, try to refresh the token
		if (response.status === HttpStatus.UNAUTHORIZED || response.status === HttpStatus.FORBIDDEN) {
			if (retryCount > this.maxRetries) {
				console.error('Max retries reached, giving up');
				await handleErrorResponse(response);
			}
			console.warn('Access token expired, refreshing token');
			const refreshed = await this.refreshAccessToken();
			if (refreshed) {
				// Retry the request with the new token
				console.log('Retrying request with new token');
				return this.requestWithAuth(method, url, body, retryCount + 1);
			}
		}

		if (!response.ok) {
			await handleErrorResponse(response);
		}

		return response;
	}

	async GET(url: string) {
		return this.request('GET', url, null);
	}

	async POST(url: string, body?: Record<string, unknown>) {
		return this.request('POST', url, body);
	}

	async PATCH(url: string, body: Record<string, unknown>) {
		return this.request('PATCH', url, body);
	}

	async DELETE(url: string) {
		return this.request('DELETE', url, null);
	}
}
