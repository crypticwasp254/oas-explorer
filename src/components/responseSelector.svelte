<script>
	import { onMount } from 'svelte';
	import Codebox from './codebox.svelte';

	export let responses = {};
	let headers = Object.keys(responses);
	let res = headers[0];

	onMount(() => {
		changeRes(headers[0]);
	});

	const changeRes = (newres) => {
		res = newres;
	};

	const theircolors = (res) => {
		let cll = parseInt(res);

		if (cll < 300) {
			return 'var(--oc-green-2)';
		} else if (cll < 400) {
			return 'var(--oc-green-1)';
		} else if (cll < 500) {
			return 'var(--oc-orange-2)';
		} else {
			return 'var(--oc-red-2)';
		}
	};
</script>

<div class="reselector">
	<div class="acc-headers">
		{#each headers as header}
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<div
				class="acc-header"
				class:active={res === header}
				style="color : {theircolors(header)}"
				on:click={() => changeRes(header)}
			>
				{header}
			</div>
		{/each}
	</div>
	<div class="acc-content">
		<Codebox codeSnippet={JSON.stringify(responses[res]?.samples[0]?.example, null, 2)} />
	</div>
</div>

<style lang="scss">
	.reselector {
		padding-block: 0.5rem;
	}
	.acc-headers {
		display: flex;
		gap: 1rem;
		margin-block-end: 0.5rem;

		.acc-header {
			padding: 0.25rem 1.25rem;
			font-size: 0.875rem;
			background: var(--surface2);
			border-radius: 2rem;
			position: relative;
			overflow: hidden;
			cursor: pointer;
			border: 1px solid transparent;

			// &::after {
			// 	content: '';
			// 	width: 100%;
			// 	height: 2px;
			// 	background: transparent;
			// 	position: absolute;
			// 	bottom: 0;
			// 	left: 0;
			// 	opacity: 0.8;
			// }

			&.active {
				border-color: var(--selfcolor);

				// &::after {
				// 	background: var(--brand);
				// 	// color: var(--surface1);
				// }
			}
		}
	}
</style>
