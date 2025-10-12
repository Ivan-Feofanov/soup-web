<script lang="ts">
	import { auth, userStore } from '$lib/stores/auth';
	import '../app.css';
	let { children, data } = $props();
	const currentUser = data.user;
	$effect(() => {
		if (data.user) {
			auth.login(data.user); // no client token needed
		} else {
			auth.logout();
		}
	});
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
						fill="none"
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
				My Father's Soup
				{#if userStore}
					{$userStore?.email}
				{/if}
			</div>
		</div>
		<main class="px-4 py-3">
			{#if !currentUser}
				<div class="flex flex-col items-center justify-center">
					<h1 class="text-2xl font-bold">Welcome!</h1>
					<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
					<a href={data.authURL} class="mt-2 text-gray-500">Please log in to continue.</a>
				</div>
			{/if}
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
