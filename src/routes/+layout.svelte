<script lang="ts">
	import '../app.css';
	import { ModeWatcher, toggleMode } from 'mode-watcher';
	import { User, LogIn, LogOut, Sun, MoonStar } from '@lucide/svelte'
	import { Button } from "$lib/components/ui/button/index.js";

	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	let { children, data } = $props();

	$effect(() => {
		if (!page.url.pathname.startsWith('/chef') && data.user &&  (!data.user.handler || !data.user.username)) {
			goto(resolve('/chef'));
		}
	})
</script>
<ModeWatcher defaultMode="system" />
<!-- Navbar -->
<nav class="sticky top-0 z-10 w-full bg-primary-foreground flex items-center justify-between border-b border-base-content/10 p-2 gap-2.5">
	<div class="flex-none md:hidden">
		<label for="nav-drawer" aria-label="open sidebar" class="btn btn-square btn-ghost">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				class="inline-block h-6 w-6 stroke-current"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M4 6h16M4 12h16M4 18h16"
				></path>
			</svg>
		</label>
	</div>
	<div class="mx-2 flex-1 px-2 text-center">
		<a href="{resolve('/')}">My Father's Soup</a>
	</div>
	<Button onclick={toggleMode} variant="outline" size="icon">
		<Sun
			class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 !transition-all dark:-rotate-90 dark:scale-0"
		/>
		<MoonStar
			class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 !transition-all dark:rotate-0 dark:scale-100"
		/>
		<span class="sr-only">Toggle theme</span>
	</Button>
	{#if data.user}
		{#if page.url.pathname === '/chef'}
			<form method="POST" action="/chef?/logout">
				<Button type="submit" variant="outline" size="icon"><LogOut /></Button>
			</form>
		{:else }
			<Button href={resolve('/chef')} variant="outline" size="icon"><User class="h-[1.2rem] w-[1.2rem]"/></Button>
		{/if}
	{:else}
		<Button href={resolve('/auth/login/')} variant="outline" size="icon"><LogIn class="h-[1.2rem] w-[1.2rem]"/></Button>
	{/if}
</nav>

<main class="px-4 py-3 mb-4">
	{@render children()}
</main>
