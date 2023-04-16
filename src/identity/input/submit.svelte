<script>
	export let text = 'submit';
	export let loading = false;
	export let disabled = false;

	export const enable = (new_text) => {
		loading = true;
		disabled = true;
		text = new_text;
	};

	export const disable = (new_text) => {
		loading = false;
		disabled = false;
		text = new_text;
	};
</script>

<div class="id-input field">
	<button type="submit" class:disabled class:loading class="fluid primary">
		{#if loading}
			<div class="licon">
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
					<g>
						<path fill="none" d="M0 0h24v24H0z" />
						<path
							fill="var(--brand)"
							d="M18.364 5.636L16.95 7.05A7 7 0 1 0 19 12h2a9 9 0 1 1-2.636-6.364z"
						/>
					</g>
				</svg>
			</div>
		{/if}
		<div class="label">{text}</div>
	</button>
</div>

<style lang="scss">
	button {
		pointer-events: all;
		&.loading {
			.label {
				transform: translateX(-2rem);
			}
		}

		transition: all 150ms cubic-bezier(0.4, 0, 1, 1);
		&.disabled {
			opacity: 1;
			pointer-events: none;
			background: var(--surface3);
			color: var(--brand);
			cursor: not-allowed;
		}
	}
	.licon {
		height: 1.5rem;
		width: 1.5rem;
		animation: rotate 700ms cubic-bezier(0.4, 0, 1, 1) infinite forwards;
	}

	.label {
		flex-grow: 1;
		display: flex;
		justify-content: center;
	}

	@keyframes rotate {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
</style>
