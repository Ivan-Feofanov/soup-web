import { recipes } from '$lib/data';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
	const allRecipes = recipes;

	const sortedAllRecipes = [...allRecipes].sort(
		(a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)
	);

	return {
		allRecipes: sortedAllRecipes
	};
};
