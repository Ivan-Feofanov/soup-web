export type Comment = {
	id: string;
	content: string;
	createdAt: string; // ISO date string
	author?: string;
};

export type Ingredient = {
	uid: string;
	name: string;
}

export type IngredientInRecipe = {
	uid: string;
	ingredient: Ingredient;
	unit: Unit;
	quantity: number;
	notes?: string;
}

export type Unit = {
	uid: string;
	name: string;
	abbreviation?: string;
}

export type Instruction = {
	id: number;
	content: string;
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
	author?: User;
	tags?: string[];
	comments?: Comment[];
	ingredients?: IngredientInRecipe[];
	instructions?: Instruction[];
};

export type ServerRecipe = {
	uid: string;
	title: string;
	description: string;
	created_at: string; // ISO date string
	author?: User;
	tags?: string[];
	comments?: Comment[];
	ingredients?: IngredientInRecipe[];
	instructions?: string[];
};


export type ErrorResponse = { detail: string, code: string };
export type ValidationErrorResponse = { message: string, errors: Record<string, string[]> };

