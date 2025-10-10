<script lang="ts">
	const { text }: { text: string } = $props();
</script>

<div class="flex items-center">
	<div aria-hidden="true" class="w-full border-t border-gray-300 dark:border-white/15"></div>
	<div class="relative flex justify-center">
		<span class="px-3 text-xl font-semibold">{text}</span>
	</div>
	<div aria-hidden="true" class="w-full border-t border-gray-300 dark:border-white/15"></div>
</div>
