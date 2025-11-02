<script lang="ts">
	import { type Ingredient, type Instruction, RecipeVisibility, type Unit } from '$lib/types';
	import Spinner from '$lib/assets/spinner.svelte';
	import {
		type DndEvent,
		dndzone,
		overrideItemIdKeyNameBeforeInitialisingDndZones
	} from 'svelte-dnd-action';
	import { flip } from 'svelte/animate';
	import Plus from '@lucide/svelte/icons/plus';
	import CircleX from '@lucide/svelte/icons/circle-x';
	import Check from '@lucide/svelte/icons/check';
	import ChevronsUpDown from '@lucide/svelte/icons/chevrons-up-down';
	import GripVertical from '@lucide/svelte/icons/grip-vertical';
	import ImageUp from '@lucide/svelte/icons/image-up';
	import Loader2 from '@lucide/svelte/icons/loader-2';
	import AlertCircle from '@lucide/svelte/icons/alert-circle';
	import * as Form from '$lib/components/ui/form';
	import * as Field from '$lib/components/ui/field';
	import * as Select from '$lib/components/ui/select';
	import * as Card from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	import * as Command from '$lib/components/ui/command';
	import * as Popover from '$lib/components/ui/popover';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as ToggleGroup from '$lib/components/ui/toggle-group';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { tick } from 'svelte';
	import { cn } from '$lib/utils';
	import Divider from '$lib/components/Divider.svelte';
	import SuperDebug, { superForm, fileProxy } from 'sveltekit-superforms';
	import type { PageData } from './$types';
	import { Image } from '@unpic/svelte';
	import { buildCloudinaryUrl } from '$lib/cloudinary';
	import { toast } from 'svelte-sonner';
	import { createDraftSaver, DEBOUNCE_TIMES } from '$lib/utils/draftSaver.svelte.js';

	let { data, edit = $bindable() }: { data: PageData; edit?: boolean } = $props();
	let {
		ingredients,
		units,
		form: formData,
		ingredientAddForm: ingredientAddFormData,
		unitAddForm: unitAddFormData
	} = data;
	let ingredientsList = $state(ingredients);
	let unitsList = $state(units);
	const ingredientsForSelection = $derived(
		ingredientsList.map((ingredient: Ingredient) => ({
			value: ingredient.uid,
			label: ingredient.name
		}))
	);
	const unitsForSelection = $derived(
		unitsList.map((unit: Unit) => ({ value: unit.uid, label: unit.name }))
	);

	const form = superForm(formData, {
		dataType: 'json',
		resetForm: false,
		invalidateAll: false,
		onResult: ({ result }) => {
			if (result.type === 'success' || result.type === 'redirect') {
				edit = false;
			}
		}
	});
	const file = fileProxy(form, 'newImage');

	const ingredientForm = superForm(ingredientAddFormData, {
		dataType: 'json',
		resetForm: false,
		invalidateAll: false,
		onResult: ({ result }) => {
			if (result.type === 'success' && result.data?.success) {
				addIngredientDialogOpen = false;
				ingredientSearch = '';
				selectedIngredientUID = result.data.ingredient.uid;
				closeIngredientSelect();
				if (result.data.created) {
					ingredientsList = [...ingredientsList, result.data.ingredient];
				}
			}
		}
	});

	const unitForm = superForm(unitAddFormData, {
		dataType: 'json',
		invalidateAll: false,
		onResult: ({ result }) => {
			if (result.type === 'success' && result.data?.success) {
				addUnitDialogOpen = false;
				selectedUnitUID = result.data.unit.uid;
				closeUnitSelect();
				if (result.data.created) {
					unitsList = [...unitsList, result.data.unit];
				}
			}
		}
	});

	const { form: formValues, enhance, errors, submitting } = form;
	const { form: ingredientFormValues, enhance: ingredientEnhance } = ingredientForm;
	const { form: unitFormValues, enhance: unitEnhance } = unitForm;

	// Track if this is an explicit save (not auto-save)
	let isExplicitSave = $state(false);
	const shouldBlockUI = $derived($submitting && isExplicitSave);

	// Smart draft saver with toast notifications
	const draftSaver = createDraftSaver({
		onSave: async () => {
			if (!$formValues.isDraft) return;

			// Make direct API call to autosave endpoint to avoid losing focus
			const response = await fetch(`/recipes/${$formValues.uid}/autosave`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify($formValues)
			});

			if (!response.ok) {
				throw new Error('Failed to save draft');
			}
		},
		onSuccess: () => {
			toast.success('Draft saved', {
				duration: 2000
			});
		},
		onError: (error) => {
			console.error('Draft save failed:', error);
			toast.error('Failed to save draft', {
				description: 'Your changes are still in the form. Try again.',
				duration: 5000,
				action: {
					label: 'Retry',
					onClick: () => draftSaver.triggerSave(0)
				}
			});
		}
	});

	// Auto-save helper for drafts
	const autoSaveDraft = (debounceMs?: number) => {
		if (!$formValues.isDraft) return;
		draftSaver.triggerSave(debounceMs);
	};

	// Image handling with immediate upload
	let imageInput = $state<HTMLInputElement>(null!);
	let imageSrc = $state('');
	let isUploadingImage = $state(false);

	const onChange = async () => {
		if (!imageInput.files || !$formValues.isDraft) return;
		const file = imageInput.files[0];
		if (!file) return;

		// Show preview immediately
		const reader = new FileReader();
		reader.addEventListener('load', function () {
			imageSrc = reader.result as string;
		});
		reader.readAsDataURL(file);

		// Upload image immediately in background
		isUploadingImage = true;
		try {
			const formData = new FormData();
			formData.append('draftUid', $formValues.uid);
			formData.append('image', file);

			const response = await fetch('?/uploadDraftImage', {
				method: 'POST',
				body: formData
			});

			if (!response.ok) {
				throw new Error('Upload failed');
			}

			const result = await response.json();

			// SvelteKit form action response structure
			if (result.type === 'success') {
				// Parse the devalue serialized data
				const data = typeof result.data === 'string' ? JSON.parse(result.data) : result.data;

				// Handle devalue array format: [mapping, values...]
				let imageUrl;
				if (Array.isArray(data)) {
					// Devalue format: [{"success":1,"imageUrl":2}, true, "url"]
					imageUrl = data[2]; // The actual URL is at index 2
				} else if (data?.imageUrl) {
					// Regular object format
					imageUrl = data.imageUrl;
				}

				if (imageUrl) {
					$formValues.image = imageUrl;
					toast.success('Image uploaded');
				} else {
					throw new Error('No image URL in response');
				}
			} else if (result.type === 'failure') {
				throw new Error(result.data?.error || 'Upload failed');
			} else {
				console.error('Unexpected response:', result);
				throw new Error('Unexpected response format');
			}
		} catch (error) {
			console.error('Image upload failed:', error);
			toast.error('Failed to upload image', {
				description: 'The image will be uploaded when you publish.',
				duration: 5000
			});
		} finally {
			isUploadingImage = false;
		}
	};

	// Instructions
	overrideItemIdKeyNameBeforeInitialisingDndZones('uid');
	function handleDndConsider(e: CustomEvent<DndEvent<Instruction>>) {
		$formValues.instructions = e.detail.items.map((item, index) => ({ ...item, step: index + 1 }));
	}
	function handleDndFinalize(e: CustomEvent<DndEvent<Instruction>>) {
		$formValues.instructions = e.detail.items.map((item, index) => ({ ...item, step: index + 1 }));
		// Save after reordering with REORDER debounce time
		autoSaveDraft(DEBOUNCE_TIMES.REORDER);
	}

	function addInstruction() {
		$formValues.instructions = [
			...($formValues.instructions || []),
			{
				uid: Date.now().toString(),
				step: $formValues.instructions?.length || 1,
				description: ''
			}
		];
	}
	function removeInstruction(idToRemove: string) {
		$formValues.instructions = $formValues.instructions?.filter(
			(instr) => instr.uid !== idToRemove
		);
		autoSaveDraft(DEBOUNCE_TIMES.STRUCTURAL);
	}

	// Ingredients
	let addIngredientDialogOpen = $state(false);
	let ingredientSelectOpen = $state(false);
	let ingredientSearch = $state('');
	let triggerRef = $state<HTMLButtonElement>(null!);
	let selectedIngredients = $derived($formValues.ingredients || []);
	let selectedIngredientUID = $state('');
	let quantity = $state<number | undefined>();
	let selectedUnitUID = $state<string | undefined>();

	const openIngredientAddForm = () => {
		$ingredientFormValues.name = ingredientSearch;
	};

	const selectedIngredientLabel = $derived(
		ingredientsForSelection.find((f) => f.value === selectedIngredientUID)?.label
	);
	const selectedUnitLabel = $derived(
		unitsForSelection.find((f) => f.value === selectedUnitUID)?.label
	);

	const addIngredient = () => {
		if (!selectedIngredientUID) {
			return;
		}
		$formValues.ingredients = [
			...selectedIngredients,
			{
				ingredient_uid: selectedIngredientUID,
				unit_uid: selectedUnitUID || undefined,
				quantity: quantity || undefined
			}
		];
		ingredientSearch = '';
		selectedIngredientUID = '';
		selectedUnitUID = undefined;
		quantity = undefined;
		autoSaveDraft(DEBOUNCE_TIMES.STRUCTURAL);
	};

	const removeIngredient = (ingredientUID: string) => {
		$formValues.ingredients = selectedIngredients.filter((i) => i.ingredient_uid !== ingredientUID);
		autoSaveDraft(DEBOUNCE_TIMES.STRUCTURAL);
	};

	const closeIngredientSelect = () => {
		ingredientSelectOpen = false;
		tick().then(() => {
			triggerRef.focus();
		});
	};

	const ingredientLabel = (ingredientUID: string): string => {
		const ingredient = ingredientsList.find((i) => i.uid === ingredientUID);
		return ingredient ? ingredient.name : 'Unknown Ingredient';
	};

	type IngredientInRecipeError = {
		quantity?: string[] | { _errors?: string[] };
	};

	$effect(() => {
		if (!quantity) {
			selectedUnitUID = undefined;
		}
	});

	const addIngDisabled = $derived<boolean>(
		!selectedIngredientUID || !!(!quantity && selectedUnitUID) || !!(quantity && !selectedUnitUID)
	);

	// Units
	let unitSelectOpen = $state(false);
	let addUnitDialogOpen = $state(false);
	const unitLabel = (unitUID: string | null | undefined): string => {
		if (!unitUID) {
			return '';
		}
		const unit = unitsList.find((u) => u.uid === unitUID);
		return unit ? unit.abbreviation || unit.name : '';
	};
	const closeUnitSelect = () => {
		unitSelectOpen = false;
		tick().then(() => {
			triggerRef.focus();
		});
	};

	function preventDefault(fn: (event: Event) => void) {
		return function (this: HTMLElement, event: Event) {
			event.preventDefault();
			fn.call(this, event);
		};
	}
