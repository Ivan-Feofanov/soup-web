import { superValidate, type SuperValidated } from 'sveltekit-superforms';
import { zod4 } from "sveltekit-superforms/adapters";
import type { Ingredient, Recipe, Unit } from '$lib/types';
import type { PageServerLoad } from './$types';
import { type Actions, error, fail, redirect } from '@sveltejs/kit';
import {
	ingredientSchema,
	type IngredientSchema,
	recipeSchema,
	type RecipeSchema,
	unitSchema,
	type UnitSchema
} from '$lib/schemes';
import { KitchenAPI } from '$lib/server/kitchen';

interface PageData {
	recipe: Recipe | null;
	ingredients: Ingredient[];
	units: Unit[];
	form: SuperValidated<RecipeSchema>;
	ingredientAddForm: SuperValidated<IngredientSchema>;
	unitAddForm: SuperValidated<UnitSchema>;
}

export const load: PageServerLoad = async ({ cookies, params }): Promise<PageData> => {
	const kitchen = new KitchenAPI(cookies, fetch);
	if (params.uid === 'new') {
		try {
			return {
				recipe: null,
				ingredients: await kitchen.GetIngredients(),
				units: await kitchen.GetUnits(),
				form: await superValidate(zod4(recipeSchema)),
				ingredientAddForm: await superValidate(zod4(ingredientSchema)),
				unitAddForm: await superValidate(zod4(unitSchema))
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
			form: await superValidate(zod4(recipeSchema)),
			ingredientAddForm: await superValidate(zod4(ingredientSchema)),
			unitAddForm: await superValidate(zod4(unitSchema))
		};
	} catch (err) {
		console.error(err);
		throw redirect(303, '/');
	}
};

export const actions: Actions = {
	saveRecipe: async (event) => {
		const form = await superValidate(event, zod4(recipeSchema));
		if (!form.valid) {
			console.error(form.errors)
			return fail(400, {
				form,
			});
		}
		let recipeUid: string;
		try {
			const kitchenAPI = new KitchenAPI(event.cookies, event.fetch)
			recipeUid = await kitchenAPI.CreateRecipe(form.data);
		} catch (e) {
			console.error(e)
			return fail(500, { form })
		}
		redirect(303, `/recipes/${recipeUid}`)
	},
	addIngredient: async (event) => {
		const form = await superValidate(event, zod4(ingredientSchema));
		if (!form.valid) {
			console.error(form.errors)
			return fail(400, {
				form,
			});
		}
		const kitchenAPI = new KitchenAPI(event.cookies, event.fetch)
		const { created, ingredient } = await kitchenAPI.addIngredient(form.data)
		return {success: true, form, ingredient, created}
	},
	addUnit: async (event) => {
		const form = await superValidate(event, zod4(unitSchema));
		if (!form.valid) {
			console.error(form.errors)
			return fail(400, {
				form,
			});
		}
		const kitchenAPI = new KitchenAPI(event.cookies, event.fetch)
		const { created, unit } = await kitchenAPI.addUnit(form.data)
		return {success: true, form, unit, created}
	}
};
