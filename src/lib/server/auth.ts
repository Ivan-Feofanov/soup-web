import type { Cookies } from '@sveltejs/kit';
import { BaseAPI, type Fetch } from '$lib/server/base';
import { AUTH_REDIRECT_URL } from '$env/static/private';

export class AuthAPI extends BaseAPI {
	constructor(cookies: Cookies, fetch: Fetch) {
		super(cookies, fetch);
		this.baseUrl = `${this.serverUrl}/api/auth`;
	}

	async ExchangeCodeForTokens(code: string) {
		const response = await this.POST(`/login/google-oauth2/`, {
				code,
				redirect_uri: AUTH_REDIRECT_URL
		}, true);

		if (!response.ok) {
			const errorData = await response.json();
			console.error('Failed to exchange code for tokens:', errorData);
			throw new Error(`Failed to exchange code for tokens: ${errorData}`);
		}

		const data = await response.json();
		const { access, refresh, user } = data;
		return { access, refresh, user };
	}
}
