import type { components } from '$lib/server/api';

// 1. Utility type to convert a single string from snake_case to camelCase
type CamelCase<S extends string> = S extends `${infer Head}_${infer Tail}`
	? `${Head}${Capitalize<CamelCase<Tail>>}`
	: S;

// 2. Mapped type to transform object keys
type SnakeToCamelCase<T> = {
	[K in keyof T as CamelCase<string & K>]: T[K] extends Record<string, unknown>
		? SnakeToCamelCase<T[K]> // Recursively apply to nested objects
		: T[K];
};

export type Ingredient = components['schemas']['IngredientSchema'];
export type IngredientCreate = components['schemas']['IngredientCreateSchema'];
export type Unit = components['schemas']['UnitSchema'];
export type Instruction = components['schemas']['InstructionSchema'];
export type User = components['schemas']['UserSchema'];
export type UserUpdate = components['schemas']['UserUpdateSchema'];

export type Recipe = SnakeToCamelCase<components['schemas']['RecipeSchema']>;
export type RecipeCreate = SnakeToCamelCase<components['schemas']['RecipeCreateSchema']>;
export type RecipeDraft = SnakeToCamelCase<components['schemas']['DraftSchema']>;
export type TokenRefreshResponse = components['schemas']['TokenRefreshResponseSchema'];

export type ErrorResponse = {
	message: string;
	errors: Record<string, string[]>;
};

export const RecipeVisibility = {
	Public: 'PUBLIC',
	Friends: 'FRIENDS',
	Private: 'PRIVATE'
} as const satisfies Record<string, components['schemas']['Visibility']>;

export type RecipeVisibility = (typeof RecipeVisibility)[keyof typeof RecipeVisibility];
