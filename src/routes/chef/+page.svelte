<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let user = $derived(data.user!);
</script>

<section>
	<p>{user.email}</p>
</section>
