import { superValidate, type SuperValidated } from 'sveltekit-superforms';
import { zod4 } from "sveltekit-superforms/adapters";
import type { Ingredient, Recipe, Unit, User } from '$lib/types';
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
	user: User | null,
	recipe: Recipe | null;
	ingredients: Ingredient[];
	units: Unit[];
	form: SuperValidated<RecipeSchema>;
	ingredientAddForm: SuperValidated<IngredientSchema>;
	unitAddForm: SuperValidated<UnitSchema>;
}

export const load: PageServerLoad = async ({ cookies, params, parent }): Promise<PageData> => {
	const { user } = await parent();
	const kitchen = new KitchenAPI(cookies, fetch);
	const ingredients = await kitchen.GetIngredients();
	const units = await kitchen.GetUnits();

	if (params.uid === 'new') {
		try {
			return {
				user,
				recipe: null,
				ingredients,
				units,
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
		const recipeFormData = {
			title: recipe.title,
			description: recipe.description,
			notes: recipe.notes,
			image: recipe.image,
			instructions: recipe.instructions,
			ingredients: recipe.ingredients?.map(i => ({
				ingredient_uid: i.ingredient.uid,
				unit_uid: i.unit?.uid || '',
				quantity: i.quantity,
				notes: i.notes
			})) || []
		};
		const form = await superValidate(recipeFormData, zod4(recipeSchema));
		return {
			user,
			recipe,
			ingredients,
			units,
			form,
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
		const kitchenAPI = new KitchenAPI(event.cookies, event.fetch);
		const form = await superValidate(event, zod4(recipeSchema));
		if (!form.valid) {
			console.error(form.errors)
			return fail(400, {
				form,
			});
		}
		let recipeUid = event.params.uid;
		if (event.params.uid === 'new') {
			try {
				recipeUid = await kitchenAPI.CreateRecipe(form.data);
			} catch (e) {
				console.error(e);
				return fail(500, { form });
			}
		} else if (event.params.uid) {
			recipeUid = event.params.uid;
			try {
				await kitchenAPI.UpdateRecipe(recipeUid, form.data);
			} catch (e) {
				console.error(e);
				return fail(500, { form });
			}
		}
		throw redirect(303, `/recipes/${recipeUid}`)
	},
	deleteRecipe: async (event) => {
		const recipeUid = event.params.uid;
		if (!recipeUid) {
			return fail(400, { error: 'Recipe UID is required' })
		}
		try {
			const kitchenAPI = new KitchenAPI(event.cookies, event.fetch)
			await kitchenAPI.DeleteRecipe(recipeUid);
		} catch (e) {
			console.error(e)
			return fail(500, { error: 'Failed to delete recipe' })
		}
		throw redirect(303, '/');
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
