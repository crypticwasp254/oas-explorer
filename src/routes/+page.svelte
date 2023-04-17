<script>
	import { onMount } from 'svelte';
	import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
	import { source } from '$components/store';

	let specSource = '';

	let editorContainer;
	let Monaco;
	let editor;

	onMount(async () => {
		await loadMonaco();
	});

	const loadMonaco = async () => {
		self.MonacoEnvironment = {
			getWorker: (workerId, label) => {
				return new editorWorker();
			}
		};

		Monaco = await import('monaco-editor');

		Monaco.editor.defineTheme('cyxtheme', {
			base: 'vs-dark',
			inherit: true,
			rules: [],
			colors: {
				'editor.background': '#0c0d0e',
				'editorIndentGuide.background': '#ffffff0d',
				editorIndentGuides: '#D3D3D3',
				editorActiveIndentGuides: '#939393'
			}
		});

		editor = Monaco.editor.create(editorContainer, {
			value: specSource,
			language: 'yaml',
			automaticLayout: true,
			fontFamily: 'Inconsolata',
			theme: 'cyxtheme',
			readOnly: true
		});
	};

	source.subscribe((val) => {
		specSource = val;
		if (editor) {
			editor.setValue(specSource);
		}
	});
</script>

<div bind:this={editorContainer} class="designer" />

<style lang="scss">
	.designer {
		height: calc(100vh - 3rem);
	}
</style>
