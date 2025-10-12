import type { Recipe, ServerRecipe, ServerUser } from '$lib/types';
import type { LayoutServerLoad } from './$types';
import { getGoogleAuthUrl } from '$lib/auth';
import { serverApi } from '$lib/server/api';

export const load: LayoutServerLoad = async ({
	cookies
}): Promise<{ user: ServerUser | null; allRecipes: Recipe[]; authURL: string | null }> => {
	const refreshToken = cookies.get('refresh_token');
	if (!refreshToken) {
		// Если refresh токена нет, пользователь точно не залогинен
		const authURL = getGoogleAuthUrl();
		return { user: null, allRecipes: [], authURL };
	}
	try {
		const userResponse = await serverApi('GET', `/api/auth/me/`, cookies);
		if (!userResponse.ok) {
			return { user: null, allRecipes: [], authURL: null };
		}
		const serverUser: ServerUser = await userResponse.json();
		const user = {
			uid: serverUser.uid,
			email: serverUser.email,
			firstName: serverUser.first_name,
			lastName: serverUser.last_name
		};

		const serverRecipes = await serverApi('GET', `/api/kitchen/recipes/`, cookies).then((res) =>
			res.json()
		);
		return {
			user,
			authURL: null,
			allRecipes: serverRecipes.map(
				(recipe: ServerRecipe) =>
					({
						...recipe,
						title: recipe.name,
						createdAt: new Date(recipe.created_at),
						instructions: recipe.instructions?.map((instruction: string, index: number) => ({
							id: index,
							content: instruction
						})),
						author: {
							uid: recipe.author?.uid,
							email: recipe.author?.email,
							firstName: recipe.author?.first_name,
							lastName: recipe.author?.last_name
						}
					}) as Recipe
			)
		};
	} catch (error) {
		console.error(error);
		return {
			user: null,
			allRecipes: [],
			authURL: null
		};
	}
};
