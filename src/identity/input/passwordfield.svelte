<script>
	import { slide } from 'svelte/transition';
	import { elasticInOut } from 'svelte/easing';
	export let label = 'password';
	export let value = '';

	$: shown = false;

	let field;

	export let status = 'valid';
	export let helptext = undefined;
	export let validator = null;
	export let autocomplete = 'on';

	export const toggleVisibility = () => {
		shown = !shown;
		shown ? (field.type = 'text') : (field.type = 'password');
	};

	export const updateStatus = (new_status, new_helptext) => {
		status = new_status;
		helptext = new_helptext;
	};

	const fieldFocus = () => {
		if (status === 'error') updateStatus('valid', null);
	};

	const validateInline = () => {
		if (validator) {
			const validation = validator(value);
			if (validation.error) {
				updateStatus('error', validation.error);
			} else {
				updateStatus('valid', null);
			}
		}
	};
</script>

<div class="id-input inputfield {status}">
	<div class="inputcontainer">
		<div class="input">
			<input
				type="password"
				placeholder={label}
				{autocomplete}
				bind:value
				bind:this={field}
				on:blur={validateInline}
				on:focus={fieldFocus}
			/>
			<label for={label}>{label}</label>
		</div>
		<div class="trail btn" on:click={toggleVisibility}>
			{shown ? 'hide' : 'show'}
		</div>
	</div>
	{#if helptext}
		<div class="inputextras" transition:slide={{ duration: 200, easing: elasticInOut }}>
			{helptext}
		</div>
	{/if}
</div>

<style lang="scss">
	.btn {
		background: var(--surface3);
		padding: var(--padding);
		cursor: pointer;
		user-select: none;
		min-width: 4rem;
	}
</style>
