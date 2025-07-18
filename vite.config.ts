import type { ArgumentsType } from '@antfu/utils'
import { svelte, vitePreprocess } from '@sveltejs/vite-plugin-svelte'
import type Vue from '@vitejs/plugin-vue'
import type VueJsx from '@vitejs/plugin-vue-jsx'
import path from 'node:path'
import type { VitePluginConfig as UnoCSSConfig } from 'unocss/vite'
import type Icons from 'unplugin-icons/vite'
import type Components from 'unplugin-vue-components/vite'
import type Markdown from 'unplugin-vue-markdown/vite'
import { defineConfig, Plugin } from 'vite'
import type { ViteInspectOptions } from 'vite-plugin-inspect'
import type RemoteAssets from 'vite-plugin-remote-assets'
import type { ViteStaticCopyOptions } from 'vite-plugin-static-copy'
import virtual from 'vite-plugin-virtual'
import type ServerRef from 'vite-plugin-vue-server-ref'

export interface SlidevPluginOptions {
  vue?: ArgumentsType<typeof Vue>[0]
  vuejsx?: ArgumentsType<typeof VueJsx>[0]
  markdown?: ArgumentsType<typeof Markdown>[0]
  components?: ArgumentsType<typeof Components>[0]
  icons?: ArgumentsType<typeof Icons>[0]
  remoteAssets?: ArgumentsType<typeof RemoteAssets>[0]
  serverRef?: ArgumentsType<typeof ServerRef>[0]
  unocss?: UnoCSSConfig
  staticCopy?: ViteStaticCopyOptions
  inspect?: ViteInspectOptions
}

// extend vite.config.ts
declare module 'vite' {
  interface UserConfig {
    /**
     * Custom internal plugin options for Slidev (advanced)
     *
     * See https://github.com/slidevjs/slidev/blob/main/packages/slidev/node/options.ts#L50
     */
    slidev?: SlidevPluginOptions
  }
}

var svelte_to_vue = (): Plugin => {
	return {
		name: 'vue-react',
		enforce: 'pre',
		resolveId(id, importer) {
			if (id.endsWith('.svelte?vue') && importer) {
				const importPath = path.resolve(path.dirname(importer), id.replace('?vue', ''));
				console.log({ importPath });
				return { id: `${importPath}.neosvelte-vue`, moduleSideEffects: false };
			}
			return null;
		},
		load(id) {
			if (id.endsWith('.neosvelte-vue')) {
				const importPath = id.replace('.neosvelte-vue', '');
				return `
        import { vue_wrapper } from 'virtual:neosvelte:./vue.svelte.js';
        import Component from '${importPath}';
        
        export default vue_wrapper(Component);`;
			}
		},
	};
};

function neosvelte(): Plugin[] {
	return [
		svelte_to_vue(),
		{
			enforce: 'pre',
			...virtual({
				'virtual:neosvelte:./vue.svelte.js': `
	// @ts-check
import { mount, unmount } from 'svelte';
import { defineComponent, h, onMounted, ref, watch } from 'vue';

/** @param {Record<string, any>} react_props */
function get_props_and_events(react_props) {
	const props = {};

	for (const [key, value] of Object.entries(react_props)) {
		if (key.startsWith('on')) {
			props[key.toLowerCase()] = value;
		} else {
			props[key] = value;
		}
	}

	return props;
}

/**
 * @param {import('svelte').Component} Component
 * @returns {import('vue').Component}
 */
export const vue_wrapper = (Component) =>
	defineComponent((props) => {
		const target = ref();

		/** @type {import('vue').Ref<import('svelte').Component | undefined>} */
		const instance_ref = ref();

		let reactive_props = $state(get_props_and_events(props));

		onMounted(() => {
			instance_ref.value = mount(Component, { target: target.value, props: reactive_props });

			return () => {
				instance_ref.value && unmount(instance_ref.value);
			};
		});

		watch(props, () => {
			if (instance_ref.value) {
				reactive_props = get_props_and_events(props);
			}
		});

		return () =>
			h('div', { style: { display: 'contents' }, ref: target, children: props.children });
	});
	`,
			}),
		},
		// @ts-ignore
		svelte({ preprocess: vitePreprocess() }),
	];
}


export default defineConfig({
  plugins: [neosvelte()],
	optimizeDeps: {
		// exclude: ['@neodrag/*']
	}
})
