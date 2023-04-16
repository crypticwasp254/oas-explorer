<svelte:options accessors />

<script>
	import MenuIcon from '$icons/menu.svelte';
	import Close from '$icons/close.svelte';

	let open = false;
	export let ocluded = false;
	export let showfab = true;

	export const hideMenu = () => {
		open = false;
	};
</script>

<div class="content" class:ocluded>
	<aside class="sidenav" class:open>
		<nav>
			<slot name="aside" />
		</nav>
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<div class="close" on:click={() => (open = false)} />
	</aside>
	<main style="padding-top:0rem;">
		<slot name="main" />
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<div class="mobiletoggle" class:showfab on:click={() => (open = !open)}>
			{#if open}
				<Close />
			{:else}
				<MenuIcon />
			{/if}
		</div>
	</main>
</div>

<style lang="scss" global>
	.content {
		min-block-size: 100vh;
		display: grid;
		grid: [stack] 1fr / min-content [stack] 1fr;
		overflow: hidden !important;
		height: 100vh;

		@media (max-width: 817px) {
			// @media (max-width: 540px) {
			aside,
			main {
				grid-area: stack;
			}
		}
	}

	// aside
	aside {
		// padding-block-start: 3rem;
		z-index: 4;
		position: relative;
		overflow: auto;

		nav {
			min-width: 18rem;
			height: 100%;
			background: var(--surface2);
			// padding: 0rem 0.6rem;

			.navlink {
				display: flex;
				width: 100%;
				padding: 0.4rem 1rem;
				align-items: center;
				cursor: pointer;
				border-inline-start: 0.2rem solid transparent;
				border-radius: var(--radius);
				user-select: none;

				&:first-child {
					margin-block-start: 1rem;
				}

				&:hover {
					background: var(--surface3);
				}

				.icon {
					height: 2rem;
					width: 2rem;
					display: grid;
					place-items: center;
				}

				.label {
					text-transform: capitalize;
					padding-inline-start: 1rem;
				}

				&.active {
					background: var(--surface4);
					border-inline-start: 0.2rem solid var(--info);
					color: var(--info);

					.icon {
						svg path#main-svg-path {
							fill: var(--brand);
						}
					}
				}
			}
		}
	}

	.sidenav {
		--easeOutExpo: cubic-bezier(0.16, 1, 0.3, 1);
		--duration: 0.6s;

		display: grid;
		grid-template-columns: [nav] 2fr [escape] 1fr;
		z-index: 500;

		.close {
			background-color: hsla(var(--brand-hue) 7% 5%/ 80%);
			backdrop-filter: blur(2px);
		}

		// @media (max-width: 540px) {
		@media (max-width: 817px) {
			position: sticky;
			top: 0;
			max-height: 100vh;
			overflow: hidden auto;
			overscroll-behavior: contain;

			visibility: hidden; /* not keyboard accessible when closed */
			transform: translateX(-100%);
			will-change: transform;
			transition: transform var(--duration) var(--easeOutExpo), visibility 0s linear var(--duration);

			&.open {
				visibility: visible;
				transform: translateX(0%);
				transition: transform var(--duration) var(--easeOutExpo);
			}
		}

		@media (prefers-reduced-motion: reduce) {
			--duration: 1ms;
		}
	}

	main {
		// padding-block-start: 3rem;
		position: relative;
		overflow: auto;
		// padding-inline: 2rem;
		.mobiletoggle {
			position: fixed;
			bottom: 2rem;
			right: 1rem;
			height: 3rem;
			width: 3rem;
			background: var(--surface3);
			box-shadow: var(--shadow3);
			border-radius: 200%;
			cursor: pointer;
			display: flex;
			align-items: center;
			justify-content: center;
			z-index: 500;
			display: none;

			// snip
			-webkit-tap-highlight-color: transparent;
			-webkit-touch-callout: none;
			user-select: none;
			touch-action: manipulation;

			@media (max-width: 817px) {
				display: grid;
				place-items: center;
			}
		}
	}
</style>
