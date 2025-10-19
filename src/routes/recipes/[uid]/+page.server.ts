import { superValidate, type SuperValidated } from 'sveltekit-superforms';
import { zod4 } from "sveltekit-superforms/adapters";
import type { Ingredient, Recipe, Unit } from '$lib/types';
import type { PageServerLoad } from './$types';
import { type Actions, error, fail, redirect } from '@sveltejs/kit';
import { recipeSchema, type RecipeSchema } from '$lib/schemes';
import { KitchenAPI } from '$lib/server/kitchen';

interface PageData {
	recipe: Recipe | null;
	ingredients: Ingredient[];
	units: Unit[];
	form: SuperValidated<RecipeSchema>;
}

export const load: PageServerLoad = async ({ cookies, params }): Promise<PageData> => {
	const kitchen = new KitchenAPI(cookies, fetch);
	if (params.uid === 'new') {
		try {
			return {
				recipe: null,
				ingredients: await kitchen.GetIngredients(),
				units: await kitchen.GetUnits(),
				form: await superValidate(zod4(recipeSchema))
			}
		} catch (err) {
			console.error(err);
			return error(500, 'Failed to fetch ingredients or units');
		}
	}

	try {
		const recipe = await kitchen.GetRecipe(params.uid);
		return {
			recipe,
			ingredients: [],
			units: [],
			form: await superValidate(zod4(recipeSchema))
		};
	} catch (err) {
		console.error(err);
		throw redirect(303, '/');
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
		let recipeUid: string;
		try {
			recipeUid = await new KitchenAPI(event.cookies, event.fetch).CreateRecipe(form.data);
		} catch (e) {
			console.error(e)
			return fail(500, { form })
		}
		redirect(303, `/recipes/${recipeUid}`)
	},
};
