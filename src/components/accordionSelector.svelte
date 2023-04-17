<script>
	export let headers = [];
</script>

<div class="accordion-selector">
	<div class="acc-headers">
		{#each headers as header}
			<div class="acc-header">{header}</div>
		{/each}
	</div>
	<div class="acc-content">
		<slot name="content" />
	</div>
</div>

<style lang="scss">
	.acc-headers {
		display: flex;
		gap: 1rem;
		margin-block-end: 0.5rem;

		.acc-header {
			padding: 0.25rem 0.5rem;
			background: var(--surface2);
			border-radius: 0.25rem;
			cursor: pointer;
		}
	}
</style>
