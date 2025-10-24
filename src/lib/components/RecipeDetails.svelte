<script lang="ts">
	import Divider from '$lib/components/Divider.svelte';
	import type { Recipe } from '$lib/types';

	const { recipe }: {recipe: Recipe} = $props();
</script>
<article class="space-y-4">
	<header class="space-y-3">
		<!-- Back link -->
		<h1 class="text-3xl font-extrabold tracking-tight md:text-4xl">
			{recipe?.title}
		</h1>
		<p class="text-base text-stone-600 dark:text-stone-300">
			{recipe?.description}
		</p>
		{#if recipe?.notes}
			<Divider text="Notes" />
			<p class="text-base text-stone-600 dark:text-stone-300">
				{recipe?.notes}
			</p>
		{/if}
		{#if recipe?.tags?.length}
			<ul class="flex flex-wrap gap-2">
				{#each recipe.tags as tag (tag)}
					<li
						class="rounded bg-stone-100 px-2 py-1 text-[10px] tracking-wide text-stone-700 uppercase dark:bg-stone-800 dark:text-stone-300"
					>
						{tag}
					</li>
				{/each}
			</ul>
		{/if}
	</header>

	<section>
		<Divider text="Ingredients" />
		<ul class="mt-2 space-y-2">
			{#each (recipe?.ingredients ?? []) as ingredient (ingredient.uid)}
				<li class="grid grid-cols-1 gap-2">
					<div class="flex items-center gap-2 text-lg">
						<span class="font-medium">{ingredient.ingredient.name}</span>
						{#if ingredient.quantity && ingredient.unit}
							<span class=" text-stone-600 dark:text-stone-200"> — {ingredient.quantity} {ingredient.unit.abbreviation}</span>
						{/if}
					</div>
					{#if ingredient.notes}
						<div class="-mt-2 text-xs dark:text-stone-400 text-stone-600">{ingredient.notes}</div>
					{/if}
				</li>
			{/each}
		</ul>
	</section>

	<section>
		<Divider text="Instructions" />
		<ul class="mt-2 list-inside list-decimal space-y-2 marker:text-stone-600 dark:marker:text-stone-200">
			{#each (recipe?.instructions ?? []) as instruction (instruction.id)}
				<li class="gap-2">
					<span class=" text-stone-600 dark:text-stone-200">{instruction.content}</span>
				</li>
			{/each}
		</ul>
	</section>

	{#if recipe?.author}
		<footer class="text-sm text-stone-500 dark:text-stone-400 my-4">
			<span>{recipe.author.username}</span>
		</footer>
	{/if}
</article>
