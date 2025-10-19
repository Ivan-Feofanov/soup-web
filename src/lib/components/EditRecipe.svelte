<script lang="ts">
	import type { Ingredient, Unit } from '$lib/types';
	import { Plus, CircleX, Check, ChevronsUpDown }	 from '@lucide/svelte';
	import { Button } from "$lib/components/ui/button";
	import * as Form from "$lib/components/ui/form";
	import * as Field from "$lib/components/ui/field";
	import * as Select from "$lib/components/ui/select";
	import * as Card from "$lib/components/ui/card";
	import * as Table from "$lib/components/ui/table";
	import * as Command from "$lib/components/ui/command";
	import * as Popover from "$lib/components/ui/popover";
	import { Input } from "$lib/components/ui/input";
	import { Textarea } from "$lib/components/ui/textarea";
	import { tick } from "svelte";
	import { cn } from "$lib/utils.js";
	import Divider from '$lib/components/Divider.svelte';
	import { superForm, type SuperValidated } from 'sveltekit-superforms';
	import type { RecipeSchema } from '$lib/schemes';

	let { recipe, ingredients, units, form: formData }: { recipe: RecipeSchema | null, ingredients: Ingredient[], units: Unit[], form: SuperValidated<RecipeSchema> } = $props();
	const form = superForm(formData, {
		dataType: 'json'
	});
	const { form: formValues, enhance, errors } = form;

	function addInstruction() {
		$formValues.instructions = [...$formValues.instructions, ''];
	}

	function removeInstruction(index: number) {
		$formValues.instructions = $formValues.instructions.filter((_, i) => i !== index);
	}

	const ingredientsForSelection = ingredients.map((ingredient: Ingredient) => ({value: ingredient.uid, label: ingredient.name}))
	const unitsForSelection = units.map((unit: Unit) => ({value: unit.uid, label: unit.name}))
	let selectedIngredientUID = $state("");
	let selectedUnitUID = $state("");

	const selectedIngredientLabel = $derived(
		ingredientsForSelection.find((f) => f.value === selectedIngredientUID)?.label
	);
	const selectedUnitLabel = $derived(
		unitsForSelection.find((f) => f.value === selectedUnitUID)?.label
	)

	let open = $state(false);
	let triggerRef = $state<HTMLButtonElement>(null!);

	let quantity = $state(0);

	let selectedIngredients = $derived($formValues.ingredients || []);

	const addIngredient = () => {
		if (!selectedIngredientUID || !selectedUnitUID) {
			return;
		}
		$formValues.ingredients = [...selectedIngredients, {
			ingredient_uid: selectedIngredientUID,
			unit_uid: selectedUnitUID,
			quantity: quantity
		}]
		selectedIngredientUID = "";
		selectedUnitUID = "";
		quantity = 0;
	}

	const removeIngredient = (ingredientUID: string) => {
		$formValues.ingredients = selectedIngredients.filter(i => i.ingredient_uid !== ingredientUID);
	}

	function closeAndFocusTrigger() {
		open = false;
		tick().then(() => {
			triggerRef.focus();
		});
	}

	const ingredientLabel = (ingredientUID: string): string => {
		const ingredient = ingredients.find(i => i.uid === ingredientUID);
		return ingredient ? ingredient.name : "Unknown Ingredient";
	}

	const unitLabel = (unitUID: string): string => {
		const unit = units.find(u => u.uid === unitUID);
		return unit ? unit.abbreviation || unit.name : "Unknown Unit";
	}

		$effect(() => {
			if ($errors.ingredients && $errors.ingredients[0]) {
				console.log($errors.ingredients);
			}
		})

	type IngredientError = {quantity: string[]};
