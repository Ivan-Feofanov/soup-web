import { getGoogleAuthUrl } from '$lib/auth';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const authURL = getGoogleAuthUrl();
	return { authURL };
}
