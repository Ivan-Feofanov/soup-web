import type { Cookies } from '@sveltejs/kit';
import { BaseAPI, type Fetch } from '$lib/server/base';
import type { User } from '$lib/types';

export class UserAPI extends BaseAPI {
	constructor(cookies: Cookies, fetch: Fetch) {
		super(cookies, fetch);
		this.baseUrl = `${this.apiUrl}/users`;
	}

	async GetMe(): Promise<User | null> {
		if (!this.isAuthenticated()) {
			return null;
		}

		const response = await this.GET('/me');
		return await response.json();
	}

	async UpdateUser(userUid: string, userData: { handler: string; username: string }) {
		return this.PATCH(`/${userUid}`, userData);
	}
}
