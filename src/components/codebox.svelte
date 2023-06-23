<script>
	import '$identity/style/prism.css';

	import pkg from 'prismjs';
	const { highlight, languages } = pkg;

	// import { highlight, languages } from 'prismjs';
	// const { highlight, languages } = pkg;

	// import loadLanguages from 'prismjs/components';

	// loadLanguages(['json', 'xml']);

	export let codeSnippet = '? no code';
	let language = 'js';

	let html_code = '';

	$: {
		try {
			html_code = highlight(codeSnippet, languages[language], 'js');
		} catch (e) {
			console.log(e, codeSnippet);
			html_code = '? code gen error';
		}
	}
</script>

<div class="codebox">
	<div class="code-inner">
		<code>
			{@html html_code}
		</code>
	</div>
</div>

<style lang="scss">
	.codebox {
		padding: 0.5rem 1rem;
		background: var(--surface2);
		border-radius: 0.5rem;
		margin-block: 0.5rem;
		overflow-x: scroll;

		code {
			white-space: pre-wrap;
		}
	}
</style>
