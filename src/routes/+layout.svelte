<script>
	import { goto } from '$app/navigation';
	import { generateDocs } from '$components/gendoc';
	import { testspec } from '$components/testapi';
	import Content from '$identity/content.svelte';
	import CyxthLogo from '$identity/cyxthLogo.svelte';
	import { onMount } from 'svelte';

	import { source, specification } from '$components/store';

	// views
	let activeView = 'design';
	let views = ['design', 'documentation'];
	const switchView = async (view) => {
		activeView = view;
		if (activeView === 'design') {
			goto('/');
		} else {
			goto(`/${view}`);
		}
	};

	// spec
	let specSource = testspec;
	let spec = {};

	onMount(() => {
		spec = generateDocs(specSource);

		source.set(specSource);
		specification.set(spec);
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

		const reader = new FileReader();
		reader.addEventListener('load', (event) => {
			// @ts-ignore
			specSource = event.target.result;
			spec = generateDocs(specSource);

			source.set(specSource);
			specification.set(spec);
		});

		reader.readAsText(file);
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
							<span> {spec.info.title}</span>
						</div>
						<div class="version">{spec.info.version}</div>
					</div>
				{:else}
					<p>OAS designer</p>
				{/if}
			</div>
		</div>

		{#if activeView === 'design'}
			<div class="elements">
				<!-- {#if spec.info}
					<div class="apiblock">
						<div class="title">
							<span> {spec.info.title}</span>
						</div>
						<div class="version">{spec.info.version}</div>
					</div>
				{/if} -->

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
		{:else}
			<div class="elements">
				<div class="apiblock doc-side-block">
					<div class="block-title">resources</div>
					{#each spec.tags as tag}
						<div class="doc-endpoint-tag">
							{tag.name}
						</div>

						<div class="doc-endpoints">
							{#each tag.endpoints as endpoint}
								<div class="doc-endpoint">{endpoint.summary}</div>
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
				<button class="button" on:click={uploadSpec}>upload schema</button>
				<input
					class="hidden"
					type="file"
					bind:this={uploader}
					on:change={fileChanged}
					accept=".yaml, .yml"
				/>
			</div>
		</div>
		<slot />
	</div>
</Content>

<style lang="scss">
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