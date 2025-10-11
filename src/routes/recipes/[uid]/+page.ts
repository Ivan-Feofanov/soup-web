import type { Recipe } from '$lib/types';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent, params }) => {
	const { allRecipes } = await parent();
	const recipe = allRecipes.find((r: Recipe) => r.uid === params.uid);
	return { recipe };
};
