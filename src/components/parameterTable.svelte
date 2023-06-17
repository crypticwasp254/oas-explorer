<script>
	export let parameters = [];
	export let exclude = [];
	let headers = Object.keys(parameters?.[0]).filter((h) => !exclude.includes(h));
</script>

<table>
	<thead>
		<tr>
			{#each headers as header}
				<th>{header === 'schema' ? 'type' : header}</th>
			{/each}
		</tr>
	</thead>
	<tbody>
		{#each parameters as parameter}
			<tr>
				{#each headers as header}
					{#if header === 'schema'}
						<td>
							{parameter[header]?.['type'] || `ex. "${parameter[header]?.['type']}"` || 'untyped'}
						</td>
					{:else}
						<td>{parameter[header]}</td>
					{/if}
				{/each}
			</tr>
		{/each}
	</tbody>
</table>

<style lang="scss">
	table {
		border-collapse: collapse;
		width: 100%;
		border-spacing: 0;

		border-radius: var(--radius);
		overflow-x: auto;
		white-space: nowrap;
		margin-block-end: 1.125rem;

		tr {
			border-bottom: 1px solid rgba(255, 255, 255, 0.01);
			&:last-child {
				border-bottom: 1px solid transparent;
			}
		}

		td,
		th {
			padding: 0.6rem 1rem;

			&:first-child {
				padding-inline-start: 0rem;
			}
		}

		th {
			text-align: left;
			font-weight: 400;
			text-transform: capitalize;
			color: var(--text2);
			// position: sticky;
			// top: 0;
		}

		thead {
			width: 100%;
			// background: var(--surface2);
			// border-block-end: 2px solid red;
			border-block-end: 2px solid rgba(255, 255, 255, 0.041);

			tr {
				th {
					padding: 0.6rem 1rem;
				}
			}
		}

		tbody {
			width: 100%;
			// tr:hover {
			// 	background: var(--surface2);
			// }
		}
	}
</style>
