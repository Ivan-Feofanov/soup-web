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
	notes?: string;
};

export type Instruction = {
	id: number;
	content: string;
	timer?: number; // in minutes
};

export type User = {
	uid: string;
	firstName?: string;
	lastName?: string;
	email: string;
};

export type ServerUser = {
	uid: string;
	first_name?: string;
	last_name?: string;
	email: string;
};

export type Recipe = {
	uid: string;
	title: string;
	description: string;
	createdAt: Date;
	author?: User;
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
	author?: ServerUser;
	tags?: string[];
	comments?: Comment[];
	ingredients?: Ingredient[];
	instructions?: string[];
};
