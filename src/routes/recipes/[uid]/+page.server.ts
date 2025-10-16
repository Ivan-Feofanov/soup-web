import { serverApi } from '$lib/server/api';
import type { Recipe, ServerRecipe } from '$lib/types';
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ cookies, params }): Promise<{recipe: Recipe}> => {
	try {
		const serverRecipe: ServerRecipe = await serverApi('GET', `/api/kitchen/recipes/${params.uid}`, cookies).then((res) =>
			res.json()
		);
		return {
			recipe: {
				...serverRecipe,
				title: serverRecipe.name,
				createdAt: new Date(serverRecipe.created_at),
				instructions: serverRecipe.instructions?.map((instruction: string, index: number) => ({
					id: index,
					content: instruction
				})),
			}
		};
	} catch (err) {
		console.error(err);
		error(500, 'Failed to fetch recipe')
	}
};
