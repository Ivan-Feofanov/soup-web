<script lang="ts">
	import { resolve } from '$app/paths';
	import type { PageData } from './$types';
	import { Button } from '$lib/components/ui/button';
	import { Image } from '@unpic/svelte';
	import { buildCloudinaryUrl } from '$lib/cloudinary';
	import { format } from 'date-fns';

	export let data: PageData;

	const recentRecipes = data.recipes;
</script>

<section class="mx-auto max-w-5xl space-y-4">
	<!-- new recipe button -->
	{#if data.user}
		<div class="flex justify-end">
			<Button href={resolve('/recipes/new')} variant="outline">New Recipe</Button>
		</div>
	{/if}
	<div class="grid grid-cols-1 gap-4">
		{#each recentRecipes as r (r.uid)}
			<a href={resolve(`/recipes/${r.uid}`)}>
				<article
					class="flex flex-col rounded-xl border border-stone-200/60 bg-white/60 p-4 backdrop-blur dark:border-stone-700/60 dark:bg-stone-900/40"
				>
					<div class="flex flex-1 flex-row space-x-2">
						<div class="flex-1 space-y-1">
							<h2 class="text-lg leading-snug font-semibold">
								<span class="cursor-default hover:underline">{r.title}</span>
							</h2>
							<p class="line-clamp-3 text-sm text-stone-600 dark:text-stone-300">{r.description}</p>
						</div>
						<div class="flex-none">
							{#if r.image}
								<Image
									src={buildCloudinaryUrl(r.image, { width: 100, height: 100, crop: 'thumb' })}
									alt={r.title}
									width={100}
									height={100}
									class="rounded-lg"
								/>
							{/if}
						</div>
					</div>
					<footer class="mt-3 flex items-center justify-between text-xs text-stone-500">
						<span>{r.author?.username ?? 'Anonymous'}</span>
						<time>{format(r.updatedAt, 'HH:mm dd.MM.yyyy')}</time>
					</footer>
					{#if r.tags?.length}
						<ul class="mt-3 flex flex-wrap gap-2">
							{#each r.tags as t (t)}
								<li
									class="rounded bg-stone-100 px-2 py-1 text-[10px] tracking-wide text-stone-700 uppercase dark:bg-stone-800 dark:text-stone-300"
								>
									{t}
								</li>
							{/each}
						</ul>
					{/if}
				</article>
			</a>
		{/each}
	</div>
</section>
