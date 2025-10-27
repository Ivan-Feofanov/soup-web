<script>
import LogIn from '@lucide/svelte/icons/log-in';
import { Button } from '$lib/components/ui/button/index.js';

export let data;
</script>

<div class="flex flex-col items-center justify-center mt-40">
	<Button href={data.authURL} variant="outline" class="py-6">
		<LogIn class="h-[1.2rem] w-[1.2rem]"/>Sign in / Sign up using Google
	</Button>
	<p class="text-center mt-4 text-sm text-gray-500">We'll add other login options soon</p>
</div>
