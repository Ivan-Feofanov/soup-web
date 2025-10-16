<script lang="ts">
	import type { PageProps } from './$types';
	import { resolve } from '$app/paths';
	import { CircleChevronLeft } from '@lucide/svelte';
	import Divider from '$lib/components/Divider.svelte';
	let { data }: PageProps = $props();
</script>

<section class="mx-auto max-w-5xl space-y-6">
	<!-- Recipe details -->
	<div class="flex items-center">
		<a
			href={resolve('/')}
			class="text-stone-600 transition-colors hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
		>
			<CircleChevronLeft />
		</a>
	</div>
	<article class="space-y-4">
		<header class="space-y-3">
			<!-- Back link -->
			<h1 class="text-3xl font-extrabold tracking-tight md:text-4xl">
				{data.recipe?.title}
			</h1>
			<p class="text-base text-stone-600 dark:text-stone-300">
				{data.recipe?.description}
			</p>
			{#if data.recipe?.notes}
				<Divider text="Notes" />
				<p class="text-base text-stone-600 dark:text-stone-300">
					{data.recipe?.notes}
				</p>
			{/if}
			{#if data.recipe?.tags?.length}
				<ul class="flex flex-wrap gap-2">
					{#each data.recipe.tags as tag (tag)}
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
				{#each (data.recipe?.ingredients ?? []) as ingredient (ingredient.uid)}
					<li class="grid grid-cols-1 gap-2">
						<div class="flex items-center gap-2 text-lg">
							<span class="font-medium">{ingredient.name}</span>
							{#if ingredient.quantity && ingredient.unit}
								<span class=" text-stone-200"> — {ingredient.quantity} {ingredient.unit}</span>
							{/if}
						</div>
						{#if ingredient.notes}
							<div class="-mt-2 text-xs text-stone-400">{ingredient.notes}</div>
						{/if}
					</li>
				{/each}
			</ul>
		</section>

		<section>
			<Divider text="Instructions" />
			<ul class="mt-2 list-inside list-decimal space-y-2 marker:text-stone-200">
				{#each (data.recipe?.instructions ?? []) as instruction (instruction.id)}
					<li class="gap-2">
						<span class=" text-stone-200">{instruction.content}</span>
					</li>
				{/each}
			</ul>
		</section>

		{#if data.recipe?.author}
			<footer class="text-sm text-stone-500">
				<span>Author: {data.recipe.author.username}</span>
			</footer>
		{/if}
	</article>

	<!-- Comments section -->
	<section
		class="space-y-4 rounded-xl border border-stone-200/60 bg-white/60 p-6 backdrop-blur md:p-8 dark:border-stone-700/60 dark:bg-stone-900/40"
	>
		<h2 class="text-2xl font-bold tracking-tight">Comments</h2>

		{#if data.recipe?.comments?.length && data.recipe?.comments?.length > 0}
			<ul class="space-y-4">
				{#each data.recipe?.comments as comment (comment.id)}
					<li
						class="rounded-lg border border-stone-200/60 bg-stone-50/50 p-4 dark:border-stone-700/40 dark:bg-stone-800/30"
					>
						<strong class="block text-sm font-semibold text-stone-900 dark:text-stone-100">
							{comment.author}
						</strong>
						<p class="mt-2 text-sm text-stone-600 dark:text-stone-300">
							{comment.content}
						</p>
					</li>
				{/each}
			</ul>
		{:else}
			<p class="text-sm text-stone-600 dark:text-stone-300">
				Комментариев пока нет. Будьте первым!
			</p>
		{/if}
	</section>
</section>
