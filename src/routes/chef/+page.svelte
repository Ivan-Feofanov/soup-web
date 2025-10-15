<script lang="ts">
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	const firstTime = $derived(data.user?.handler === undefined && data.user?.username === undefined);
	const handlerError = $derived(form?.errors && form.errors.handler);
</script>

<section>
	<form method="POST" action="?/update" class="flex justify-center">
		<input type="hidden" name="uid" value={data.user?.uid}>
		<input type="hidden" name="firstTime" value={firstTime}>
		<fieldset class="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
			<legend class="fieldset-legend">User details for {data.user?.handler ? `@${data.user?.handler}` : data.user?.email}</legend>
			{#if !data.user?.handler}
				<label class="label" for="handler">Handler {#if form?.errors && form.errors.handler}<span class="text-error">this handler is already taken</span>{/if}</label>
				<input name="handler" type="text" class="input {handlerError ? 'input-error' : ''}" placeholder="My awesome handler" value={form?.handler || data.user?.handler} />
				<p class="label">Handler should be unique and can't be edited later.</p>
			{/if}
			<label class="label" for="username">Username</label>
			<input name="username" type="text" class="input" placeholder="My awesome username" value={data.user?.username} />
			{#if !data.user?.username}
				<p class="label">You can choose any username and freely change it later.</p>
			{/if}
			<button type="submit" class="btn btn-soft">Save!</button>
		</fieldset>
	</form>
</section>
