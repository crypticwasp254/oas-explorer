<script>
	import Codebox from '$components/codebox.svelte';
	import ParameterTable from '$components/parameterTable.svelte';
	import ResponseSelector from '$components/responseSelector.svelte';
	import { specification } from '$components/store';
	import { onDestroy, onMount } from 'svelte';

	let spec = { tags: [] };

	let unsub = specification.subscribe((sp) => {
		// @ts-ignore
		spec = sp;
	});

	onDestroy(() => {
		unsub();
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
</script>

<div class="docs">
	{#each spec.tags as tag}
		<div class="apinamespace">
			<h1 class="apitag">{tag.name}</h1>
			{#each getEndpoints(tag.name) as endpoint}
				<div class="apiendpoint">
					<h3 class="headline5">{endpoint.summary}</h3>
					<code class="">
						<span class="http-method method-{endpoint.method}">{endpoint.method}</span>
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

			.apitag {
				font-size: 1.8rem;
				line-height: 1.8rem;
			}

			h1,
			h3 {
				padding-block: 0.875rem;
			}

			.apiendpoint {
				padding-block: 0.175rem;
				padding-block-end: 1rem;

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
</style>
