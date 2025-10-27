import devtoolsJson from 'vite-plugin-devtools-json';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit(), devtoolsJson()],
	build: {
		rollupOptions: {
			output: {
				manualChunks: (id) => {
					// Split large UI libraries into separate chunks
					if (id.includes('node_modules')) {
						// Lucide icons in separate chunk
						if (id.includes('@lucide/svelte')) {
							return 'lucide-icons';
						}
						// bits-ui - split into smaller chunks
						if (id.includes('bits-ui/dist/bits/command')) {
							return 'bits-ui-command';
						}
						if (id.includes('bits-ui/dist/bits/select')) {
							return 'bits-ui-select';
						}
						if (id.includes('bits-ui/dist/bits/popover')) {
							return 'bits-ui-popover';
						}
						if (id.includes('bits-ui') || id.includes('runed')) {
							return 'bits-ui';
						}
						// Form libraries in separate chunk
						if (id.includes('sveltekit-superforms')) {
							return 'superforms';
						}
						if (id.includes('formsnap')) {
							return 'formsnap';
						}
						// Date libraries in separate chunk
						if (id.includes('date-fns')) {
							return 'date-fns';
						}
						if (id.includes('@internationalized/date')) {
							return 'intl-date';
						}
						// DnD library
						if (id.includes('svelte-dnd-action')) {
							return 'dnd';
						}
					}
				}
			}
		}
	}
});
