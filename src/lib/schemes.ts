import { z } from 'zod/v4';
import { RecipeVisibility } from '$lib/types';

const IngredientInRecipe = z
	.object({
		ingredient_uid: z.uuid(),
		unit_uid: z.uuid().nullable().optional(),
		quantity: z.number().nullable().optional(),
		notes: z.string().optional()
	})
	.refine(
		(data) => {
			return !((data.quantity && !data.unit_uid) || (!data.quantity && data.unit_uid));
		},
		{
			message: 'If quantity is provided, unit is required and vice versa.',
			path: ['quantity', 'unit_uid'] // Specify the field associated with the error
		}
	);

const Instruction = z.object({
	uid: z.string(),
	step: z.number(),
	description: z.string(),
	timer: z.number().optional()
});
export type InstructionSchema = z.infer<typeof Instruction>;

export const recipeSchema = z.object({
	uid: z.string().readonly(),
	isDraft: z.literal(false).readonly(),
	visibility: z.enum(RecipeVisibility).default(RecipeVisibility.Private),
	title: z
		.string()
		.min(1, 'Title is required')
		.max(100, 'Title is too long')
		.transform((value) => value.trim()),
	description: z
		.string()
		.min(1, 'Description is required')
		.transform((value) => value.trim()),
	notes: z.string().optional(),
	instructions: z
		.array(Instruction)
		.default([{ uid: new Date().getTime().toString(), step: 1, description: '' }])
		.transform((instructions) =>
			instructions
				.filter((inst) => inst.description.trim().length > 0)
				.map((inst, index) => ({ ...inst, step: index + 1 }))
		),
	ingredients: z.array(IngredientInRecipe).min(1, 'At least one ingredient is required'),
	image: z.string().optional(),
	newImage: z
		.instanceof(File)
		.refine((f) => f.size < 10_000_000, 'Max 10 MB upload size.')
		.optional()
});
export type RecipeSchema = z.infer<typeof recipeSchema>;

export const recipeDraftSchema = z.object({
	uid: z.string().readonly(),
	isDraft: z.literal(true).readonly(),
	title: z.string().transform((value) => value.trim()),
	description: z
		.string()
		.transform((value) => value.trim())
		.nullable()
		.optional(),
	notes: z.string().optional(),
	instructions: z
		.array(Instruction)
		.default([{ uid: new Date().getTime().toString(), step: 1, description: '' }])
		.optional(),
	ingredients: z.array(IngredientInRecipe).optional(),
	image: z.string().optional(),
	newImage: z
		.instanceof(File)
		.refine((f) => f.size < 10_000_000, 'Max 10 MB upload size.')
		.optional(),
	visibility: z.enum(RecipeVisibility).default(RecipeVisibility.Private)
});
export type RecipeDraftSchema = z.infer<typeof recipeDraftSchema>;

export const recipeFormSchema = z.discriminatedUnion('isDraft', [recipeSchema, recipeDraftSchema]);

export const ingredientSchema = z.object({ name: z.string().min(1, 'Name is required') });
export type IngredientSchema = z.infer<typeof ingredientSchema>;

export const unitSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	abbreviation: z.string().min(1, 'Abbreviation is required')
});
export type UnitSchema = z.infer<typeof unitSchema>;

export const userSchema = z.object({
	uid: z.string(),
	handler: z.string().min(1, 'Handler is required'),
	username: z.string().min(1, 'Username is required'),
	firstTime: z.coerce.boolean()
});
