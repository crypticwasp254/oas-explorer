<svelte:options accessors={true} />

<script>
	import { createEventDispatcher } from 'svelte';
	let dispatch = createEventDispatcher();
	export let checked = false;

	export const check = () => (checked = true);
	export const uncheck = () => (checked = false);

	const checkIt = () => dispatch('checked', checked);
</script>

<div class="id-input">
	<label class="checkboxx bounce">
		<input type="checkbox" bind:checked on:input={checkIt} />
		<svg viewBox="0 0 21 21">
			<polyline points="5 10.75 8.5 14.25 16 6" />
		</svg>
	</label>
</div>

<style lang="scss">
	.checkboxx {
		--background: transparent;
		--border: #d1d6ee;
		--border-hover: #bbc1e1;
		--border-active: var(--brand);
		--tick: var(--surface1);

		position: relative;
		display: flex;

		input,
		svg {
			width: 21px;
			height: 21px;
			display: block;
		}

		input {
			-webkit-appearance: none;
			-moz-appearance: none;
			position: relative;
			outline: none;
			background: var(--background);
			border: none;
			margin: 0;
			padding: 0;
			cursor: pointer;
			border-radius: 4px;
			transition: box-shadow 0.1s;
			box-shadow: inset 0 0 0 var(--s, 2px) var(--b, var(--border));

			&:hover {
				--s: 2px;
				--b: var(--border-hover);
			}
			&:checked {
				--b: var(--border-active);
			}
		}

		svg {
			pointer-events: none;
			fill: none;
			stroke-width: 2px;
			stroke-linecap: round;
			stroke-linejoin: round;
			stroke: var(--stroke, var(--border-active));
			position: absolute;
			top: 0;
			left: 0;
			width: 21px;
			height: 21px;
			transform: scale(var(--scale, 1)) translateZ(0);
		}

		&.bounce {
			--stroke: var(--tick);
			input {
				&:checked {
					--s: 11px;
					& + svg {
						animation: bounce 0.2s linear forwards 0.1s;
					}
				}
			}
			svg {
				--scale: 0;
			}
		}
	}

	@keyframes bounce {
		50% {
			transform: scale(1.2);
		}
		75% {
			transform: scale(0.9);
		}
		100% {
			transform: scale(1);
		}
	}
</style>
