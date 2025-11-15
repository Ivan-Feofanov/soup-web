import type { Cookies } from '@sveltejs/kit';
import { BaseAPI, type Fetch } from '$lib/server/base';
import { AUTH_REDIRECT_URL } from '$env/static/private';
import type { User } from '$lib/types';

export class AuthAPI extends BaseAPI {
	constructor(cookies: Cookies, fetch: Fetch) {
		super(cookies, fetch);
	}

	async Login(code: string): Promise<User> {
		const { data, error } = await this.client.POST(`/api/auth/login/{backend}/`, {
			params: {
				path: {
					backend: 'google-oauth2'
				}
			},
			body: {
				code,
				redirect_uri: AUTH_REDIRECT_URL
			}
		});
		if (error) {
			console.error('Login failed:', error);
			throw error;
		}
		this.setTokens(data);
		return data.user;
	}

	async Logout() {
		this.clearTokens();
	}
}
