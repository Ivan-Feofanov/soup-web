/**
 * Smart draft saver with debouncing and change tracking
 */

export type SaveState = 'idle' | 'saving' | 'saved' | 'error';

export interface DraftSaverOptions {
	onSave: () => Promise<void>;
	onSuccess?: () => void;
	onError?: (error: Error) => void;
	debounceTime?: number;
}

export interface DraftSaverReturn {
	saveState: SaveState;
	triggerSave: (debounceMs?: number) => void;
	cancelPendingSave: () => void;
	reset: () => void;
}

/**
 * Creates a smart draft saver with configurable debouncing
 */
export function createDraftSaver(options: DraftSaverOptions) {
	let saveState = $state<SaveState>('idle');
	let saveTimeout: ReturnType<typeof setTimeout> | null = null;
	let isSaving = false;

	const { onSave, onSuccess, onError, debounceTime = 1000 } = options;

	/**
	 * Trigger a save with optional custom debounce time
	 */
	function triggerSave(customDebounceMs?: number) {
		// Clear existing timeout
		if (saveTimeout) {
			clearTimeout(saveTimeout);
			saveTimeout = null;
		}

		const debounceMs = customDebounceMs ?? debounceTime;

		// Set new timeout
		saveTimeout = setTimeout(async () => {
			if (isSaving) return;

			isSaving = true;
			saveState = 'saving';

			try {
				await onSave();
				saveState = 'saved';
				onSuccess?.();

				// Reset to idle after showing success briefly
				setTimeout(() => {
					if (saveState === 'saved') {
						saveState = 'idle';
					}
				}, 2000);
			} catch (error) {
				saveState = 'error';
				onError?.(error as Error);
				console.error('Draft save failed:', error);

				// Reset to idle after showing error
				setTimeout(() => {
					if (saveState === 'error') {
						saveState = 'idle';
					}
				}, 5000);
			} finally {
				isSaving = false;
			}
		}, debounceMs);
	}

	/**
	 * Cancel any pending save
	 */
	function cancelPendingSave() {
		if (saveTimeout) {
			clearTimeout(saveTimeout);
			saveTimeout = null;
		}
	}

	/**
	 * Reset the saver state
	 */
	function reset() {
		cancelPendingSave();
		saveState = 'idle';
		isSaving = false;
	}

	return {
		get saveState() {
			return saveState;
		},
		triggerSave,
		cancelPendingSave,
		reset
	};
}

/**
 * Debounce time constants for different field types
 */
export const DEBOUNCE_TIMES = {
	TEXT_FIELD: 2000, // Title, description, notes
	STRUCTURAL: 500, // Add/remove ingredient, instruction
	REORDER: 1000, // Drag and drop
	IMMEDIATE: 0, // Image upload (handled separately)
	TOGGLE: 500 // Visibility toggle
} as const;
