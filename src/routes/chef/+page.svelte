<script lang="ts">
	import type { PageProps } from './$types';
	import { superForm } from 'sveltekit-superforms';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import Divider from '$lib/components/Divider.svelte';
	import { Button } from '$lib/components/ui/button';
	import Spinner from '$lib/assets/spinner.svelte';

	let { data }: PageProps = $props();
	const form = superForm(data.form, {
		resetForm: false
	});
	const { form: formValues, enhance, submitting } = form;
	// Derived from data.user because it will change after form submitted and form - will not
	const hasHandler = $derived(!!data.user?.handler);
	const firstTime = $derived(!data.user?.handler && !data.user?.username);
</script>

<section class="mx-auto space-y-6 rounded-lg max-sm:mt-8 sm:w-1/3 sm:border sm:p-6">
	<h1 class="text-3xl font-extrabold tracking-tight">Chef's Settings</h1>
	<Divider text={hasHandler ? `@${data.user?.handler}` : 'Profile'} />
	<form method="POST" action="?/update" class="space-y-6" use:enhance>
		<input type="hidden" name="uid" value={$formValues.uid} />
		<input type="hidden" name="firstTime" value={firstTime} />

		<!-- Handler -->
		{#if hasHandler}
			<input type="hidden" name="handler" value={$formValues.handler} />
		{:else}
			<Form.Field {form} name="handler" class="w-full max-w-xs">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Handler</Form.Label>
						<Input {...props} bind:value={$formValues.handler} />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
		{/if}
		<!-- Username -->
		<Form.Field {form} name="username" class="w-full max-w-xs">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Username</Form.Label>
					<Input {...props} bind:value={$formValues.username} />
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
		<div class="flex flex-col-reverse gap-2 text-base sm:flex-row sm:justify-end">
			<Button type="submit" class="sm:w-18">
				{#if $submitting}
					<Spinner class="size-9" />
				{:else}
					Save
				{/if}
			</Button>
		</div>
	</form>
</section>
