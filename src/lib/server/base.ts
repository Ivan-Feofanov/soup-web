import type { Cookies } from '@sveltejs/kit';
import type { AuthResponse, ErrorResponse, ValidationErrorResponse } from '$lib/types';
import { API_URL } from '$env/static/private';

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
	baseUrl: string = `${API_URL}/api`;
	serverUrl: string = API_URL;
	protected readonly cookies: Cookies;
	private readonly fetch: Fetch;
	private headers: Record<string, string> = {
		'Content-Type': 'application/json'
	};

	constructor(cookies: Cookies, fetch: Fetch) {
		this.cookies = cookies;
		// Bind fetch to preserve context in Cloudflare Workers
		this.fetch = fetch.bind(globalThis);
	}

	/**
	 * Get access token from cookie
	 * Server-side we store the access token in a cookie for SSR
	 */
	protected getAccessToken(): string | null {
		return this.cookies.get('access_token') || null;
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
	private setAuthHeader(headers: Record<string, string>) {
		const token = this.getAccessToken();
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
			let responseData: ErrorResponse;
			try {
				responseData = await response.json();
				console.error('API request failed:', JSON.stringify(responseData, null, 2));
			} catch (e) {
				console.error('Failed to parse error response:', e);
				throw new Error(`API request failed: ${response.statusText}`);
			}
			if (response.status === 400) {
				const validationError: ValidationErrorResponse =
					responseData as unknown as ValidationErrorResponse;
				throw new ValidationError(validationError.message, validationError.errors);
			}
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

			const response = await this.fetch(`${this.baseUrl}/auth/refresh/`, {
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
		return !!this.getAccessToken();
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
		this.setAuthHeader(headers);

		const options: RequestInit = {
			method,
			headers,
			credentials: 'include'
		};

		if (body) {
			options.body = JSON.stringify(body);
		}

		const response = await this.fetch(url, options);

		// If we get 401 and haven't retried yet, try to refresh the token
		if (response.status === 401 && retryCount === 0) {
			const refreshed = await this.refreshAccessToken();
			if (refreshed) {
				// Retry the request with the new token
				return this.requestWithAuth(method, url, body, retryCount + 1);
			}
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
