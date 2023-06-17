<script>
	import Codebox from '$components/codebox.svelte';
	import ParameterTable from '$components/parameterTable.svelte';
	import ResponseSelector from '$components/responseSelector.svelte';
	import { specification, tagScrollSync } from '$lib/store';
	import { onDestroy, onMount } from 'svelte';

	let spec = { tags: [] };

	let unsub = specification.subscribe((sp) => {
		// @ts-ignore
		spec = sp;
	});

	const getEndpoints = (tag) => {
		// @ts-ignore
		let mapper = spec?.tags?.mapper?.get(tag);
		if (mapper) {
			return Array.from(mapper).map((id) => spec.methodBodies[id]);
		} else {
			return [];
		}
	};

	let observer;

	onMount(() => {
		observer = new IntersectionObserver(handleIntersection, {
			root: null,
			rootMargin: '-30%',
			threshold: 0
		});

		const linkers = document.querySelectorAll('.intersect-watch');
		linkers.forEach((linker) => observer.observe(linker));
	});

	onDestroy(() => {
		unsub();
		if (observer) {
			observer.disconnect();
		}
	});

	const handleIntersection = (entries) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				let tag = entry.target.dataset['tag'];
				tagScrollSync.set(tag);
			}
		});
	};
</script>

<div class="docs">
	{#each spec.tags as tag}
		<div class="apinamespace">
			<h1 class="apitag intersect-watch" id="tag-{tag.name}" data-tag={tag.name}>{tag.name}</h1>
			{#each getEndpoints(tag.name) as endpoint}
				<div class="apiendpoint">
					<h3
						class="headline5 intersect-watch"
						id={endpoint.summary.toLowerCase().replaceAll(' ', '-')}
						data-tag={tag.name}
					>
						{endpoint.summary}
						<!-- <a href="#{endpoint.summary.toLowerCase().replaceAll(' ', '-')}"> pl</a> -->
					</h3>
					<code class="">
						<span class="http-method http-method-{endpoint.method}">{endpoint.method}</span>
						<span>{endpoint.route}</span>
					</code>
					<div class="description">
						<p>{endpoint.description}</p>
					</div>

					<!-- params -->
					{#if endpoint?.parameters}
						<h4 class="inner-header">parameter table</h4>
						<ParameterTable parameters={endpoint.parameters} exclude={['description']} />
					{/if}

					<!-- reqbody -->
					{#if endpoint?.requestBody}
						{#if endpoint?.requestBody?.samples.length}
							<h4 class="inner-header">Example Request Body</h4>
							<Codebox
								codeSnippet={JSON.stringify(endpoint.requestBody.samples[0]?.example, null, 2)}
							/>
						{:else}
							<p>no request body examples</p>
						{/if}
					{/if}

					<!-- responses -->
					{#if endpoint?.responses}
						<h4 class="inner-header">Example Responses</h4>
						<ResponseSelector responses={endpoint.responses} />
					{/if}

					<!-- curl example -->
					<h4 class="inner-header">Curl Command</h4>
					<Codebox codeSnippet={endpoint.curl} />
				</div>
			{/each}
		</div>
	{/each}
</div>

<style lang="scss">
	.docs {
		padding-inline: 2rem;

		.apinamespace {
			padding-block: 1.25rem;
			max-width: 34rem;
			scroll-margin-top: 4rem;

			.apitag {
				font-size: 1.6rem;
				line-height: 1.8rem;
				text-transform: capitalize;
				font-weight: 400;
			}

			h3 {
				padding-block: 0.875rem;
				font-size: 1.25rem;
				font-weight: normal;
				opacity: 0.8;
			}

			h1 {
				scroll-margin-top: 4rem;
			}

			.apiendpoint {
				padding-block: 0.175rem;
				padding-block-end: 1rem;

				h3 {
					scroll-margin-top: 4rem;
				}

				h3::first-letter {
					text-transform: capitalize;
				}

				.description {
					padding-block-start: 0.475rem;
					&::first-letter {
						text-transform: capitalize;
					}
				}

				.inner-header {
					opacity: 0.75;
					font-size: 1rem;
				}
			}
		}
	}

	.http-method {
		text-transform: uppercase;
		font-weight: 500;

		&-post {
			color: var(--oc-green-6);
		}

		&-get {
			color: var(--oc-blue-6);
		}

		&-delete {
			color: var(--oc-red-6);
		}

		&-put {
			color: var(--oc-lime-6);
		}

		&-options {
			color: var(--oc-purple-6);
		}
	}
</style>
