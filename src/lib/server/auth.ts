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
		const response = await this.POST(`/login/google-oauth2/`, {
			code,
			redirect_uri: AUTH_REDIRECT_URL
		});

		if (!response.ok) {
			const errorData = await response.json();
			console.error('Failed to login:', errorData);
			throw new Error(`Failed to login: ${errorData}`);
		}

		const data: AuthResponse = await response.json();
		this.setTokens(data);

		return data.user;
	}

	async Logout() {
		const response = await this.POST('/logout/');

		if (!response.ok) {
			console.error('Failed to logout');
			throw new Error('Failed to logout');
		}

		// Clear tokens from cookies
		this.cookies.delete('access_token', { path: '/' });
		this.cookies.delete('refresh_token', { path: '/' });

		return;
	}
}
