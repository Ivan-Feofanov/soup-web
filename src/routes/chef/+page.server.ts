import type { Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { ValidationError } from '$lib/server/base';
import { UserAPI } from '$lib/server/user';
import { AuthAPI } from '$lib/server/auth';
import { setError, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { userSchema } from '$lib/schemes';

export const load = async ({ parent }) => {
	const { user } = await parent();
	const firstTime = !user?.handler && !user?.username;
	const form = await superValidate({ firstTime, ...user }, zod4(userSchema), { errors: false });
	return { form };
};

export const actions = {
	update: async ({ cookies, request, fetch }) => {
		const form = await superValidate(request, zod4(userSchema));
		if (!form.valid) {
			console.error(form.errors);
			return fail(400, {
				form
			});
		}

		try {
			await new UserAPI(cookies, fetch).UpdateUser(form.data.uid, {
				handler: form.data.handler,
				username: form.data.username
			});
		} catch (error) {
			if (error instanceof ValidationError) {
				if (error.fields.handler) {
					return setError(form, 'handler', error.fields.handler);
				}
				return fail(400, { form });
			}
			console.error('Error updating user:', error);
			return fail(400, { form });
		}
		if (form.data.firstTime) {
			throw redirect(303, '/');
		}
		return { form };
	},

	logout: async ({ cookies, fetch }) => {
		const authAPI = new AuthAPI(cookies, fetch);
		try {
			// Call backend logout endpoint to clear session
			await authAPI.Logout();
		} catch (error) {
			console.error('Logout error:', error);
			// Continue with redirect even if backend logout fails
		}
		redirect(303, '/');
	}
} satisfies Actions;
