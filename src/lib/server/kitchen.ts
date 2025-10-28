import type { Cookies } from '@sveltejs/kit';
import type { Ingredient, Recipe, ServerRecipe, Unit } from '$lib/types';
import { BaseAPI, type Fetch } from '$lib/server/base';
import { HttpStatus } from '$lib/server/utils';

export class KitchenAPI extends BaseAPI {
	constructor(cookies: Cookies, fetch: Fetch) {
		super(cookies, fetch);
		this.baseUrl = `${this.serverUrl}/api/kitchen`;
	}

	async GetRecipes(): Promise<Recipe[]> {
		const response = await this.GET('/recipes/');
		const data = await response.json();
		return data.map((recipe: ServerRecipe) => ({
			...recipe,
			createdAt: new Date(recipe.created_at),
			updatedAt: new Date(recipe.updated_at)
		}));
	}

	async GetRecipe(uid: string): Promise<Recipe> {
		const response = await this.GET(`/recipes/${uid}`);
		const data = await response.json();
		return {
			...data,
			createdAt: new Date(data.created_at),
			updatedAt: new Date(data.updated_at)
		};
	}

	async GetIngredients(): Promise<Ingredient[]> {
		const response = await this.GET('/ingredients/');
		return response.json();
	}

	async GetUnits(): Promise<Unit[]> {
		const response = await this.GET('/units/');
		return response.json();
	}

	async CreateRecipe(recipe: Record<string, unknown>): Promise<string> {
		const response = await this.POST('/recipes/', recipe);
		const data: ServerRecipe = await response.json();
		return data.uid;
	}

	async UpdateRecipe(uid: string, recipe: Record<string, unknown>) {
		return this.PATCH(`/recipes/${uid}`, recipe);
	}

	async DeleteRecipe(uid: string) {
		return this.DELETE(`/recipes/${uid}`);
	}

	async addIngredient(
		data: Record<string, unknown>
	): Promise<{ created: boolean; ingredient: Ingredient }> {
		const response = await this.POST('/ingredients/', data);
		return { created: response.status === HttpStatus.CREATED, ingredient: await response.json() };
	}

	async addUnit(data: Record<string, unknown>): Promise<{ created: boolean; unit: Unit }> {
		const response = await this.POST('/units/', data);
		return { created: response.status === HttpStatus.CREATED, unit: await response.json() };
	}
}
