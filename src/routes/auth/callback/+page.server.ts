import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { User } from '$lib/types';
import { AuthAPI } from '$lib/server/auth';

export const load: PageServerLoad = async ({ url, cookies, fetch }) => {
	const code = url.searchParams.get('code');

	if (!code) {
		throw redirect(303, '/?error=auth_failed');
	}

	const authAPI = new AuthAPI(cookies, fetch);
	let user: User;

	try {
		user = await authAPI.Login(code);
	} catch (error) {
		console.error('Callback error:', error);
		throw redirect(303, '/?error=unexpected_error');
	}

	// Check if user needs to complete profile
	if (user && (!user.handler || !user.username)) {
		throw redirect(303, '/chef');
	}

	throw redirect(303, '/');
};
