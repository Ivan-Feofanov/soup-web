// import { recipes } from '$lib/data';
import type { ServerRecipe } from '$lib/types';

import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ fetch }) => {
	// const allRecipes = recipes;
	try {
		const serverRecipes = await fetch('http://localhost:8000/api/kitchen/recipes/').then((res) =>
			res.json()
		);

		return {
			allRecipes: serverRecipes.map((recipe: ServerRecipe) => ({
				...recipe,
				title: recipe.name,
				createdAt: new Date(recipe.created_at),
				instructions: recipe.instructions?.map((instruction: string, index: number) => ({
					id: index,
					content: instruction
				})),
				author: {
					uid: recipe.author?.uid,
					email: recipe.author?.email,
					firstName: recipe.author?.first_name,
					lastName: recipe.author?.last_name
				}
			}))
		};
	} catch (error) {
		console.error(error);
		return {
			allRecipes: []
		};
	}
};
