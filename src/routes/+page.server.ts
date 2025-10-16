import type { Recipe, ServerRecipe } from '$lib/types';
import type { PageServerLoad } from './$types';
import { serverApi } from '$lib/server/api';

export const load: PageServerLoad = async ({ cookies }): Promise<{recipes: Recipe[]}> => {
	try {
		const serverRecipes = await serverApi('GET', `/api/kitchen/recipes/`, cookies).then((res) =>
			res.json()
		);
		return {
			recipes: serverRecipes.map(
				(recipe: ServerRecipe) =>
					({
						...recipe,
						title: recipe.name,
						createdAt: new Date(recipe.created_at),
						instructions: recipe.instructions?.map((instruction: string, index: number) => ({
							id: index,
							content: instruction
						})),
					}) as Recipe
			)
		};
	} catch (error) {
		console.error(error);
		return {
			recipes: []
		};
	}
};
