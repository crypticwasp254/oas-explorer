<script>
	import Close from '$icons/close.svelte';
	export let dialog;
	export let contentSize = '48ch';
	export let header = 'dialog header';
	export let lightDismiss = false;

	const _TriggerlightDismiss = ({ target: dialog }) => {
		if (lightDismiss && dialog.nodeName === 'DIALOG') {
			dialog.close('dismiss');
		}
	};

	const close = () => {
		dialog.close();
	};
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<dialog
	id="dialog"
	style="--size-content:{contentSize}"
	bind:this={dialog}
	on:click={_TriggerlightDismiss}
>
	<header>
		<div class="header-title">
			<slot name="dialog-header">{header}</slot>
		</div>
		<button class="closebtn" on:click={close}>
			<Close />
		</button>
	</header>
	<article class="dialog-body">
		<slot name="dialog-body">body</slot>
	</article>
	<footer>
		<slot name="dialog-footer" />
	</footer>
</dialog>

<style lang="scss">
	dialog {
		width: auto;
		--size-content: 48ch;
		padding: 0.5rem;
		background: var(--surface2);
		box-shadow: var(--shadow3);
		border-radius: var(--radius);
		border: none !important;
		outline: none !important;
		margin: auto;
		display: grid;
		max-inline-size: min(90vw, var(--size-content));
		max-block-size: min(80vh, 100%);
		max-block-size: min(80dvb, 100%);
		overflow: hidden;
		z-index: 99909;
		inset: 0;
		position: fixed;

		// transition: opacity 0.5s ease;

		&::backdrop {
			backdrop-filter: blur(2px);
			// transition: backdrop-filter 0.5s ease;
		}

		header {
			display: flex;
			gap: 1.125rem;
			justify-content: space-between;
			font-size: 1.4rem;
			padding: 0.5rem;

			.closebtn {
				padding: 0rem;
				cursor: pointer;
				height: 2rem;
				width: 2rem;
				border-radius: 50%;
				display: flex;
				align-items: center;
				justify-content: center;
				background: var(--surface3);
				box-shadow: var(--shadow1);

				// &:focus {
				// 	outline: 1px solid var(--brand);
				// }
			}
		}

		footer,
		.dialog-body {
			padding: 0.5rem;
		}

		.dialog-body {
			display: grid;
			grid-template-rows: auto 1fr auto;
			align-items: start;
			max-block-size: 80vh;
			max-block-size: 80dvb;
			overflow-y: auto;
			overscroll-behavior-y: contain;
		}

		:global(button) {
			pointer-events: all !important;
		}

		&:not([open]) {
			pointer-events: none;
			opacity: 0;

			:global(button) {
				pointer-events: none !important;
			}
		}

		@media (max-width: 768px) {
			margin-block-end: 0;
			border-end-end-radius: 0;
			border-end-start-radius: 0;
			max-inline-size: min(100vw, var(--size-content));
		}
	}
</style>
