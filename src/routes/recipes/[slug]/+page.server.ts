import { ImagesAPI } from '$lib/server/images';
import { superValidate, type SuperValidated } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import type { Ingredient, Recipe, RecipeVisibility, Unit, User } from '$lib/types';
import type { PageServerLoad } from './$types';
import { type Actions, error, fail, redirect } from '@sveltejs/kit';
import {
	ingredientSchema,
	type IngredientSchema,
	type RecipeDraftSchema,
	recipeDraftSchema,
	recipeFormSchema,
	recipeSchema,
	type RecipeSchema,
	unitSchema,
	type UnitSchema
} from '$lib/schemes';
import { KitchenAPI } from '$lib/server/kitchen';
import { definePageMetaTags, type MetaTagsProps } from 'svelte-meta-tags';
import { getMetaDataFromRecipe } from '$lib/metadata';

interface PageData {
	pageMetaTags: Readonly<MetaTagsProps>;
	user: User | null;
	recipe: Recipe | null;
	ingredients: Ingredient[];
	units: Unit[];
	form: SuperValidated<RecipeSchema | RecipeDraftSchema>;
	ingredientAddForm: SuperValidated<IngredientSchema>;
	unitAddForm: SuperValidated<UnitSchema>;
}

export const load: PageServerLoad = async ({ cookies, params, parent }): Promise<PageData> => {
	const { user } = await parent();
	const kitchen = new KitchenAPI(cookies, fetch);
	const ingredients = await kitchen.getIngredients();
	const units = await kitchen.getUnits();

	if (params.slug === 'new') {
		if (!user) {
			throw redirect(303, '/');
		}
		try {
			const draft = await kitchen.getOrCreateDraft();
			const draftFormData = {
				...draft,
				isDraft: true as const,
				visibility: draft.visibility as RecipeVisibility,
				ingredients:
					draft.ingredients?.map((i) => ({
						ingredient_uid: i.ingredient.uid,
						unit_uid: i.unit?.uid,
						quantity: i.quantity,
						notes: i.notes
					})) || []
			};
			return {
				pageMetaTags: definePageMetaTags({
					title: 'New Recipe',
					description: 'Create a new recipe'
				}).pageMetaTags,
				user,
				recipe: null,
				ingredients,
				units,
				form: await superValidate(draftFormData, zod4(recipeDraftSchema), { errors: false }),
				ingredientAddForm: await superValidate(zod4(ingredientSchema)),
				unitAddForm: await superValidate(zod4(unitSchema))
			};
		} catch (err) {
			console.error(err);
			return error(500, 'Failed to fetch ingredients or units');
		}
	}

	try {
		const recipe = await kitchen.getRecipe(params.slug);
		const recipeFormData = {
			...recipe,
			title: recipe.title!,
			description: recipe.description!,
			visibility: recipe.visibility as RecipeVisibility,
			isDraft: false as const,
			ingredients:
				recipe.ingredients?.map((i) => ({
					ingredient_uid: i.ingredient.uid,
					unit_uid: i.unit?.uid,
					quantity: i.quantity,
					notes: i.notes
				})) || []
		};
		const form = await superValidate(recipeFormData, zod4(recipeSchema));
		return {
			...getMetaDataFromRecipe(recipe),
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
		const kitchenApi = new KitchenAPI(event.cookies, event.fetch);
		const imagesApi = new ImagesAPI();

		const form = await superValidate(event, zod4(recipeFormSchema));
		if (!form.valid) {
			console.error(form.errors);
			return fail(400, {
				form
			});
		}

		if (form.data.isDraft) {
			try {
				await kitchenApi.updateDraft(form.data.uid, form.data);
			} catch (e) {
				console.error(e);
				return fail(500, { form });
			}
			return { form };
		}

		let recipeSlug = event.params.slug;
		if (!recipeSlug) return fail(400, { error: 'Recipe UID is required' });

		if (recipeSlug === 'new') {
			try {
				if (form.data.newImage) {
					form.data.image = await imagesApi.create(form.data.newImage);
				}
				recipeSlug = await kitchenApi.createRecipe(form.data);
			} catch (e) {
				console.error(e);
				return fail(500, { form });
			}
		} else {
			try {
				if (form.data.newImage) {
					if (form.data.image) {
						await imagesApi.delete(form.data.image);
					}
					form.data.image = await imagesApi.create(form.data.newImage);
				}
				await kitchenApi.updateRecipe(form.data.uid, form.data);
			} catch (e) {
				console.error(e);
				return fail(500, { form });
			}
		}
		throw redirect(303, `/recipes/${recipeSlug}`);
	},
	finishDraft: async (event) => {
		// Validate without the isDraft field since it will be true in the incoming data
		const form = await superValidate(event, zod4(recipeSchema.omit({ isDraft: true })));
		if (!form.valid) {
			console.error(form.errors);
			return fail(400, {
				form
			});
		}

		try {
			const kitchenApi = new KitchenAPI(event.cookies, event.fetch);
			// Update draft with final data (including image)
			await kitchenApi.updateDraft(form.data.uid, form.data);

			// Finish the draft (converts to recipe)
			await kitchenApi.finishDraft(form.data.uid);
		} catch (e) {
			console.error(e);
			return fail(500, { form });
		}

		// Redirect to the newly created recipe (outside try-catch)
		throw redirect(303, `/recipes/${form.data.uid}`);
	},
	deleteRecipe: async (event) => {
		const recipeSlug = event.params.slug;
		if (!recipeSlug) {
			return fail(400, { error: 'Recipe UID is required' });
		}

		const kitchenApi = new KitchenAPI(event.cookies, event.fetch);
		const imagesApi = new ImagesAPI();

		try {
			const recipe = await kitchenApi.getRecipe(recipeSlug);
			if (recipe.image) {
				await imagesApi.delete(recipe.image);
			}
			await kitchenApi.deleteRecipe(recipe.uid);
		} catch (e) {
			console.error(e);
			return fail(500, { error: 'Failed to delete recipe' });
		}
		throw redirect(303, '/');
	},
	addIngredient: async (event) => {
		const form = await superValidate(event, zod4(ingredientSchema));
		if (!form.valid) {
			console.error(form.errors);
			return fail(400, {
				form
			});
		}
		const kitchenAPI = new KitchenAPI(event.cookies, event.fetch);
		const { created, ingredient } = await kitchenAPI.addIngredient(form.data);
		return { success: true, form, ingredient, created };
	},
	addUnit: async (event) => {
		const form = await superValidate(event, zod4(unitSchema));
		if (!form.valid) {
			console.error(form.errors);
			return fail(400, {
				form
			});
		}
		const kitchenAPI = new KitchenAPI(event.cookies, event.fetch);
		const { created, unit } = await kitchenAPI.addUnit(form.data);
		return { success: true, form, unit, created };
	},
	uploadImage: async (event) => {
		const imagesApi = new ImagesAPI();

		try {
			const formData = await event.request.formData();
			const imageFile = formData.get('image') as File;

			if (!imageFile) {
				return fail(400, { error: 'Image file is required' });
			}

			// Upload image to Cloudinary - single responsibility!
			const imageUrl = await imagesApi.create(imageFile);

			return { success: true, imageUrl };
		} catch (e) {
			console.error('Image upload failed:', e);
			return fail(500, { error: 'Failed to upload image' });
		}
	}
};
