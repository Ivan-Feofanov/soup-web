export type Comment = {
	id: string;
	content: string;
	createdAt: string; // ISO date string
	author?: string;
};

export type Ingredient = {
	uid: string;
	name: string;
	quantity: number;
	unit: string;
};

export type Instruction = {
	id: string;
	content: string;
	timer?: number; // in minutes
};

export type Author = {
	uid: string;
	firstName: string;
	lastName: string;
	email: string;
};

export type ServerAuthor = {
	uid: string;
	first_name: string;
	last_name: string;
	email: string;
};

export type Recipe = {
	uid: string;
	title: string;
	description: string;
	createdAt: string; // ISO date string
	author?: string;
	tags?: string[];
	comments?: Comment[];
	ingredients?: Ingredient[];
	instructions?: Instruction[];
};

export type ServerRecipe = {
	uid: string;
	name: string;
	description: string;
	created_at: string; // ISO date string
	author?: ServerAuthor;
	tags?: string[];
	comments?: Comment[];
	ingredients?: Ingredient[];
	instructions?: string[];
};
