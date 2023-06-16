<script>
	import { goto } from '$app/navigation';
	import Content from '$identity/content.svelte';
	import CyxthLogo from '$identity/cyxthLogo.svelte';
	import { source, specification } from '$components/store';

	import { page } from '$app/stores';
	import { ensureJson, generateDocs } from '$components/gendoc';

	// spec
	let specSource = '';
	let spec = {};

	specification.subscribe((val) => {
		spec = val;
	});

	//upload
	let uploader;
	const uploadSpec = () => {
		uploader.click();
	};

	const fileChanged = (e) => {
		let file = e.target.files[0];
		if (!file) {
			return;
		}

		let supported_file_types = ['application/x-yaml', 'application/json'];
		let supported = supported_file_types.find((x) => x === file.type);
		if (!supported) {
			return;
			// TODO show error unsupported file type
		}

		const reader = new FileReader();
		reader.addEventListener('load', (event) => {
			// @ts-ignore
			specSource = event.target.result;
			source.set(specSource);
			specification.set(generateDocs(ensureJson(specSource)));
			goto('/documentation');
		});

		reader.readAsText(file);
	};

	let activeView = 'design';

	// sync active element with active page
	let pth = $page.url.pathname.split('/')[1];
	if (pth === '') {
		activeView = 'design';
	} else {
		activeView = pth;
	}

	let views = ['design', 'documentation'];
	const switchView = async (view) => {
		activeView = view;
		if (activeView === 'design') {
			goto('/');
		} else {
			goto(`/${view}`);
		}
	};
</script>

<Content>
	<div class="sidebar" slot="aside">
		<div class="sidebar-header">
			<div class="lg">
				<div class="logo">
					<CyxthLogo />
				</div>
				{#if spec.info}
					<div class="apiblock">
						<div class="title">
							<span> {spec.info.title || 'api title'}</span>
						</div>
						<div class="version">{spec.info.version || 'api version'}</div>
					</div>
				{:else}
					<p>OAS designer</p>
				{/if}
			</div>
		</div>

		{#if activeView === 'design'}
			<div class="elements">
				{#if spec?.paths?.length}
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
		{:else if activeView === 'documentation'}
			<div class="elements">
				<div class="apiblock doc-side-block">
					<div class="block-title">routes</div>
					{#each spec?.tags as tag}
						<div class="doc-endpoint-tag">
							{tag.name}
						</div>

						<div class="doc-endpoints">
							{#each Array.from(spec?.tags?.mapper?.get(tag.name) || []) as endpoint}
								<div class="doc-endpoint">{spec?.methodBodies[endpoint].summary}</div>
							{/each}
						</div>
					{/each}
				</div>
			</div>
		{/if}
	</div>
	<div class="doc-canvas" slot="main">
		<div class="header">
			<div class="menu">
				{#each views as tab}
					<button class="tab" class:active={activeView === tab} on:click={() => switchView(tab)}>
						{tab}
					</button>
				{/each}
			</div>

			<div class="right-menu">
				<!-- <div class="docs"> -->
				<!-- <button on:click={() => (spec = generateDocs(specSource))}>regen</button> -->
				<!-- </div> -->
				<div class="btt">
					<button class="button primary" on:click={uploadSpec}>upload spec</button>
					<input
						class="hidden"
						type="file"
						bind:this={uploader}
						on:change={fileChanged}
						accept=".yaml, .yml, .json"
					/>
				</div>
			</div>
		</div>
		<slot />
	</div>
</Content>

<style lang="scss">
	.btt {
		height: 100%;
		display: grid;
		place-items: center;
	}

	button.primary {
		background: var(--brand);
		color: var(--surface1);
		border-radius: 0.5rem;
		padding: 0.25rem 0.75rem;
	}

	// sidebar
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
			padding: 0.5rem 1rem;

			align-items: center;
			gap: 1rem;
			width: 100%;
			// font-weight: 500;
			cursor: pointer;

			.logo {
				height: 2.5rem;
			}

			.version {
				font-size: 0.8rem;
			}

			p {
				font-size: 1rem;
			}
		}
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

	.doc-side-block {
		.doc-endpoints {
			padding-inline-start: 0.5rem;
			.doc-endpoint-tag {
				font-size: 1.25rem;
			}
			.doc-endpoint {
				padding-block: 0.125rem;
				cursor: pointer;
				user-select: none;
				color: var(--text2);
			}
		}
	}

	// maindoc
	.doc-canvas {
		.header {
			height: 3rem;
			width: 100%;
			padding-inline: 2rem;
			display: flex;
			position: sticky;
			top: 0;
			background: var(--surface1);
			z-index: 2;

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
	}
</style>
