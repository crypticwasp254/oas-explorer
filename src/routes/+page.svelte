<script>
	import { onMount } from 'svelte';
	import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
	import { source, specification } from '$components/store';
	import { ensureJson, generateDocs, lintDoc } from '$components/gendoc';

	let specSource = '';

	let editorContainer;

	let Monaco;

	let editor;

	let model;

	let loaded = false;

	onMount(async () => {
		if (specSource === '') {
			specSource = $source;
		}

		if (specSource === '') {
			specSource = '# start typing new oas or upload to read documentation';
		}
		await loadMonaco();
		loaded = true;
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

		model = Monaco.editor.createModel(specSource, 'yaml');

		editor = Monaco.editor.create(editorContainer, {
			value: specSource,
			language: 'yaml',
			model,
			automaticLayout: true,
			fontFamily: 'Inconsolata',
			theme: 'cyxtheme',

			scrollbar: {
				useShadows: false,
				horizontal: 'hidden'
			}
		});

		model.onDidChangeContent(() => {
			let value = editor.getValue();
			source.set(value);
		});
	};

	source.subscribe((val) => {
		// let now = new Date();
		if (editor) {
			lintDoc(val)
				.then((errs) => {
					validate(model, errs);
					if (!errs.length) {
						specification.set(generateDocs(ensureJson(val)));
					}
				})
				.catch((_err) => {
					console.log('the linter just failed');
					// ignore and generate
					specification.set(generateDocs(ensureJson(val)));
				});
		}
		// @ts-ignore
		// console.log('took mses => ', new Date() - now);
	});

	const validate = (model, lints) => {
		let markers = lints.map((lint) => {
			return {
				message: lint.message,
				severity: Monaco.MarkerSeverity.Error,
				startLineNumber: lint.range.start.line + 1,
				startColumn: lint.range.start.character,
				endLineNumber: lint.range.end.line,
				endColumn: lint.range.end.character
			};
		});

		Monaco.editor.setModelMarkers(model, 'owner', markers);
	};
</script>

{#if !loaded}
	<p class="loading-indicator">loading doc editor</p>
{/if}

<div bind:this={editorContainer} class="designer" />

<style lang="scss">
	.designer {
		height: calc(100vh - 3rem);
	}

	.loading-indicator {
		padding-inline: 2rem;
	}
</style>
