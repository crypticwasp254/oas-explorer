<svelte:options accessors={true} />

<script>
	import { fly } from 'svelte/transition';
	export let closeOnOutclick = true;
	export let hidden = true;

	const closeDialog = () => {
		if (closeOnOutclick) close();
	};

	export const openDialog = () => (hidden = false);
	export const close = () => (hidden = true);
</script>

<div class="dialog-wrapper" class:hidden>
	<div class="close-outside" on:click={closeDialog} />
	<div class="dialog" transition:fly={{ duration: 150, y: -12 }}>
		<slot name="dialog" />
	</div>
</div>

<style lang="scss">
	.dialog-wrapper {
		position: absolute;
		top: 0;
		left: 0;
		height: 100%;
		width: 100%;
		overflow: hidden;
		background-color: rgba(0, 0, 0, 0.3);
		backdrop-filter: blur(2px);
		opacity: 1;
		pointer-events: all;
		transition: opacity 150ms ease-in-out;
		z-index: 999;

		&.hidden {
			opacity: 0;
			pointer-events: none;
		}

		.close-outside {
			height: 100%;
			left: 0;
			width: 100%;
		}

		.dialog {
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			min-width: 25rem;
			// padding: 0.6rem 1rem;
			height: 28rem;
			border-radius: var(--radius);
			background: var(--surface3);
		}
	}
</style>
