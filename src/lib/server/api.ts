import type { Cookies } from '@sveltejs/kit';
import type { ErrorResponse, ValidationErrorResponse } from '$lib/types';

const DJANGO_API_URL = 'http://localhost:8000';

async function getAccessToken(cookies: Cookies): Promise<string | null> {
	const accessToken = cookies.get('access_token');
	if (accessToken) {
		return accessToken;
	}

	const refreshToken = cookies.get('refresh_token');
	if (!refreshToken) {
		return null;
	}

	try {
		const response = await fetch(`${DJANGO_API_URL}/api/token/refresh`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ refresh: refreshToken })
		});

		if (!response.ok) {
			console.warn('Token refresh failed');
			cookies.delete('refresh_token', { path: '/' });
			return null;
		}

		const data = await response.json();
		cookies.set('access_token', data.access, {
			path: '/',
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production', // Use HTTPS in production
			maxAge: 60 * 60 * 24 // 1 day
		});

		return data.access;
	} catch (error) {
		console.error('Token refresh error:', error);
		return null;
	}
}

export class ValidationError extends Error {
	fields: Record<string, string[]>;

	constructor(message: string, fields: Record<string, string[]>) {
		super(message);
		this.name = 'ValidationError';
		this.fields = fields;
	}
}

export const serverApi = async (
	method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
	url: string,
	cookies: Cookies,
	body: Record<string, unknown> | null = null
): Promise<Response> => {
	const accessToken = await getAccessToken(cookies);

	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
	}

	if (accessToken) {
		headers['Authorization'] = `Bearer ${accessToken}`;
	} else {
		console.log('No access token found', url, method, body);
	}

	const options: RequestInit = {method, headers};

	if (body) {
		options.body = JSON.stringify(body);
	}

	const response = await fetch(`${DJANGO_API_URL}${url}`, options);

	if (!response.ok) {
		const responseData: ErrorResponse = await response.json();
		if (responseData.code === 'token_not_valid') {
			cookies.delete('access_token', { path: '/' });
			return serverApi(method, url, cookies, body);
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
