<script>
	import '$components/style.scss';

	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Content from '$identity/content.svelte';
	import CyxthLogo from '$identity/cyxthLogo.svelte';
	import { source, specification, docStore, stateStore, currentDoc } from '$lib/store';

	import { ensureJson, generateDocs } from '$lib/gendoc';
	import { getTemplate } from '$lib/template';

	import Accordion from '$components/accordion.svelte';
	import Dialog from '$components/dialog.svelte';

	import OvIcon from '$icons/overview.svelte';
	import LinkIcon from '$icons/link.svelte';
	import NewDocIcon from '$icons/newdoc.svelte';
	import DiskIcon from '$icons/storage.svelte';
	import BackIcon from '$icons/back.svelte';

	import { onMount } from 'svelte';
	import localforage from 'localforage';

	// spec
	let specSource = '';
	let spec = {};

	specification.subscribe((val) => {
		spec = val;
	});

	//upload
	let uploader;

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
			setDoc(event.target.result);
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

	let views = ['design', 'docs', 'test'];
	const switchView = async (view) => {
		activeView = view;
		if (activeView === 'design') {
			goto('/');
		} else if (activeView === 'docs') {
			goto(`/documentation`);
		} else {
			goto(`/${view}`);
		}
	};

	let dialog;
	let dialogPane = 'overview';

	let openOptions = [
		{ name: 'new', icon: NewDocIcon, action: () => (dialogPane = 'new') },
		//FIXME use link later
		// { name: 'link', icon: LinkIcon, action: () => (dialogPane = 'link') },
		{
			name: 'disk',
			icon: DiskIcon,
			action: () => {
				uploader.click();
			}
		}
	];

	let newApiTitle = '';
	let newApiVersion = '';

	const createNewSpec = () => {
		let template = getTemplate(newApiTitle, newApiVersion);
		setDoc(template);
	};

	const openRecent = async (recent) => {
		try {
			let src = await $docStore.getItem(`${recent[0]}@${recent[1]}`);
			if (src) {
				setDoc(src);
			}
		} catch (err) {
			console.error(err);
		}
	};

	const setDoc = (src) => {
		specSource = src;
		source.set(specSource);
		specification.set(generateDocs(ensureJson(specSource)));
		activeView = 'docs';
		goto('/documentation');
		dialog.close();
		docSave();
	};

	// let docStore;
	// let stateStore;
	const dbName = 'cyxth-oas-explorer';
	let recents = [];

	onMount(async () => {
		$docStore = localforage.createInstance({
			name: dbName,
			storeName: 'docStore',
			description: 'store past and recent docs'
		});

		$stateStore = localforage.createInstance({
			name: dbName,
			storeName: 'stateStore',
			description: 'store state of current doc'
		});

		try {
			let lastSave = await $stateStore.getItem('last-session');

			if (!lastSave || Date.now() - lastSave.saved > 900_000) {
				dialog.showModal();
			} else {
				openRecent(lastSave.key.split('@'));
			}
		} catch (e) {
			console.error(e);
		}

		$docStore.iterate((_, key) => {
			recents = [...recents, key.split('@')];
		});
	});

	// save doc for the fisrt time with with local forage
	const docSave = () => {
		// @ts-ignore
		let info = $specification.info;
		let key = `${info.title}@${info.version}`;
		$currentDoc = key;
		$docStore.setItem(key, specSource);
	};
</script>

