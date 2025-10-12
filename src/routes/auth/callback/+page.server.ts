import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { BACKEND_API_URL, AUTH_REDIRECT_URL } from '$env/static/private';
import type { User } from '$lib/types';

export const load: PageServerLoad = async ({ url, cookies }) => {
	const code = url.searchParams.get('code');

	if (!code) {
		throw redirect(303, '/?error=auth_failed');
	}
	let response: { access: string; refresh: string; user: User } | null = null;

	try {
		response = await exchangeCodeForTokens(code);
		cookies.set('refresh_token', response.refresh, {
			path: '/',
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production', // Use HTTPS in production
			maxAge: 60 * 60 * 24 * 7 // 7 days
		});
	} catch (error) {
		console.error('Callback error:', error);
		throw redirect(303, '/?error=unexpected_error');
	}
	throw redirect(303, '/');
};

const exchangeCodeForTokens = async (code: string) => {
	const response = await fetch(`${BACKEND_API_URL}/api/auth/login/google-oauth2/`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			code: code,
			redirect_uri: AUTH_REDIRECT_URL
		})
	});

	if (!response.ok) {
		const errorData = await response.json();
		console.error('Failed to exchange code for tokens:', errorData);
		throw new Error(`Failed to exchange code for tokens: ${errorData}`);
	}

	const data = await response.json();
	const { access, refresh, user } = data;
	return { access, refresh, user };
}
