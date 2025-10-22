import type { Cookies } from '@sveltejs/kit';
import type { User } from '@lucide/svelte';
import { BaseAPI, type Fetch } from '$lib/server/base';

export class UserAPI extends BaseAPI {
	constructor(cookies: Cookies, fetch: Fetch) {
		super(cookies, fetch);
		this.baseUrl = `${this.serverUrl}/api/users`;
	}

	GetMe = async (): Promise<User | null> => {
		if (!this.isAuthenticated()) {
			return null;
		}

		const response = await this.GET('/me');
		if (!response.ok) {
			const errorData = await response.json();
			console.error('Failed to fetch user:', errorData);
			throw new Error(`Failed to fetch user: ${errorData}`);
		}
		return await response.json();
	};

	UpdateUser = async (userUid: string, userData: { handler: string; username: string }) => {
		return this.PATCH(`/${userUid}`, userData);
	};
}
