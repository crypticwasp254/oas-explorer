<script>
	import Content from '$identity/content.svelte';
	import CyxthLogo from '$identity/cyxthLogo.svelte';
	import { onMount } from 'svelte';
	import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
	// import { walkSchema, getDefaultState } from 'oas-schema-walker';
	import yaml from 'js-yaml';

	import { testspec } from '$components/testapi';

	let specSource = testspec;
	let uploader;

	let editorContainer;
	let Monaco;
	let editor;

	const uploadSpec = () => {
		uploader.click();
	};

	const fileChanged = (e) => {
		let file = e.target.files[0];
		if (!file) {
			return;
		}

		const reader = new FileReader();
		reader.addEventListener('load', (event) => {
			// @ts-ignore
			specSource = event.target.result;
			if (editor) {
				editor.setValue(specSource);
			}
			generateDocs();
		});

		reader.readAsText(file);
	};

	const shouldIhide = () => {};

	onMount(async () => {
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
				// 'editor.foreground': '#3da5ff',
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
			theme: 'cyxtheme'
		});
	});

	let spec = {};

	const generateDocs = () => {
		// smh convert this yaml file to docs
		console.log('generating docs');
		let data = yaml.load(specSource);
		spec.info = data.info;

		spec.paths = Object.keys(data.paths).map((k) => {
			return {
				route: k,
				methods: Object.keys(data.paths[k]).filter((ke) =>
					['post', 'get', 'put', 'delete', 'options'].includes(ke)
				)
			};
		});

		spec.servers = spec.components = Object.keys(data.components).map((k) => {
			return {
				title: k,
				values: Object.keys(data.components[k])
			};
		});

		let tags = data.tags.map((v) => {
			v.endpoints = [];
			return v;
		});

		Object.values(data.paths).forEach((val, index) => {
			let path_global_params = undefined;
			let methods = Object.keys(val);
			if (val.parameters) {
				path_global_params = val.parameters;
			}

			// methods
			Object.values(val).forEach((v, vindex) => {
				// only supports one tag per operation
				let tag = v.tags?.[0];
				let target_tag = tags.filter((tg) => tg.name === tag)[0];

				let method = methods?.[vindex];

				/// parameter parsing
				let parameters = null;
				if (path_global_params) parameters = path_global_params;
				if (v.parameters) {
					if (parameters) {
						parameters = [...parameters, ...v.parameters];
					} else {
						parameters = v.parameters;
					}
				}

				let docssrc = {
					summary: v?.summary,
					description: v?.description,
					method,
					path: Object.keys(data.paths)?.[index],
					parameters,
					requestBody: v?.requestBody,
					responses: v?.responses
				};

				target_tag?.endpoints.push(docssrc);
			});
		});

		spec.tags = tags;
		console.log(spec);
	};

	let tabs = ['design', 'documentation', 'test'];

	let activeView = 'design';

	const switchView = (view) => {
		activeView = view;
	};
</script>

