<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils';

	let {
		class: className,
		text
	}: HTMLAttributes<HTMLLegendElement> & {text: string} = $props();
</script>

<div class={cn(
	"flex",
	"items-center",
	className
)}>
	<div aria-hidden="true" class="w-full border-t border-gray-300 dark:border-white/15"></div>
	<div class="relative flex justify-center">
		<span class="px-3 text-xl font-semibold whitespace-nowrap">{text}</span>
	</div>
	<div aria-hidden="true" class="w-full border-t border-gray-300 dark:border-white/15"></div>
</div>
