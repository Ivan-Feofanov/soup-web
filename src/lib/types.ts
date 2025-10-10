export type Comment = {
	id: string;
	content: string;
	createdAt: string; // ISO date string
	author?: string;
};

export type Ingredient = {
	id: string;
	name: string;
	quantity: number;
	unit: string;
};

export type Instruction = {
	id: string;
	content: string;
	timer?: number; // in minutes
};

export type Recipe = {
	id: string;
	title: string;
	description: string;
	createdAt: string; // ISO date string
	author?: string;
	tags?: string[];
	comments?: Comment[];
	ingredients?: Ingredient[];
	instructions?: Instruction[];
};