<Content showfab={true}>
	<div class="sidebar" slot="aside">
		<div class="sidebar-header">
			<a class="lg" href="/docs" on:click={() => shouldIhide()}>
				<div class="logo">
					<CyxthLogo />
				</div>
				<p>OAS designer</p>
			</a>
			<!-- <div class="search">
				<SearchIcon />
			</div> -->
		</div>
		<div class="elements">
			{#if spec.info}
				<div class="apiblock">
					<div class="title">
						<span> {spec.info.title}</span>
					</div>
					<div class="version">{spec.info.version}</div>
				</div>
			{/if}

			{#if spec.paths}
				<div class="apiblock">
					<div class="block-title">paths</div>
					{#each spec.paths as path}
						<div class="api-path">
							<div class="namespace">{path.route}</div>
							<div class="methods">
								{#each path.methods as method}
									<span class="method-{method}">{method}</span>
								{/each}
							</div>
						</div>
					{/each}
				</div>
			{/if}

			{#if spec.components}
				{#each spec.components as component}
					<div class="apiblock">
						<div class="block-title">{component.title}</div>

						<div class="datastructures">
							{#each component.values as ds}
								<div class="api-schema-struct">{ds}</div>
							{/each}
						</div>
					</div>
				{/each}
			{/if}
		</div>
	</div>
	<div class="main-doc" slot="main">
		<div class="header">
			<div class="menu">
				{#each tabs as tab}
					<button class="tab" class:active={activeView === tab} on:click={() => switchView(tab)}>
						{tab}
					</button>
				{/each}
				<!-- <button
					class="tab"
					class:active={activeView === 'design'}
					on:click={() => switchView('design')}>design</button
				>
				<button
					class="tab"
					class:active={activeView === 'docs'}
					on:click={() => switchView('design')}>documentation</button
				> -->
			</div>

			<div class="right-menu">
				<!-- <div class="docs"> -->
				<button on:click={generateDocs}>regen</button>
				<!-- </div> -->
				<button class="button" on:click={uploadSpec}>upload schema</button>
				<input
					class="hidden"
					type="file"
					bind:this={uploader}
					on:change={fileChanged}
					accept=".yaml, .yml, .json"
				/>
			</div>
		</div>
		{#if activeView === 'design'}
			<div bind:this={editorContainer} class="designer" />
		{:else if activeView === 'documentation'}
			<div class="docs">
				{#each spec.tags as tag}
					<div class="apinamespace">
						<h1 class="apitag">{tag.name}</h1>
						{#each tag.endpoints as endpoint}
							<div class="apiendpoint">
								<h3 class="headline5">{endpoint.summary}</h3>
								<code class="">
									<span class="http-method method-{endpoint.method}">{endpoint.method}</span>
									<span>{endpoint.path}</span>
								</code>
								<div class="description">
									<p>{endpoint.description}</p>
								</div>
							</div>
						{/each}
					</div>
				{/each}
			</div>
		{/if}
	</div>
</Content>

<style lang="scss">
	.main-doc {
		.header {
			height: 3rem;
			width: 100%;
			padding-inline: 3rem;
			display: flex;

			.menu,
			.right-menu {
				height: 100%;
				display: flex;
				gap: 1rem;
			}

			.menu {
				flex-grow: 1;

				.tab.active {
					color: var(--brand);
				}
			}

			button {
				text-transform: capitalize;
			}
		}

		.designer {
			height: calc(100vh - 3rem);
		}

		.docs {
			padding-inline: 2rem;

			.apinamespace {
				padding-block: 1.25rem;
				max-width: 34rem;

				.apitag {
					font-size: 1.8rem;
					line-height: 1.8rem;
				}

				h1,
				h2,
				h3 {
					padding-block: 0.875rem;
				}

				.apiendpoint {
					padding-block: 0.175rem;

					.description {
						padding-block-start: 0.475rem;
						&::first-letter {
							text-transform: capitalize;
						}
					}
				}
			}
		}
	}

	.sidebar {
		position: relative;
		height: 100%;

		.elements {
			overflow-x: hidden;
			padding-inline: 1rem;
		}
	}

	.sidebar-header {
		display: flex;
		padding: 1rem;
		justify-content: space-between;
		align-items: center;
		position: sticky;
		top: 0;
		left: 0;
		background: var(--surface2);
		width: 100%;
		z-index: 3;

		.lg {
			display: flex;
			color: var(--brand);
			align-items: center;
			text-transform: capitalize;
			gap: 0.5rem;
			font-weight: 500;
			cursor: pointer;

			.logo {
				height: 1.325rem;
			}

			p {
				font-size: 1rem;
			}
		}

		// .search {
		// 	// background: red;
		// 	display: grid;
		// 	place-items: center;
		// 	opacity: 0.4;
		// }
	}
	.hidden {
		display: none;
	}

	.apiblock {
		padding-block: 0.5rem;

		.block-title {
			text-transform: uppercase;
			font-size: 0.8rem;
			font-weight: 500;
			padding-block: 0.5rem;
		}

		.datastructures {
			color: var(--text2);
			cursor: pointer;
			font-size: 0.9rem;

			.ds {
				padding-block: 0.125rem;
			}
		}

		.api-path {
			padding-block: 0.25rem;

			.namespace {
				color: var(--text2);
				font-size: 0.9rem;
			}

			.methods {
				text-transform: uppercase;
				font-size: 0.64rem;
				padding-block: 0.25rem;
				font-weight: 500;

				span {
					cursor: pointer;
					padding-inline-end: 0.5rem;
				}
			}
		}
	}

	/// method color
	.method-post {
		color: var(--oc-lime-6);
	}

	.method-get {
		color: var(--oc-violet-6);
	}

	.method-delete {
		color: var(--oc-red-6);
	}

	.method-put {
		color: var(--oc-blue-6);
	}

	.method-options {
		color: var(--oc-pink-6);
	}

	.http-method {
		text-transform: uppercase;
	}
</style>