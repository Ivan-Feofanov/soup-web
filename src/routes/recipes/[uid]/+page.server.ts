import { superValidate, type SuperValidated } from 'sveltekit-superforms';
import { zod4 } from "sveltekit-superforms/adapters";
import { serverApi } from '$lib/server/api';
import type { Ingredient, Recipe, ServerRecipe, Unit } from '$lib/types';
import type { PageServerLoad } from './$types';
import { type Actions, error, fail, redirect } from '@sveltejs/kit';
import { type RecipeSchema, recipeSchema } from './recipe.schema';

interface PageData {
	recipe: Recipe | null,
	ingredients: Ingredient[],
	units: Unit[],
	form: SuperValidated<RecipeSchema>
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
				units,
				form: await superValidate(zod4(recipeSchema))
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
			units,
			form: await superValidate(zod4(recipeSchema))
		};
	} catch (err) {
		console.error(err);
		error(500, 'Failed to fetch recipe')
	}
};

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, zod4(recipeSchema));
		if (!form.valid) {
			console.error(form.errors)
			return fail(400, {
				form,
			});
		}
		const response = await serverApi('POST', '/api/kitchen/recipes/', event.cookies, form.data)
		if (!response.ok) {
			return fail(response.status, form)
		}
		const responseData: ServerRecipe = await response.json();
		redirect(303, `/recipes/${responseData.uid}`)
	},
};
