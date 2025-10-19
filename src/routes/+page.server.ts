import type { Recipe } from '$lib/types';
import type { PageServerLoad } from './$types';

import { KitchenAPI } from '$lib/server/kitchen';

export const load: PageServerLoad = async ({ cookies, fetch }): Promise<{recipes: Recipe[]}> => {
	try {
		const recipes = await new KitchenAPI(cookies, fetch).GetRecipes()
		return {
			recipes
		};
	} catch (error) {
		console.error(error);
		return {
			recipes: []
		};
	}
};
