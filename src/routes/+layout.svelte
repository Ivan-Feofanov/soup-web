<script lang="ts">
	import '../app.css';
	import { SquareUserRound, LogIn, LogOut } from '@lucide/svelte'
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

<div class="drawer md:drawer-open">
	<input id="nav-drawer" type="checkbox" class="drawer-toggle" />
	<div class="drawer-content flex flex-col">
		<!-- Navbar -->
		<div class="navbar sticky top-0 z-10 w-full bg-base-300">
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
			{#if data.user}
				{#if page.url.pathname === '/chef'}
					<form method="POST" action="/chef?/logout">
						<button type="submit"><LogOut /></button>
					</form>
				{:else }
					<a href="{resolve('/chef')}"><SquareUserRound class="h-7 w-7" /></a>
				{/if}
			{:else}
				<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
				<a href={data.authURL}><LogIn /></a>
			{/if}
		</div>
		<main class="px-4 py-3">
			{@render children()}
		</main>
	</div>
	<div class="drawer-side">
		<label for="nav-drawer" aria-label="close sidebar" class="drawer-overlay"></label>
		<ul class="menu min-h-full w-50 bg-base-200 p-4">
			<!-- Sidebar content here -->
			<li>Sidebar Item 1</li>
			<li>Sidebar Item 2</li>
		</ul>
	</div>
</div>
