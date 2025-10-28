export type Comment = {
	id: string;
	content: string;
	createdAt: string; // ISO date string
	author?: string;
};

export type Ingredient = {
	uid: string;
	name: string;
};

export type IngredientInRecipe = {
	uid: string;
	ingredient: Ingredient;
	unit: Unit;
	quantity: number;
	notes?: string;
};

export type Unit = {
	uid: string;
	name: string;
	abbreviation?: string;
};

export type Instruction = {
	uid: string;
	step?: number;
	description: string;
	timer?: number; // in minutes
};

export type User = {
	uid: string;
	email: string;
	handler?: string;
	username?: string;
};

export type Recipe = {
	uid: string;
	title: string;
	description: string;
	notes?: string;
	image?: string;
	createdAt: Date;
	updatedAt: Date;
	author?: User;
	tags?: string[];
	comments?: Comment[];
	ingredients?: IngredientInRecipe[];
	instructions?: Instruction[];
	visibility: RecipeVisibility;
};

export type ServerRecipe = {
	uid: string;
	title: string;
	description: string;
	created_at: string; // ISO date string
	updated_at: string; // ISO date string
	notes?: string;
	image?: string;
	author?: User;
	tags?: string[];
	comments?: Comment[];
	ingredients?: IngredientInRecipe[];
	instructions?: string[];
};

export type AuthResponse = {
	user: User;
	access_token: string;
	refresh_token: string;
};

export enum RecipeVisibility {
	Public = 'PUBLIC',
	Friends = 'FRIENDS',
	Private = 'PRIVATE'
}
