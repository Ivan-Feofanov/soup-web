import type { Cookies } from '@sveltejs/kit';
import { BaseAPI, type Fetch } from '$lib/server/base';
import { AUTH_REDIRECT_URL } from '$env/static/private';
import type { User } from '$lib/types';

export class AuthAPI extends BaseAPI {
	constructor(cookies: Cookies, fetch: Fetch) {
		super(cookies, fetch);
		this.baseUrl = `${this.serverUrl}/api/auth`;
	}

	async Login(code: string): Promise<User> {
		const response = await this.POST(`/login/google-oauth2/`, {
			code,
			redirect_uri: AUTH_REDIRECT_URL
		});

		if (!response.ok) {
			const errorData = await response.json();
			console.error('Failed to login:', errorData);
			throw new Error(`Failed to login: ${errorData}`);
		}

		// Forward Set-Cookie headers from backend to browser
		this.forwardCookies(response);

		const data = await response.json();
		return data.user;
	}

	async Logout() {
		const response = await this.POST('/logout/');

		if (!response.ok) {
			console.error('Failed to logout');
			throw new Error('Failed to logout');
		}

		// Forward Set-Cookie headers (to clear session cookie)
		this.forwardCookies(response);
		return;
	}
}
