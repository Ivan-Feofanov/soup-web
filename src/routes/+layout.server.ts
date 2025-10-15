import type { User } from '$lib/types';
import type { LayoutServerLoad } from './$types';
import { getGoogleAuthUrl } from '$lib/auth';
import { serverApi } from '$lib/server/api';
export const load: LayoutServerLoad = async ({cookies}) => {
	const authURL = getGoogleAuthUrl();
	if (!cookies.get('access_token') || !cookies.get('refresh_token')) {
		return { user: null, authURL };
	}
	const userResponse = await serverApi('GET', `/api/users/me`, cookies);
	if (!userResponse.ok) {
		console.error('Failed to fetch user information', userResponse.statusText);
		return { user: null, authURL };
	}
	const user: User = await userResponse.json();

	return {
		user,
		authURL: null,
	};
};


