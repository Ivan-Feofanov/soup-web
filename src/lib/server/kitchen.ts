import type { Cookies } from '@sveltejs/kit';
import type { Ingredient, Recipe, ServerRecipe, Unit } from '$lib/types';
import { BaseAPI, type Fetch } from '$lib/server/base';

export class KitchenAPI extends BaseAPI {
	constructor(cookies: Cookies, fetch: Fetch) {
		super(cookies, fetch);
		this.baseUrl = `${this.serverUrl}/api/kitchen`;
	}

	GetRecipes = async (): Promise<Recipe[]> => {
		const response = await this.GET('/recipes/');
		if (!response.ok) {
			const errorData = await response.json();
			console.error('Failed to fetch recipes:', errorData);
			throw new Error(`Failed to fetch recipes: ${errorData}`);
		}
		const data = await response.json();

		return data.map((recipe: ServerRecipe) => ({
			...recipe,
			createdAt: new Date(recipe.created_at),
			instructions: recipe.instructions?.map((instruction: string, index: number) => ({
				id: index,
				content: instruction
			}))
		}));
	};

	GetRecipe = async (uid: string): Promise<Recipe> => {
		const response = await this.GET(`/recipes/${uid}`);
		if (!response.ok) {
			const errorData = await response.json();
			console.error('Failed to fetch recipe:', errorData);
			throw new Error(`Failed to fetch recipe: ${errorData}`);
		}
		const data = await response.json();

		return {
			...data,
			createdAt: new Date(data.created_at),
			instructions: data.instructions?.map((instruction: string, index: number) => ({
				id: index,
				content: instruction
			})) as Recipe
		};
	};

	GetIngredients = async (): Promise<Ingredient[]> => {
		const response = await this.GET('/ingredients/');
		if (!response.ok) {
			const errorData = await response.json();
			console.error('Failed to fetch ingredients:', errorData);
			throw new Error(`Failed to fetch ingredients: ${errorData}`);
		}
		return await response.json();
	};

	GetUnits = async (): Promise<Unit[]> => {
		const response = await this.GET('/units/');
		if (!response.ok) {
			const errorData = await response.json();
			console.error('Failed to fetch units:', errorData);
			throw new Error(`Failed to fetch units: ${errorData}`);
		}
		return await response.json();
	};

	CreateRecipe = async (recipe: Record<string, unknown>): Promise<string> => {
		const response = await this.POST('/recipes/', recipe);
		if (!response.ok) {
			const errorData = await response.json();
			console.error('Failed to create recipe:', errorData);
			throw new Error(`Failed to create recipe: ${errorData}`);
		}
		const data: ServerRecipe = await response.json();
		return data.uid;
	};

	UpdateRecipe = async (uid: string, recipe: Record<string, unknown>) => {
		const response = await this.PATCH(`/recipes/${uid}`, recipe);
		if (!response.ok) {
			const errorData = await response.json();
			console.error('Failed to update recipe:', errorData);
			throw new Error(`Failed to update recipe: ${errorData}`);
		}
		return;
	};
	DeleteRecipe = async (uid: string) => {
		return this.DELETE(`/recipes/${uid}`);
	};

	addIngredient = async (data: Record<string, unknown>): Promise<{created: boolean, ingredient: Ingredient}> => {
		const response = await this.POST('/ingredients/', data);
		if (!response.ok) {
			const errorData = await response.json();
			console.error('Failed to add ingredient:', errorData);
			throw new Error(`Failed to add ingredient: ${errorData}`);
		}

		return {created: response.status === 201, ingredient: await response.json()};
	};

	addUnit = async (data: Record<string, unknown>): Promise<{created: boolean, unit: Unit}> => {
		const response = await this.POST('/units/', data);
		if (!response.ok) {
			const errorData = await response.json();
			console.error('Failed to add unit:', errorData);
			throw new Error(`Failed to add unit: ${errorData}`);
		}
		return {created: response.status === 201, unit: await response.json()};
	}
}
