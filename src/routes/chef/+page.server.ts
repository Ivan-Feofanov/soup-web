import type { Actions } from './$types';
import { redirect } from '@sveltejs/kit';

export const actions = {
	logout: async ({ cookies }) => {
		cookies.delete('access_token', { path: '/' });
		cookies.delete('refresh_token', { path: '/' });
		redirect(303, '/')
	}
} satisfies Actions;

