import { z } from 'zod/v4';

const IngredientInRecipe = z.object({
	ingredient_uid: z.uuid(),
	unit_uid: z.uuid(),
	quantity: z.number().min(1).optional(),
	notes: z.string().optional(),
});

export const recipeSchema = z.object({
	title: z.string().min(1, 'Title is required').transform((value) => value.trim()),
	description: z.string().min(1, 'Description is required').transform((value) => value.trim()),
	notes: z.string().optional(),
	instructions: z.array(z.string().min(1, 'Instruction cannot be empty')).default(['']),
	ingredients: z.array(IngredientInRecipe).optional(),
	image: z.string().optional(),
});

export type RecipeSchema = z.infer<typeof recipeSchema>;
