import { serverApi } from '$lib/server/api';
import type { Ingredient, Recipe, ServerRecipe, Unit } from '$lib/types';
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

interface PageData {
	recipe: Recipe | null,
	ingredients: Ingredient[],
	units: Unit[]
}

export const load: PageServerLoad = async ({ cookies, params }): Promise<PageData> => {
	let ingredients: Ingredient[] = [];
	let units: Unit[] = [];
	if (params.uid === 'new') {
		try {
			const ingredientsResponse = await serverApi('GET', `/api/kitchen/ingredients/`, cookies);
			if (!ingredientsResponse.ok) {
				return error(ingredientsResponse.status, ingredientsResponse.statusText);
			}
			ingredients = await ingredientsResponse.json();
			const unitsResponse = await serverApi('GET', `/api/kitchen/units/`, cookies);
			if (!unitsResponse.ok) {
				return error(unitsResponse.status, unitsResponse.statusText);
			}
			units = await unitsResponse.json();
			return {
				recipe: null,
				ingredients,
				units
			}
		} catch (err) {
			console.error(err);
			return error(500, 'Failed to fetch ingredients or units');
		}
	}

	try {
		const serverRecipe: ServerRecipe = await serverApi('GET', `/api/kitchen/recipes/${params.uid}`, cookies).then((res) =>
			res.json()
		);
		if (!serverRecipe) {
			return error(404, 'Recipe not found');
		}
		return {
			recipe: {
				...serverRecipe,
				title: serverRecipe.name,
				createdAt: new Date(serverRecipe.created_at),
				instructions: serverRecipe.instructions?.map((instruction: string, index: number) => ({
					id: index,
					content: instruction
				})),
			},
			ingredients,
			units
		};
	} catch (err) {
		console.error(err);
		error(500, 'Failed to fetch recipe')
	}
};
