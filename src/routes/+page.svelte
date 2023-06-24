<script>
	import { onDestroy, onMount } from 'svelte';
	import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
	import { source, specification, currentDoc, docStore, stateStore } from '$lib/store';
	import { ensureJson, generateDocs, lintDoc, updateDocs } from '$lib/gendoc';

	let specSource = '';

	let editorContainer;

	let Monaco;

	let editor;

	let model;

	let loaded = false;

	let specJson = {};

	onMount(async () => {
		if (specSource === '') {
			specSource = $source;
		}

		if (specSource === '') {
			specSource = '# start typing new oas or upload to read documentation';
		}
		await loadMonaco();
		loaded = true;
		specJson = ensureJson(specSource);
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

	let unSubscriber = source.subscribe((val) => {
		if (editor) {
			lintDoc(val)
				.then((errs) => {
					validate(model, errs);
					if (!errs.length) {
						editGenerate(val);
					}
				})
				.catch((_err) => {
					console.log('the linter just failed');
					editGenerate(val);
				});
		}
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

	onDestroy(() => {
		unSubscriber();
	});

	// generate specification,docs and tests on edit
	const editGenerate = (value) => {
		//TODO check diff and generate only changed parts
		const valueJson = ensureJson(value);
		saveOffline(value);
		let changes = [];
		if (specJson) {
			changes = getChangePaths(valueJson, specJson);
		}
		// update spec json
		specJson = valueJson;

		// use this for now
		if (changes.length) {
			let updated = updateDocs(valueJson, $specification, changes);
			specification.set(updated);
		}
	};

	const getChangePaths = (newSpec, oldSpec, path = [], changes = []) => {
		if (newSpec === null || newSpec === undefined) {
			return;
		}

		Object.entries(newSpec).forEach(([key, value]) => {
			const currentPath = [...path, key];
			// both in old and new spec -> edited value only
			if (oldSpec.hasOwnProperty(key)) {
				if (typeof value === 'string') {
					if (value && value !== oldSpec[key]) {
						changes.push({
							type: 'edit',
							path: currentPath,
							value
						});
					}
				} else {
					getChangePaths(value, oldSpec[key], currentPath, changes);
				}
			} else {
				// in new spec only -> inserted
				changes.push({
					type: 'insert',
					path: currentPath,
					value
				});
			}
		});

		// in oldspec only -> deleted
		Object.entries(oldSpec).forEach(([key, value]) => {
			const currentPath = [...path, key];
			// ignore this mapper for now
			if (!newSpec.hasOwnProperty(key) && key !== 'mapper') {
				changes.push({
					type: 'deleted',
					path: currentPath,
					value: null
				});
			}
		});
		return changes;
	};

	const saveOffline = async (value) => {
		let cdoc = $currentDoc;

		if (specJson?.info?.title && specJson?.info?.version) {
			cdoc = `${specJson.info.title}@${specJson.info.version}`;
		}

		if ($currentDoc != cdoc) {
			$currentDoc = cdoc;
		}

		$docStore.setItem(cdoc, value);
		$stateStore.setItem('last-session', {
			saved: Date.now(),
			key: cdoc
		});
	};
</script>

{#if !loaded}
	<p class="loading-indicator">loading doc editor</p>
{/if}

<div bind:this={editorContainer} class="designer" />

<style lang="scss">
	.designer {
		height: 100vh;
	}

	.loading-indicator {
		padding-inline: 2rem;
	}
</style>
