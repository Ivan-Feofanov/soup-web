import type { Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { serverApi, ValidationError } from '$lib/server/api';

export const actions = {
	update: async ({ cookies, request }) => {
		const formData = await request.formData();
		const uid = formData.get('uid');
		const firstTime = formData.get('firstTime');
		const handler = formData.get('handler');
		const username = formData.get('username');

		try{
			await serverApi('PATCH', `/api/users/${uid}`, cookies, {handler, username})
		} catch (error) {
			if (error instanceof ValidationError) {
				return fail(400, {handler, username, errors: error.fields});
			}
			console.error('Error updating user:', error);
			return fail(400, {handler, username, errors: error});
		}
		if (firstTime === 'true') {
			redirect(303, '/');
		}
		return { success: true };
	},

	logout: async ({ cookies }) => {
		cookies.delete('access_token', { path: '/' });
		cookies.delete('refresh_token', { path: '/' });
		redirect(303, '/')
	}
} satisfies Actions;

