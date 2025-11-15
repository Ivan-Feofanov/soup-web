import type { Cookies } from '@sveltejs/kit';
import { BaseAPI, type Fetch } from '$lib/server/base';
import type { User, UserUpdate } from '$lib/types';

export class UserAPI extends BaseAPI {
	constructor(cookies: Cookies, fetch: Fetch) {
		super(cookies, fetch);
	}

	async GetMe(): Promise<User | null> {
		if (!this.isAuthenticated()) {
			return null;
		}

		const { data, error } = await this.client.GET('/api/users/me', {});
		if (error) {
			console.error('GetMe failed:', error);
			return null;
		}
		return data;
	}

	async UpdateUser(userUid: string, userData: UserUpdate) {
		return this.client.PATCH(`/api/users/{uid}`, {
			params: {
				path: {
					uid: userUid
				}
			},
			body: userData
		});
	}
}
