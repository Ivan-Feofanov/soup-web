<script lang="ts">
	import type { Ingredient, IngredientInRecipe, Recipe, Unit } from '$lib/types';
	import { Plus, CircleX, Check, ChevronsUpDown }	 from '@lucide/svelte';
	import { Button } from "$lib/components/ui/button/index.js";
	import * as Field from "$lib/components/ui/field/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import * as Card from "$lib/components/ui/card/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import { tick } from "svelte";
	import * as Command from "$lib/components/ui/command/index.js";
	import * as Popover from "$lib/components/ui/popover/index.js";
	import { cn } from "$lib/utils.js";
	import Divider from '$lib/components/Divider.svelte';

	let { recipe, ingredients, units }: {recipe: Recipe | null, ingredients: Ingredient[], units: Unit[]} = $props();

	type InstructionItem = {
		id: number;
		content: string;
	};
	let nextId = $state(0);
	let instructions = $state<InstructionItem[]>([{ id: nextId++, content: '' }]);
	const removeInstruction = (id: number) => {
		instructions = instructions.filter(inst => inst.id !== id);
	}

	const addInstruction = () => {
		instructions.push({ id: nextId++, content: '' });
	}

	const ingredientsForSelection = ingredients.map((ingredient) => ({value: ingredient.uid, label: ingredient.name}))
	const unitsForSelection = units.map((unit) => ({value: unit.uid, label: unit.name}))
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

	let ingredientsForRecipe = $state<IngredientInRecipe[]>([]);
	let quantity = $state(0);

	const addIngredient = () => {
		if (!selectedIngredientUID || !selectedUnitUID) {
			return;
		}
		ingredientsForRecipe.push({
			ingredient_uid: selectedIngredientUID,
			unit_uid: selectedUnitUID,
			quantity: quantity,
		});
		selectedIngredientUID = "";
		selectedUnitUID = "";
		quantity = 0;
	}

	ingredientsForRecipe.push({
		ingredient_uid: ingredients[0].uid,
		unit_uid: units[0].uid,
		quantity: 100,
	})
	ingredientsForRecipe.push({
		ingredient_uid: ingredients[1].uid,
		unit_uid: units[1].uid,
		quantity: 10,
	})

	// We want to refocus the trigger button when the user selects
	// an item from the list so users can continue navigating the
	// rest of the form with the keyboard.
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

</script>
<form>
	<Divider text={recipe?.title ?? 'New Recipe'}/>
	<Field.Group>
		<Field.Set>
			<Field.Group>
				<Field.Field>
					<Field.Label for="title"
					>Title</Field.Label
					>
					<Input
						id="title"
						placeholder="Recipe title"
						required
					/>
				</Field.Field>
				<Field.Field>
					<Field.Label for="description"
					>Description</Field.Label
					>
					<Textarea
						id="description"
						placeholder="Write a bit about this dish"
						class="resize-none"
					/>
				</Field.Field>
				<Field.Field>
					<Field.Label for="notes"
					>Notes (optional)</Field.Label
					>
					<Textarea
						id="notes"
						placeholder="Write a useful notes about recipe (not instructions)"
						class="resize-none"
					/>
				</Field.Field>
			</Field.Group>
			<Field.Separator />
			<Field.Group>
				<Divider text="Instructions"/>
				{#each instructions as instruction (instruction.id)}
					<div class="relative">
						<Textarea
							name="instructions"
							placeholder="Find and kill a mammoth..."
							class="resize-none"
						>{instruction.content}</Textarea>
						<Button class="absolute -right-3.5 -top-4" variant="ghost" size="icon" onclick={() => removeInstruction(instruction.id)}><CircleX /></Button>
					</div>
				{/each}
				<Button onclick={() => addInstruction()} variant="outline"><Plus /></Button>
			</Field.Group>
		</Field.Set>
		<Divider text="Ingredients"/>
		<Field.Set>
			<Card.Root class="w-full max-w-sm">
				<Card.Header>
					<Card.Title>Selected ingerdients:</Card.Title>
				</Card.Header>
				<Card.Content>
					<ul>
						{#each ingredientsForRecipe as ingredient (ingredient.ingredient_uid)}
							<li>{ingredientLabel(ingredient.ingredient_uid)}: {ingredient.quantity} {unitLabel(ingredient.unit_uid)}</li>
						{/each}
					</ul>
				</Card.Content>
			</Card.Root>
			<Field.Group>
				<Field.Legend variant="label">Add more:</Field.Legend>
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
											value={ingredient.value}
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
			</Field.Group>
			<Button onclick={() => addIngredient()}>Add</Button>
		</Field.Set>
		<Field.Separator />
		<Field.Field orientation="horizontal">
			<Button type="submit">Save</Button>
		</Field.Field>
	</Field.Group>
</form>
