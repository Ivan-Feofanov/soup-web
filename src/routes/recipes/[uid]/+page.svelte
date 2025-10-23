<script lang="ts">
	import type { PageProps } from './$types';
	import { resolve } from '$app/paths';
	import { CircleChevronLeft, FilePenLine, Trash2 } from '@lucide/svelte';
	import EditRecipe from './EditRecipe.svelte';
	import RecipeDetails from '$lib/components/RecipeDetails.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
	import { buttonVariants } from "$lib/components/ui/button/index.js";

	let { data }: PageProps = $props();
	let edit = $state(false);
</script>

<section class="mx-auto max-w-5xl space-y-4">
	<div class="flex items-center space-x-2">
		<a
			href={resolve('/')}
			class="flex-1 text-stone-600 transition-colors hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
		>
			<CircleChevronLeft />
		</a>
		{#if data.recipe && data.recipe.author?.uid === data.user?.uid}
			<Button onclick={() => edit = true} variant="outline" size="icon"><FilePenLine /></Button>
			<AlertDialog.Root>
				<AlertDialog.Trigger class={buttonVariants({ variant: "outline", size: "icon" })}>
					<Trash2 />
				</AlertDialog.Trigger>
				<AlertDialog.Content>
					<AlertDialog.Header>
						<AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
						<AlertDialog.Description>
							This action cannot be undone. This will permanently delete recipe from our servers.
						</AlertDialog.Description>
					</AlertDialog.Header>
					<form method="post" action="?/deleteRecipe">
						<AlertDialog.Footer>
							<AlertDialog.Cancel type="button">Cancel</AlertDialog.Cancel>
							<AlertDialog.Action type="submit" class={buttonVariants({ variant: "destructive" })}>Delete</AlertDialog.Action>
						</AlertDialog.Footer>
					</form>
				</AlertDialog.Content>
			</AlertDialog.Root>
		{/if}
	</div>
	{#if !data.recipe || edit}
		<EditRecipe data={data} bind:edit/>
	{:else}
		<RecipeDetails recipe={data.recipe}/>
	{/if}
</section>
