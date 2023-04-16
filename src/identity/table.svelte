<script>
	import CloseIcon from '$icons/close.svelte';
	import { onMount } from 'svelte';
	import { slide } from 'svelte/transition';
	import Checkbox from './input/checkbox.svelte';

	export let headings = [];
	export let data = [];

	let tablecontainer;

	onMount(() => {
		tablecontainer.parentElement.style.height = '100%';
	});

	// table ops
	let selected_rows = 0;
	let checks = [];
	let allMarker;

	const markAll = () => {
		if (allMarker.checked) {
			umarkAll();
		} else {
			checks.forEach((checkmark) => checkmark.check());
			selected_rows = checks.length;
		}
	};

	const markItem = (checked) => {
		if (checked === false) {
			selected_rows += 1;
		} else {
			selected_rows -= 1;
		}
	};

	const umarkAll = () => {
		checks.forEach((checkmark) => checkmark.uncheck());
		allMarker.uncheck();
		selected_rows = 0;
	};
</script>

<div class="tablecontainer" bind:this={tablecontainer}>
	<!-- <div class="trow filter_row">apply filters</div> -->
	{#if selected_rows}
		<div class="trow marked_cell_menu" transition:slide={{ duration: 150 }}>
			<div class="marked_count">{selected_rows} selected</div>
			<div class="actions">
				<div class="action">moderate</div>
				<div class="action">delete</div>
			</div>
			<div class="right actions">
				<div class="action cancel" on:click={umarkAll}>
					<CloseIcon />
				</div>
			</div>
		</div>
	{/if}
	<table>
		<thead>
			<tr>
				<th class="marker">
					<Checkbox on:checked={markAll} bind:this={allMarker} />
				</th>
				{#each headings as heading}
					<th>{heading}</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each data as row, id}
				<tr>
					<td class="marker_item {`marker_${id}`}">
						<Checkbox on:checked={(e) => markItem(e.detail)} bind:this={checks[id]} />
					</td>
					{#each Object.keys(row) as column}
						<!-- <td>mrk</td> -->
						<td>{row[column]}</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
	{#if !data.length}
		<div class="nodata">no data</div>
	{/if}
</div>

<style lang="scss">
	.tablecontainer {
		position: relative;
		// height: 80%;
		// height: calc(100% - 4rem);
	}

	table {
		border-collapse: collapse;
		width: 100%;
		border-spacing: 0;
		// background: var(--surface2);
		border-radius: var(--radius);
		overflow-x: auto;
		white-space: nowrap;

		tr {
			border-bottom: 1px solid rgba(255, 255, 255, 0.03);
			&:last-child {
				border-bottom: 1px solid transparent;
			}
		}

		td,
		th {
			padding: 0.6rem 1rem;
		}

		th {
			text-align: left;
			font-weight: 400;
			text-transform: capitalize;
			color: var(--text2);
			position: sticky;
			top: 0;
		}

		thead {
			width: 100%;
			background: var(--surface2);

			tr {
				th {
					padding: 0.6rem 1rem;
				}
			}
		}

		tbody {
			width: 100%;
			tr:hover {
				background: var(--surface3);
			}
		}

		.marker {
			width: 2em;
		}
	}

	.nodata {
		width: 100%;
		height: inherit;
		display: grid;
		padding-block: 2rem;
		place-items: center;
		min-height: 40vh;
	}

	.trow {
		padding: 0.6rem 1rem;
		width: 100%;

		&.marked_cell_menu {
			display: flex;
			background: var(--surface3);

			.actions {
				display: flex;
				padding-inline: 1rem;

				.action {
					padding-inline: 1rem;
					cursor: pointer;
				}

				&.right {
					position: absolute;
					right: 0rem;
				}
			}
		}
	}
</style>
