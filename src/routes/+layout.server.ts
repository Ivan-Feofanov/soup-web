import type { LayoutServerLoad } from './$types';
import { getGoogleAuthUrl } from '$lib/auth';

import { UserAPI } from '$lib/server/user';

export const load: LayoutServerLoad = async ({cookies, fetch}) => {
	const authURL = getGoogleAuthUrl();
	if (!cookies.get('access_token') || !cookies.get('refresh_token')) {
		return { user: null, authURL };
	}

	return {
		user: await new UserAPI(cookies, fetch).GetMe(),
		authURL: null,
	};
};


