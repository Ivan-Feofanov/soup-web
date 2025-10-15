import { serverApi } from '$lib/server/api';
import type { ServerRecipe } from '$lib/types';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies, params }) => {
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
	} catch (error) {
		console.error(error);
		return {
			error
		};
	}
};