<Content>
	<div class="sidebar" slot="aside">
		<div class="e-menu">
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<div class="e-menu-item" on:click={() => dialog.showModal()}>
				<OvIcon />
			</div>
			{#each views as tab}
				<button
					class="e-menu-item"
					class:active={activeView === tab}
					on:click={() => switchView(tab)}
				>
					{tab}
				</button>
			{/each}
		</div>
		<div class="sidebar-header">
			<div class="lg">
				{#if spec.info}
					<div class="logo">
						<CyxthLogo />
					</div>
					<div class="apiblock">
						<div class="title">
							<span> {spec.info.title || 'api title'}</span>
						</div>
						<div class="version">{spec.info.version || 'api version'}</div>
					</div>
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
		{:else if activeView === 'docs'}
			<div class="elements">
				<Accordion />
			</div>
		{/if}
	</div>
	<div class="doc-canvas" slot="main">
		<slot />
	</div>
</Content>

<Dialog bind:dialog contentSize="80ch">
	<div class="dheader" slot="dialog-header">API explorer</div>
	<div class="dcontent" slot="dialog-body">
		{#if dialogPane === 'overview'}
			<div class="p-info">Design, document and test Open API specifications.</div>
			<h6 class="padtop">open</h6>
			<div class="open-docs-ctas">
				{#each openOptions as opt}
					<!-- svelte-ignore a11y-click-events-have-key-events -->
					<div class="open-cta" on:click={opt.action}>
						<div class="icon">
							<svelte:component this={opt.icon} />
						</div>
						<div class="label">{opt.name}</div>
					</div>
				{/each}
			</div>
			<div class="open-recent-doc">
				<h6 class="recents-title padtop">recent docs</h6>
				<div class="recents">
					{#each recents as recent}
						<!-- svelte-ignore a11y-click-events-have-key-events -->
						<div class="recent" on:click={() => openRecent(recent)}>
							<div class="name">{recent[0]}</div>
							<div class="version">{recent[1]}</div>
						</div>
					{/each}
				</div>
			</div>
		{:else if dialogPane === 'new' || dialogPane === 'link'}
			<div class="">
				<div class="hdr padtop">
					<button class="goback" on:click={() => (dialogPane = 'overview')}>
						<BackIcon />
					</button>
					<h6>open {dialogPane}</h6>
				</div>
				<form on:submit|preventDefault={createNewSpec}>
					{#if dialogPane === 'link'}
						<div class="linker">
							<input type="text" placeholder="link" />
							<button>load</button>
						</div>
					{/if}
					<input type="text" placeholder="api title" bind:value={newApiTitle} />
					<input type="text" placeholder="api version" bind:value={newApiVersion} />
					<button>open</button>
				</form>
			</div>
		{/if}
		<input
			class="hidden"
			type="file"
			bind:this={uploader}
			on:change={fileChanged}
			accept=".yaml, .yml, .json"
		/>
	</div>
</Dialog>

<style lang="scss">
	.e-menu {
		padding: 1rem;
		display: flex;
		gap: 1rem;
		height: 3rem;
		align-items: center;
		text-transform: capitalize;

		&-item {
			display: flex;
			align-items: center;
			cursor: pointer;
			border-block-end: 0.125rem solid transparent;
			text-transform: capitalize;

			&.active {
				color: var(--brand);
			}
		}
	}

	.btt {
		height: 100%;
		display: grid;
		place-items: center;
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

			// p {
			// 	font-size: 1rem;
			// }
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

	.dcontent {
		min-block-size: min(75vh, 64ch);
		height: 100%;

		.p-info {
			color: var(--text2);
		}

		.open-docs-ctas {
			display: flex;

			gap: 1rem;
			padding-block: 0.5rem;
			.open-cta {
				height: 6rem;
				width: 8rem;
				padding: 0.5rem;
				border-radius: var(--radius);
				border: 0.125rem solid var(--surface3);
				cursor: pointer;
				display: flex;
				align-items: center;
				gap: 0.25rem;
				text-transform: capitalize;
				flex-direction: column;
				justify-content: center;

				.icon {
					display: grid;
					place-items: center;
				}
			}
		}

		h6 {
			text-transform: uppercase;
			font-weight: 500;
			font-size: 0.875rem;
			color: var(--text2);
		}
	}

	form {
		display: flex;
		flex-direction: column;
		max-width: 40ch;
		gap: 0.5rem;

		.linker {
			display: flex;
			justify-content: space-between;
			gap: 0.5rem;

			input {
				flex-grow: 1;
			}
		}

		input {
			border: 0.125rem solid var(--surface3);
			padding: 0.5rem 1rem;
			border-radius: var(--radius);
		}

		button {
			background: var(--brand);
			color: var(--surface1);
			border-radius: var(--radius);
			padding: 0.5rem 1rem;
		}
	}

	.hdr {
		display: flex;
		gap: 0.5rem;
		align-items: center;
		padding-block-end: 1rem;

		button {
			display: grid;
			place-items: center;

			padding: 0.5rem;
		}
	}

	.padtop {
		margin-block-start: 1rem;
	}

	.recents {
		max-width: 40ch;
		.recent {
			display: flex;
			justify-content: space-between;
			padding-block: 0.5rem;
			// border: 0.125rem solid var(--surface3);
			border-radius: var(--radius);
			cursor: pointer;
		}
	}
</style>
