import type { Cookies } from '@sveltejs/kit';
import type { ErrorResponse, ValidationErrorResponse } from '$lib/types';
import { API_URL } from '$env/static/private';

export type Fetch = typeof fetch;

type CookieOptions = {
	path: string;
	maxAge?: number;
	httpOnly?: boolean;
	secure?: boolean;
	sameSite?: 'strict' | 'lax' | 'none';
	domain?: string;
};

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
	private readonly cookies: Cookies;
	private readonly fetch: Fetch;
	private headers: Record<string, string> = {
		'Content-Type': 'application/json'
	};

	constructor(cookies: Cookies, fetch: Fetch) {
		this.cookies = cookies;
		this.fetch = fetch;
	}

	private async request(
		method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
		url: string,
		body: Record<string, unknown> | null = null
	): Promise<Response> {
		const options: RequestInit = {
			method,
			headers: this.headers,
			credentials: 'include' // Important: include cookies in requests
		};

		if (body) {
			options.body = JSON.stringify(body);
		}

		const response = await this.fetch(`${this.baseUrl}${url}`, options);

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
	 * Forward Set-Cookie headers from backend response to the browser
	 * This is necessary because SvelteKit's server-side fetch doesn't automatically
	 * forward cookies to the client
	 */
	protected forwardCookies(response: Response) {
		const setCookieHeaders = response.headers.get('set-cookie');
		if (!setCookieHeaders) return;

		// Split multiple Set-Cookie headers (they may be separated by commas or newlines)
		// Note: This is tricky because cookie values can contain commas
		const cookieStrings = setCookieHeaders.split(/,(?=\s*\w+=)/);

		cookieStrings.forEach((cookieString) => {
			try {
				// Parse cookie string: "name=value; Path=/; HttpOnly; etc"
				const parts = cookieString.split(';').map((s) => s.trim());
				const [nameValue, ...attributes] = parts;

				if (!nameValue || !nameValue.includes('=')) return;

				const equalIndex = nameValue.indexOf('=');
				const name = nameValue.substring(0, equalIndex).trim();
				const value = nameValue.substring(equalIndex + 1).trim();

				// Parse cookie attributes
				const options: CookieOptions = { path: '/' };

				attributes.forEach((attr) => {
					if (!attr) return;

					const attrEqualIndex = attr.indexOf('=');
					let key: string;
					let val: string | undefined;

					if (attrEqualIndex === -1) {
						// Boolean attribute (e.g., HttpOnly, Secure)
						key = attr.toLowerCase();
					} else {
						key = attr.substring(0, attrEqualIndex).trim().toLowerCase();
						val = attr.substring(attrEqualIndex + 1).trim();
					}

					if (key === 'path' && val) {
						options.path = val;
					} else if (key === 'max-age' && val) {
						const maxAge = parseInt(val, 10);
						if (!isNaN(maxAge)) {
							options.maxAge = maxAge;
						}
					} else if (key === 'expires' && val) {
						// Skip expires - use max-age instead if available
						// The cookie library is very strict about date formats
						// and max-age is preferred anyway
					} else if (key === 'httponly') {
						options.httpOnly = true;
					} else if (key === 'secure') {
						options.secure = true;
					} else if (key === 'samesite' && val) {
						const sameSite = val.toLowerCase();
						if (sameSite === 'strict' || sameSite === 'lax' || sameSite === 'none') {
							options.sameSite = sameSite;
						}
					} else if (key === 'domain' && val) {
						// Skip domain - let SvelteKit handle it
					}
				});

				this.cookies.set(name, value, options);
			} catch (error) {
				console.error('Failed to parse cookie:', cookieString, error);
			}
		});
	}

	protected isAuthenticated() {
		// Check for session cookie (name depends on your backend configuration)
		// Common names: 'sessionid', 'session', 'connect.sid'
		return !!this.cookies.get('sessionid');
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
