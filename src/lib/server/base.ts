import type { Cookies } from '@sveltejs/kit';
import type { ErrorResponse, ValidationErrorResponse } from '$lib/types';

const DJANGO_API_URL = 'http://localhost:8000';

export type Fetch = typeof fetch;

class ValidationError implements Error {
	constructor(message: string, errors: Record<string, string[]>) {
		this.message = message;
		this.name = 'ValidationError';
		this.fields = errors;
	}

	message: string;
	name: string;
	fields: Record<string, string[]>;
}

export class BaseAPI {
	baseUrl: string = `${DJANGO_API_URL}/api`;
	serverUrl: string = DJANGO_API_URL;
	fetch: Fetch;
	private readonly cookies: Cookies;
	private headers: Record<string, string> = {
		'Content-Type': 'application/json'
	};

	constructor(cookies: Cookies, fetch: Fetch) {
		this.cookies = cookies;
		this.fetch = fetch;
	}

	private async ensureAccessToken() {
		const accessToken = this.cookies.get('access_token');
		if (accessToken) {
			this.headers['Authorization'] = `Bearer ${accessToken}`;
			return;
		}

		this.headers['Authorization'] = '';

		const refreshToken = this.cookies.get('refresh_token');
		if (!refreshToken) {
			return;
		}

		try {
			const response = await fetch(`${this.serverUrl}/api/token/refresh`, {
				method: 'POST',
				headers: this.headers,
				body: JSON.stringify({ refresh: refreshToken })
			});

			if (!response.ok) {
				console.warn('Token refresh failed. Logging out.');
				this.cookies.delete('refresh_token', { path: '/' });
				this.cookies.delete('access_token', { path: '/' });
				return null;
			}

			const data = await response.json();
			this.cookies.set('access_token', data.access, {
				path: '/',
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production', // Use HTTPS in production
				maxAge: 60 * 60 * 24 // 1 day
			});
			this.cookies.set('refresh_token', data.refresh, {
				path: '/',
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production', // Use HTTPS in production
				maxAge: 60 * 60 * 24 * 7 // 7 days
			});
			this.headers['Authorization'] = `Bearer ${data.access}`;
		} catch (error) {
			console.error('Token refresh error:', error);
			return null;
		}
	}

	private clearAccessToken() {
		this.cookies.delete('access_token', { path: '/' });
	}

	protected isAuthenticated() {
		return !!this.cookies.get('access_token') && !!this.cookies.get('refresh_token');
	}

	protected async ensureAuth() {
		await this.ensureAccessToken();
		if (!this.isAuthenticated()) {
			throw new Error('Not authenticated');
		}
	}

	private request = async (
		method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
		url: string,
		body: Record<string, unknown> | null = null
	): Promise<Response> => {
		await this.ensureAccessToken();

		const options: RequestInit = { method, headers: this.headers };

		if (body) {
			options.body = JSON.stringify(body);
		}

		const response = await this.fetch(`${this.baseUrl}${url}`, options);

		if (!response.ok) {
			const responseData: ErrorResponse = await response.json();
			if (responseData.code === 'token_not_valid') {
				this.clearAccessToken();
				return this.request(method, url, body);
			}
			console.error('API request failed:', JSON.stringify(responseData, null, 2));

			if (response.status === 400) {
				const validationError: ValidationErrorResponse =
					responseData as unknown as ValidationErrorResponse;
				throw new ValidationError(validationError.message, validationError.errors);
			}
		}

		return response;
	};

	GET = async (url: string) => {
		return this.request('GET', url, null);
	};

	POST = async (url: string, body: Record<string, unknown>) => {
		await this.ensureAuth();
		return this.request('POST', url, body);
	};

	PATCH = async (url: string, body: Record<string, unknown>) => {
		await this.ensureAuth();
		return this.request('PATCH', url, body);
	};

	DELETE = async (url: string) => {
		await this.ensureAuth();
		return this.request('DELETE', url, null);
	};
}
