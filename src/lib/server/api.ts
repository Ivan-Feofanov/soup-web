import { redirect } from '@sveltejs/kit';
import type { Cookies } from '@sveltejs/kit';

const DJANGO_API_URL = 'http://localhost:8000';

async function getAccessToken(cookies: Cookies): Promise<string | null> {
	const refreshToken = cookies.get('refresh_token');
	if (!refreshToken) {
		console.log('No refresh token found');
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
		return data.access;
	} catch (error) {
		console.error('Token refresh error:', error);
		return null;
	}
}

export const serverApi = async (
	method: 'GET' | 'POST' | 'PUT' | 'DELETE',
	url: string,
	cookies: Cookies,
	body: Record<string, unknown> | null = null
) => {
	const accessToken = await getAccessToken(cookies);

	if (!accessToken) {
		throw redirect(303, '/login');
	}

	const options: RequestInit = {
		method,
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${accessToken}`
		}
	};

	if (body) {
		options.body = JSON.stringify(body);
	}

	const response = await fetch(`${DJANGO_API_URL}${url}`, options);

	if (response.status === 401 || response.status === 403) {
		throw redirect(303, '/login?error=forbidden');
	}

	return response;
};
