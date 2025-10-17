<script lang="ts">
	import type { PageProps } from './$types';
	import { resolve } from '$app/paths';
	import { CircleChevronLeft } from '@lucide/svelte';
	import EditRecipe from './EditRecipe.svelte';
	import RecipeDetails from '$lib/components/RecipeDetails.svelte';
	let { data }: PageProps = $props();
</script>

<section class="mx-auto max-w-5xl">
	<div class="flex items-center">
		<a
			href={resolve('/')}
			class="text-stone-600 transition-colors hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
		>
			<CircleChevronLeft />
		</a>
	</div>

	{#if !data.recipe}
		<EditRecipe recipe={data.recipe} ingredients={data.ingredients} units={data.units} form={data.form}/>
	{:else}
		<RecipeDetails recipe={data.recipe}/>
	{/if}
</section>
