<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { auth } from '$lib/stores/auth';
	import type { PageData } from './$types';
	import { resolve } from '$app/paths';

	export let data: PageData;

	console.log('Data:', data);

	onMount(() => {
		if (data.accessToken && data.user) {
			// Получаем данные, загруженные в +page.server.ts,
			// и сохраняем их в нашем глобальном состоянии.
			auth.login(data.user, data.accessToken);

			// После успешного входа перенаправляем на дашборд
			goto(resolve('/'));
		}
	});
</script>

<p>Завершаем вход...</p>
