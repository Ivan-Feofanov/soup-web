import type { LayoutServerLoad } from './$types';

import { UserAPI } from '$lib/server/user';

export const load: LayoutServerLoad = async ({cookies, fetch}) => {
	return {
		user: await new UserAPI(cookies, fetch).GetMe(),
	};
};