</script>
{#snippet ingredientError(err: IngredientError)}
	{#each err.quantity as error, index (index)}
		{#if error}
			<div class="text-xs text-destructive">{error}</div>
		{/if}
	{/each}
{/snippet}

<form method="POST" use:enhance class="md:w-2/3 space-y-6">
	<Divider text={recipe?.title ?? 'New Recipe'}/>

	<!-- Title -->
	<Form.Field {form} name="title">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Title</Form.Label>
				<Input {...props} bind:value={$formValues.title} />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<!-- Description -->
	<Form.Field {form} name="description">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Description</Form.Label>
				<Textarea {...props} bind:value={$formValues.description} />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<!-- Notes -->
	<Form.Field {form} name="notes">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Notes (optional)</Form.Label>
				<Textarea {...props} bind:value={$formValues.notes} />
			{/snippet}
		</Form.Control>
	</Form.Field>

	<!-- Instructions -->
	<Divider text="Instructions"/>
	<Field.Group class="gap-4">
		<!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
		{#each $formValues.instructions as _, index (index)}
			<Form.Field {form} name="instructions">
				<Form.Control>
					{#snippet children({ props })}
					<div class="relative">
						<Textarea
							{...props}
							bind:value={$formValues.instructions[index]}
							aria-invalid={$errors.instructions && $errors.instructions[index] ? 'true' : undefined}
						/>
						<Button class="absolute -right-3.5 -top-4" variant="ghost" size="icon" onclick={() => removeInstruction(index)}><CircleX /></Button>
					</div>
					{/snippet}
				</Form.Control>
				{#if $errors.instructions}
					<div class="text-sm text-destructive">
						{$errors.instructions[index]}
					</div>
				{/if}
			</Form.Field>
		{/each}
		<Button onclick={() => addInstruction()} variant="outline"><Plus /></Button>
	</Field.Group>
	<Divider text="Ingredients" class="mt-2"/>

	<!-- Ingredients -->
	{#if selectedIngredients && selectedIngredients.length > 0}
		<Card.Root class="w-full max-w-sm py-0">
			<Card.Content class="p-2">
				<Table.Root class="w-full rounded-xl bg-background">
					<Table.Body class="rounded-xl divide-y divide-border">
						{#each selectedIngredients as ingredient, index (ingredient.ingredient_uid)}
							<Table.Row>
								<Table.Cell class="font-medium w-2/3 pl-4">{ingredientLabel(ingredient.ingredient_uid)}
									{#if $errors.ingredients && $errors.ingredients[index]}
										{@render ingredientError($errors.ingredients[index])}
									{/if}
								</Table.Cell>
								<Table.Cell>{ingredient.quantity} {unitLabel(ingredient.unit_uid)}</Table.Cell>
								<Table.Cell class="text-right"><Button onclick={() => removeIngredient(ingredient.ingredient_uid)} variant="ghost" size="icon"><CircleX /></Button></Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			</Card.Content>
		</Card.Root>
	{/if}
	<Field.Group class="gap-2">
		<Field.Legend variant="label" class="mb-0">Add more:</Field.Legend>
		<Popover.Root bind:open>
			<Popover.Trigger bind:ref={triggerRef}>
				{#snippet child({ props })}
					<Button
						{...props}
						variant="outline"
						class="justify-between"
						role="combobox"
						aria-expanded={open}
					>
						{selectedIngredientLabel || "Select an ingredient..."}
						<ChevronsUpDown class="opacity-50" />
					</Button>
				{/snippet}
			</Popover.Trigger>
			<Popover.Content class="w-[200px] p-0">
				<Command.Root>
					<Command.Input placeholder="Search ingredient..." />
					<Command.List>
						<Command.Empty>No ingredient found.</Command.Empty>
						<Command.Group value="frameworks">
							{#each ingredientsForSelection as ingredient (ingredient.value)}
								<Command.Item
									value={ingredient.label}
									onSelect={() => {
										selectedIngredientUID = ingredient.value;
										closeAndFocusTrigger();
									}}
								>
									<Check
										class={cn(selectedIngredientUID !== ingredient.value && "text-transparent")}
									/>
									{ingredient.label}
								</Command.Item>
							{/each}
						</Command.Group>
					</Command.List>
				</Command.Root>
			</Popover.Content>
		</Popover.Root>
		<div class="grid grid-cols-2 gap-4">
			<Field.Field>
				<Field.Label for="quantity"
				>Qty:</Field.Label
				>
				<Input
					id="quantity"
					placeholder="Enter quantity"
					type="number"
					bind:value={quantity}
					required
				/>
			</Field.Field>
			<Field.Field>
				<Field.Label for="unit">Unit:</Field.Label>
				<Select.Root type="single" bind:value={selectedUnitUID}>
					<Select.Trigger id="unit">
						{selectedUnitLabel}
					</Select.Trigger>
					<Select.Content>
						{#each unitsForSelection as unit (unit.value)}
							<Select.Item {...unit} />
						{/each}
					</Select.Content>
				</Select.Root>
			</Field.Field>
		</div>
		<Button onclick={() => addIngredient()} class="mt-2">Add</Button>
		{#if $errors.ingredients}
			<div class="text-sm text-destructive">
				{$errors.ingredients._errors?.join(', ')}
			</div>
		{/if}

	</Field.Group>

	<Field.Separator />

	<Field.Field orientation="horizontal" class="flex-row-reverse">
		<Button type="submit">Save</Button>
	</Field.Field>
</form>
<!--<SuperDebug data={$formValues} />-->