</script>

{#snippet ingredientInRecipeError(err: IngredientInRecipeError)}
	{#if err.quantity}
		{@const errors = Array.isArray(err.quantity) ? err.quantity : err.quantity._errors}
		{#if errors}
			{#each errors as error, index (index)}
				<div class="text-xs text-destructive">{error}</div>
			{/each}
		{/if}
	{/if}
{/snippet}
<svelte:head>
	<title>{(data.recipe && `Edit ${data.recipe.title}`) || 'New recipe'}</title>
</svelte:head>
<form
	method="POST"
	enctype="multipart/form-data"
	action="?/saveRecipe"
	class="relative mx-auto space-y-6 rounded-lg max-sm:mt-8 sm:w-2/3 sm:border sm:p-6"
	class:opacity-60={shouldBlockUI}
	class:pointer-events-none={shouldBlockUI}
	use:enhance
>
	<input type="hidden" name="uid" value={$formValues.uid} />
	<!-- Visibility -->
	<Form.Field {form} name="visibility">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Visibility</Form.Label>
				<ToggleGroup.Root
					{...props}
					type="single"
					variant="outline"
					class="w-full"
					bind:value={$formValues.visibility}
					onValueChange={() => autoSaveDraft(DEBOUNCE_TIMES.TOGGLE)}
				>
					<ToggleGroup.Item value={RecipeVisibility.Private} aria-label="Toggle private"
						>Private</ToggleGroup.Item
					>
					<ToggleGroup.Item value={RecipeVisibility.Public} aria-label="Toggle public"
						>Public</ToggleGroup.Item
					>
				</ToggleGroup.Root>
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<!-- Title -->
	<Form.Field {form} name="title">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Title</Form.Label>
				<Input
					{...props}
					bind:value={$formValues.title}
					oninput={() => autoSaveDraft(DEBOUNCE_TIMES.TEXT_FIELD)}
				/>
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<!-- Description -->
	<Form.Field {form} name="description">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Description</Form.Label>
				<Textarea
					{...props}
					bind:value={$formValues.description}
					oninput={() => autoSaveDraft(DEBOUNCE_TIMES.TEXT_FIELD)}
				/>
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<!-- Notes -->
	<Form.Field {form} name="notes">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Notes (optional)</Form.Label>
				<Textarea
					{...props}
					bind:value={$formValues.notes}
					oninput={() => autoSaveDraft(DEBOUNCE_TIMES.TEXT_FIELD)}
				/>
			{/snippet}
		</Form.Control>
	</Form.Field>

	<!-- Image -->
	<Form.Field {form} name="newImage" class="space-y-2">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Image</Form.Label>
				<input
					{...props}
					type="file"
					hidden
					accept="image/png, image/jpeg, image/webp, image/avif"
					bind:files={$file}
					bind:this={imageInput}
					onchange={onChange}
				/>
				{#if !$formValues.newImage && !$formValues.image}
					<button
						class="flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border py-4 transition-colors duration-300 hover:bg-muted/50"
						onclick={preventDefault(() => imageInput.click())}
					>
						<ImageUp />
						<span>Upload recipe image</span>
					</button>
				{:else if imageSrc || $formValues.image}
					<div class="group relative overflow-hidden rounded-lg border p-2">
						{#if imageSrc}
							<Image
								src={imageSrc}
								alt={$formValues.title}
								class="mx-auto max-h-80 w-auto rounded-md transition-all duration-300 group-hover:blur-xs"
							/>
						{:else}
							<Image
								src={buildCloudinaryUrl($formValues.image || '', { width: 800, height: 600 })}
								alt={$formValues.title}
								width={800}
								height={600}
								class="mx-auto max-h-80 w-auto rounded-md transition-all duration-300 group-hover:blur-xs"
							/>
						{/if}
						<button
							class="absolute inset-0 flex cursor-pointer flex-col items-center justify-center bg-black/0 opacity-0 transition-all duration-300 group-hover:bg-black/50 group-hover:opacity-100"
							onclick={preventDefault(() => imageInput.click())}
						>
							<ImageUp />
							<span>Upload new recipe image</span>
						</button>
					</div>
				{/if}
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<!-- Instructions -->
	<Divider text="Instructions" />
	<div
		class="space-y-2 rounded-md p-2"
		use:dndzone={{
			items: $formValues.instructions || [],
			flipDurationMs: 200,
			dropTargetClasses: ['outline'],
			dropTargetStyle: {}
		}}
		onconsider={handleDndConsider}
		onfinalize={handleDndFinalize}
	>
		<!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
		{#each $formValues.instructions as instruction (instruction.uid)}
			<div animate:flip={{ duration: 200 }}>
				<Form.Field {form} name="instructions">
					<Form.Control>
						{#snippet children({ props })}
							<div class="relative">
								<div class="flex flex-row items-center gap-2">
									<div><GripVertical /></div>
									<Textarea
										{...props}
										bind:value={instruction.description}
										class="field-sizing-content resize-none"
										aria-invalid={$errors.instructions && $errors.instructions[instruction.step - 1]
											? 'true'
											: undefined}
										oninput={() => autoSaveDraft(DEBOUNCE_TIMES.TEXT_FIELD)}
									/>
								</div>
								<Button
									class="absolute -top-4 -right-3.5"
									variant="ghost"
									size="icon"
									onclick={() => removeInstruction(instruction.uid)}><CircleX /></Button
								>
							</div>
						{/snippet}
					</Form.Control>
					{#if $errors.instructions && $errors.instructions[instruction.step - 1]}
						<div class="text-sm text-destructive">
							{$errors.instructions[instruction.step - 1].description}
						</div>
					{/if}
				</Form.Field>
			</div>
		{/each}
		<div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
			<Button onclick={() => addInstruction()} variant="default"><Plus />Add</Button>
		</div>
	</div>
	<Divider text="Ingredients" />

	<!-- Ingredients -->
	{#if selectedIngredients && selectedIngredients.length > 0}
		<Card.Root class="w-full py-0">
			<Card.Content class="p-2">
				<Table.Root class="w-full rounded-xl bg-background">
					<Table.Body class="divide-y divide-border rounded-xl">
						{#each selectedIngredients as ingredient, index (ingredient.ingredient_uid)}
							<Table.Row>
								<Table.Cell class="w-2/3 pl-4 font-medium"
									>{ingredientLabel(ingredient.ingredient_uid)}
									{#if $errors.ingredients && $errors.ingredients[index]}
										{@render ingredientInRecipeError($errors.ingredients[index])}
									{/if}
								</Table.Cell>
								<Table.Cell>{ingredient.quantity} {unitLabel(ingredient.unit_uid)}</Table.Cell>
								<Table.Cell class="text-right"
									><Button
										onclick={() => removeIngredient(ingredient.ingredient_uid)}
										variant="ghost"
										size="icon"><CircleX /></Button
									></Table.Cell
								>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			</Card.Content>
		</Card.Root>
	{/if}
	<Field.Group class="gap-2">
		<Field.Legend variant="label" class="mb-0">Add more:</Field.Legend>
		<Popover.Root bind:open={ingredientSelectOpen}>
			<Popover.Trigger bind:ref={triggerRef}>
				{#snippet child({ props })}
					<Button
						{...props}
						variant="outline"
						class="justify-between"
						role="combobox"
						aria-expanded={ingredientSelectOpen}
					>
						{selectedIngredientLabel || 'Select an ingredient...'}
						<ChevronsUpDown class="opacity-50" />
					</Button>
				{/snippet}
			</Popover.Trigger>
			<Popover.Content class="w-[200px] p-0">
				<Command.Root>
					<Command.Input placeholder="Search ingredient..." bind:value={ingredientSearch} />
					<Command.List>
						<Command.Empty class="space-y-4 p-4 text-center">
							<p>No ingredient found.</p>
							<Dialog.Root bind:open={addIngredientDialogOpen}>
								<Dialog.Trigger
									class={buttonVariants({ variant: 'outline' })}
									onclick={openIngredientAddForm}>Add ingredient...</Dialog.Trigger
								>
								<Dialog.Content class="sm:max-w-[425px]">
									<Dialog.Header>
										<Dialog.Title>Add ingredient</Dialog.Title>
									</Dialog.Header>
									<form method="POST" use:ingredientEnhance action="?/addIngredient">
										<div class="grid gap-4 py-4">
											<Form.Field form={ingredientForm} name="name">
												<Form.Control>
													{#snippet children({ props })}
														<Form.Label>Ingredient name</Form.Label>
														<Input {...props} bind:value={$ingredientFormValues.name} />
													{/snippet}
												</Form.Control>
												<Form.FieldErrors />
											</Form.Field>
										</div>
										<Dialog.Footer>
											<Button type="submit">Save changes</Button>
										</Dialog.Footer>
									</form>
								</Dialog.Content>
							</Dialog.Root>
						</Command.Empty>
						<Command.Group value="ingredients">
							{#each ingredientsForSelection as ingredient (ingredient.value)}
								<Command.Item
									value={ingredient.label}
									onSelect={() => {
										selectedIngredientUID = ingredient.value;
										closeIngredientSelect();
									}}
								>
									<Check
										class={cn(selectedIngredientUID !== ingredient.value && 'text-transparent')}
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
				<Field.Label for="quantity">Qty:</Field.Label>
				<Input
					id="quantity"
					placeholder="Enter quantity"
					type="number"
					bind:value={quantity}
					min="0"
				/>
			</Field.Field>
			<Field.Field>
				<Field.Label for="unit">Unit:</Field.Label>
				<Select.Root
					type="single"
					bind:value={selectedUnitUID}
					bind:open={unitSelectOpen}
					disabled={!quantity}
				>
					<Select.Trigger id="unit">
						{selectedUnitLabel}
					</Select.Trigger>
					<Select.Content>
						<Dialog.Root bind:open={addUnitDialogOpen}>
							<Dialog.Trigger class={[buttonVariants({ variant: 'outline' }), ' mb-1 w-full']}
								><Plus />Add unit</Dialog.Trigger
							>
							<Dialog.Content class="sm:max-w-[425px]">
								<Dialog.Header>
									<Dialog.Title>Add unit</Dialog.Title>
								</Dialog.Header>
								<form method="POST" use:unitEnhance action="?/addUnit">
									<div class="grid gap-4 py-4">
										<Form.Field form={unitForm} name="name">
											<Form.Control>
												{#snippet children({ props })}
													<Form.Label>Unit name</Form.Label>
													<Input {...props} bind:value={$unitFormValues.name} />
												{/snippet}
											</Form.Control>
											<Form.FieldErrors />
										</Form.Field>
										<Form.Field form={unitForm} name="abbreviation">
											<Form.Control>
												{#snippet children({ props })}
													<Form.Label>Unit abbreviation</Form.Label>
													<Input {...props} bind:value={$unitFormValues.abbreviation} />
												{/snippet}
											</Form.Control>
											<Form.FieldErrors />
										</Form.Field>
									</div>
									<Dialog.Footer>
										<Button type="submit">Save changes</Button>
									</Dialog.Footer>
								</form>
							</Dialog.Content>
						</Dialog.Root>
						{#each unitsForSelection as unit (unit.value)}
							<Select.Item {...unit} />
						{/each}
					</Select.Content>
				</Select.Root>
			</Field.Field>
		</div>
		<div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
			<Button onclick={() => addIngredient()} class="mt-2" disabled={addIngDisabled}
				><Plus />Add</Button
			>
		</div>
		{#if $errors.ingredients}
			<div class="text-sm text-destructive">
				{$errors.ingredients._errors?.join(', ')}
			</div>
		{/if}
	</Field.Group>

	<Field.Separator class="mb-4" />

	<div class="flex flex-col-reverse gap-2 text-base sm:flex-row sm:items-center sm:justify-end">
		{#if $formValues.isDraft}
			<!-- Save status indicator -->
			<div class="flex items-center gap-2 text-sm text-muted-foreground">
				{#if draftSaver.saveState === 'saving' || isUploadingImage}
					<Loader2 class="h-4 w-4 animate-spin" />
					<span>{isUploadingImage ? 'Uploading image...' : 'Saving...'}</span>
				{:else if draftSaver.saveState === 'saved'}
					<Check class="h-4 w-4 text-green-500" />
					<span class="text-green-600 dark:text-green-400">Saved</span>
				{:else if draftSaver.saveState === 'error'}
					<AlertCircle class="h-4 w-4 text-destructive" />
					<span class="text-destructive">Save failed</span>
				{/if}
			</div>
		{/if}
		{#if $formValues.isDraft}
			<Button
				type="submit"
				formaction="?/finishDraft"
				class="sm:w-auto"
				disabled={shouldBlockUI}
				onclick={() => (isExplicitSave = true)}
			>
				{#if shouldBlockUI}
					<Spinner class="size-9" />
				{:else}
					Finish
				{/if}
			</Button>
		{:else}
			<Button
				type="submit"
				class="sm:w-18"
				disabled={shouldBlockUI}
				onclick={() => (isExplicitSave = true)}
			>
				{#if shouldBlockUI}
					<Spinner class="size-9" />
				{:else}
					Save
				{/if}
			</Button>
		{/if}
		{#if edit}
			<Button variant="outline" type="button" onclick={() => (edit = false)}>Cancel</Button>
		{/if}
	</div>
</form>

<SuperDebug data={{ $formValues, $errors }} />
