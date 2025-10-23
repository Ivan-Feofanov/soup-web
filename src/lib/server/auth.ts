import type { Cookies } from '@sveltejs/kit';
import { BaseAPI, type Fetch } from '$lib/server/base';
import { AUTH_REDIRECT_URL } from '$env/dynamic/private';

export class AuthAPI extends BaseAPI {
	constructor(cookies: Cookies, fetch: Fetch) {
		super(cookies, fetch);
		this.baseUrl = `${this.serverUrl}/api/auth`;
	}

	ExchangeCodeForTokens = async (code: string) => {
		const response = await this.POST(`/login/google-oauth2/`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				code: code,
				redirect_uri: AUTH_REDIRECT_URL
			})
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
