<script>
	import { onMount } from 'svelte';
	import { slide } from 'svelte/transition';
	import { elasticInOut } from 'svelte/easing';

	export let label = 'label';
	export let type = 'text';
	export let value = '';

	export let status = 'valid';
	export let helptext = undefined;
	export let validator = null;
	export let autocomplete = 'on';

	let field;

	onMount(() => {
		field.type = type;
	});

	export const updateStatus = (new_status, new_helptext) => {
		status = new_status;
		helptext = new_helptext;
	};

	const fieldFocus = () => {
		// remove error status
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
				type="text"
				name={label}
				placeholder={label}
				{autocomplete}
				bind:value
				bind:this={field}
				on:blur={validateInline}
				on:focus={fieldFocus}
			/>
			<label for={label}>{label}</label>
		</div>
		{#if $$slots.trailicon}
			<div class="trail">
				<slot name="trailicon" />
			</div>
		{/if}
	</div>
	{#if helptext}
		<div class="inputextras" transition:slide={{ duration: 200, easing: elasticInOut }}>
			{helptext}
		</div>
	{/if}
</div>
