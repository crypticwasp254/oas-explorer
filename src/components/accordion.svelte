<script>
	import { specification, tagScrollSync } from '$lib/store';
	import Down from '$icons/down.svelte';
	import { goto } from '$app/navigation';

	let accordions = [];
	let spec = $specification;
	let selectedTag = spec.tags[0]?.name || 'none-here';

	const slugtag = (tag) => {
		return tag.toLowerCase().replaceAll(' ', '-');
	};

	tagScrollSync.subscribe((tag) => {
		selectedTag = tag;
		if (selectedTag === '') {
			selectedTag = spec.tags[0]?.name || 'none-here';
		}
	});
</script>

<div class="doc-accordion">
	{#each spec?.tags as tag}
		<div class="inner" class:expanded={selectedTag === tag?.name}>
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<div
				class="doc-accordion-header"
				on:click={() => {
					selectedTag = tag?.name;
					goto(`#tag-${tag?.name}`);
				}}
			>
				<div class="name">
					{tag.name}
				</div>
				<div class="expand">
					<Down />
				</div>
			</div>

			<div class="doc-accordion-body">
				{#each Array.from(spec?.tags?.mapper?.get(tag.name) || []) as endpoint}
					<a class="endpoint" href="#{slugtag(spec?.methodBodies[endpoint].summary)}"
						>{spec?.methodBodies[endpoint].summary}</a
					>
				{/each}
			</div>
		</div>
	{/each}
</div>

<style lang="scss">
	.doc-accordion {
		.inner {
			padding-block-end: 0.25rem;

			&.expanded {
				.doc-accordion-header {
					color: var(--brand);
					.expand {
						transform: rotate(0deg);
					}
				}

				.doc-accordion-body {
					display: block;
				}
			}
		}

		&-header {
			font-size: 0.875rem;
			font-weight: 500;
			text-transform: uppercase;
			padding: 0.25rem 0rem;
			cursor: pointer;
			display: flex;
			justify-content: space-between;
			align-items: center;

			.expand {
				color: var(--text2);
				transform: rotate(-90deg);
				transition: transform 0.1s ease-in;
			}
		}

		&-body {
			display: none;
			.endpoint {
				display: block;
				padding-block: 0.275rem;
				cursor: pointer;
				color: var(--text2);
				font-size: 0.9rem;

				&::first-letter {
					text-transform: capitalize;
				}

				&:active {
					color: var(--brand);
				}
			}
		}
	}
</style>
