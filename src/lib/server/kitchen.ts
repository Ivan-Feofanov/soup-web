import type { Cookies } from '@sveltejs/kit';
import type {
	Ingredient,
	IngredientCreate,
	Recipe,
	RecipeCreate,
	RecipeDraft,
	Unit
} from '$lib/types';
import { BaseAPI, type Fetch, snakeToCamel } from '$lib/server/base';
import { HttpStatus } from '$lib/server/errors';

export class KitchenAPI extends BaseAPI {
	constructor(cookies: Cookies, fetch: Fetch) {
		super(cookies, fetch);
	}

	async getRecipes(): Promise<Recipe[]> {
		const { data, error } = await this.client.GET('/api/kitchen/recipes/');
		if (error) {
			throw error;
		}
		return snakeToCamel<Recipe[]>(data);
	}

	async getRecipe(slug: string): Promise<Recipe> {
		const { data, error } = await this.client.GET(`/api/kitchen/recipes/{slug}`, {
			params: { path: { slug } }
		});
		if (error) {
			throw error;
		}
		return snakeToCamel<Recipe>(data);
	}

	async getIngredients(): Promise<Ingredient[]> {
		const { data, error } = await this.client.GET('/api/kitchen/ingredients/');
		if (error) {
			throw error;
		}
		return data;
	}

	async getUnits(): Promise<Unit[]> {
		const { data, error } = await this.client.GET('/api/kitchen/units/');
		if (error) {
			throw error;
		}
		return data;
	}

	async createRecipe(recipe: RecipeCreate): Promise<string> {
		const { data, error } = await this.client.POST('/api/kitchen/recipes/', {
			body: recipe
		});
		if (error) {
			throw error;
		}
		return data.uid;
	}

	async updateRecipe(uid: string, recipe: RecipeCreate) {
		const { data, error } = await this.client.PATCH(`/api/kitchen/recipes/{uid}`, {
			params: { path: { uid } },
			body: recipe
		});
		if (error) {
			throw error;
		}
		return data;
	}

	async deleteRecipe(uid: string) {
		const { error } = await this.client.DELETE(`/api/kitchen/recipes/{uid}`, {
			params: { path: { uid } }
		});
		if (error) {
			throw error;
		}
	}

	async addIngredient(
		ingredient: IngredientCreate
	): Promise<{ created: boolean; ingredient: Ingredient }> {
		const { data, error, response } = await this.client.POST('/api/kitchen/ingredients/', {
			body: ingredient
		});
		if (error) {
			throw error;
		}
		return { created: response.status === HttpStatus.CREATED, ingredient: data };
	}

	async addUnit(unit: Unit): Promise<{ created: boolean; unit: Unit }> {
		const { data, error, response } = await this.client.POST('/api/kitchen/units/', {
			body: unit
		});
		if (error) {
			throw error;
		}
		return { created: response.status === HttpStatus.CREATED, unit: data };
	}

	async getOrCreateDraft(): Promise<Recipe> {
		const { data, error } = await this.client.POST('/api/kitchen/recipes/drafts/', {});
		if (error) {
			throw error;
		}
		return snakeToCamel<Recipe>(data);
	}

	async updateDraft(uid: string, draft: RecipeDraft) {
		const { error } = await this.client.PATCH(`/api/kitchen/recipes/drafts/{uid}`, {
			params: { path: { uid } },
			body: draft
		});
		if (error) {
			throw error;
		}
	}

	async deleteDraft(uid: string) {
		const { error } = await this.client.DELETE(`/api/kitchen/recipes/drafts/{uid}`, {
			params: { path: { uid } }
		});
		if (error) {
			throw error;
		}
	}

	async finishDraft(uid: string) {
		const { error } = await this.client.POST(`/api/kitchen/recipes/drafts/{uid}/finish`, {
			params: { path: { uid } }
		});
		if (error) {
			throw error;
		}
	}
}
