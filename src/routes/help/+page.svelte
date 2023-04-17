<div class="helpdoc">
	<h1 class="headline3">help</h1>
	<p>this is a simple tool to help you better document your APIs.</p>
	<h2 class="headline5">API structure</h2>
	<p>the api routes must have tags for grouping</p>
	<p>for best results, each route must have</p>
	<ul>
		<li>summary - a short title for endpoint title</li>
		<li>description - indepth information</li>
		<li>examples - all parameters,requestBodies and responses must have examples</li>
	</ul>
	<h2 class="headline5">development</h2>
	<p>
		this project is intended to be a full api design, documentation and testing suite but was
		created in two days for svelte hack, it is incomplete.
	</p>
	<p>
		since no additions should be added after 17th april if you'd like to contribute and checkout
		future development this <a href="https://github.com/cyxth/oas-explorer">fork</a>.
	</p>
	<p>.</p>
</div>

<style lang="scss">
	.helpdoc {
		padding-inline: 2rem;
		max-width: 34rem;
	}

	h1,
	h2 {
		padding-block: 1rem;
	}

	p::first-letter {
		text-transform: capitalize;
	}

	ul {
		list-style-position: inside;
	}
</style>
