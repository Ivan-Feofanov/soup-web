import type { Cookies } from '@sveltejs/kit';
import { BaseAPI, type Fetch } from '$lib/server/base';
import { AUTH_REDIRECT_URL } from '$env/static/private';
import type { AuthResponse, User } from '$lib/types';

export class AuthAPI extends BaseAPI {
	constructor(cookies: Cookies, fetch: Fetch) {
		super(cookies, fetch);
		this.baseUrl = `${this.serverUrl}/api/auth`;
	}

	async Login(code: string): Promise<User> {
		try {
			const response = await this.POST(`/login/google-oauth2/`, {
				code,
				redirect_uri: AUTH_REDIRECT_URL
			});
			const data: AuthResponse = await response.json();
			this.setTokens(data);
			return data.user;
		} catch (error) {
			console.error('Login failed:', error);
			throw error;
		}
	}

	async Logout() {
		this.clearTokens();
	}
}
