import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { User } from '$lib/types';
import { AuthAPI } from '$lib/server/auth';

export const load: PageServerLoad = async ({ url, cookies, fetch }) => {
	const code = url.searchParams.get('code');

	if (!code) {
		throw redirect(303, '/?error=auth_failed');
	}
	let response: { access: string; refresh: string; user: User } | null = null;

	const authAPI = new AuthAPI(cookies, fetch);
	try {
		response = await authAPI.ExchangeCodeForTokens(code);
		cookies.set('refresh_token', response.refresh, {
			path: '/',
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production', // Use HTTPS in production
			maxAge: 60 * 60 * 24 * 7 // 7 days
		});
		cookies.set('access_token', response.access, {
			path: '/',
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			maxAge: 60 * 60 * 24
		})
	} catch (error) {
		console.error('Callback error:', error);
		throw redirect(303, '/?error=unexpected_error');
	}
	if (response.user && (!response.user.handler || !response.user.username)) {
		throw redirect(303, '/chef');
	}
	throw redirect(303, '/');
};
