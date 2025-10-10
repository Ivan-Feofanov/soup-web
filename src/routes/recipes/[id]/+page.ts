import { recipes } from '$lib/data';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
	const allRecipes = recipes;
	const recipe = allRecipes.find((r) => r.id === params.id);
	return { recipe, comments: [] };
};
