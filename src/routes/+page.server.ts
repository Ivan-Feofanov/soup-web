import type { Recipe } from '$lib/types';
import type { PageServerLoad } from './$types';

import { KitchenAPI } from '$lib/server/kitchen';
import { definePageMetaTags } from 'svelte-meta-tags';

export const load: PageServerLoad = async ({ cookies, fetch }): Promise<{ recipes: Recipe[] }> => {
	const pageTags = definePageMetaTags({
		title: 'All Recipes',
		description: 'All recipes from the community',
		openGraph: {
			title: 'All Recipes',
			description: 'All recipes from the community'
		}
	});
	try {
		const recipes = await new KitchenAPI(cookies, fetch).getRecipes();
		return {
			...pageTags,
			recipes
		};
	} catch (error) {
		console.error(error);
		return {
			...pageTags,
			recipes: []
		};
	}
};
