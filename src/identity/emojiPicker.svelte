<script>
	import CloseIcon from '$icons/close.svelte';
	import EmojiIcon from '$icons/emoji.svelte';
	import GifIcon from '$icons/gif.svelte';
	import StickerIcon from '$icons/sticker.svelte';
	import { createEventDispatcher, onMount } from 'svelte';
	// import twemoji from 'twemoji';
	// @ts-ignore
	import emojis from './emoji.json';

	let picker;
	onMount(() => {
		// twemoji.parse(picker, {
		// 	// folder: 'svg',
		// 	// ext: '.svg'
		// });
	});

	let emojiShown;

	// const rerender = () => {
	// 	console.log();
	// 	twemoji.parse(emojiShown);
	// };

	$: selectedGroup = 'people';
	// $: {
	// 	if (emojiShown) {
	// 		rerender();
	// 	}
	// }

	const dispatch = createEventDispatcher();
</script>

<div class="emoticonpanel">
	<div class="sticker-switch">
		<div class="pane-switch" on:click={() => dispatch('close-panel', '')}>
			<CloseIcon />
		</div>
		<div class="pane-switch">
			<EmojiIcon />
		</div>
		<div class="pane-switch">
			<StickerIcon />
		</div>
		<div class="pane-switch">
			<GifIcon />
		</div>
	</div>
	<div class="emoji-picker" bind:this={picker}>
		<div class="emojis" bind:this={emojiShown}>
			{#each emojis.filter((emojiGroup) => emojiGroup.name === selectedGroup)[0].emojis as emoticon (emoticon.char)}
				<div class="emoticon" on:click={() => dispatch('pick', emoticon)}>
					{emoticon.char}
				</div>
			{/each}
		</div>
		<header>
			<!-- <button on:click={rerender}>r</button> -->
			<div class="picker-category">rec</div>
			{#each emojis as emojiGroup}
				<div
					class="picker-category"
					on:click={() => (selectedGroup = emojiGroup.name)}
					class:active={selectedGroup === emojiGroup.name}
				>
					{emojiGroup.char}
				</div>
			{/each}
		</header>
	</div>
</div>

<style lang="scss" global>
	.emoticonpanel {
		display: flex;
		// position: relative;
		height: 100%;
		overflow: hidden;

		.sticker-switch {
			padding-inline: 1rem;
			display: flex;
			flex-direction: column;
			gap: 1rem;
			justify-content: center;

			.pane-switch {
				cursor: pointer;
			}
		}
	}
	.emoji-picker {
		width: 100%;
		// padding: 0.5rem;
		height: 100%;
		overflow: hidden;
		position: relative;

		header {
			display: grid;
			grid-template-columns: repeat(10, 1fr);
			padding-block: 0.3rem;
			position: absolute;
			bottom: 0;
			left: 0;
			width: 100%;
			background: #0c0d0ee0;
			backdrop-filter: blur(18px);
			z-index: 979;
		}

		.emojis {
			width: inherit;
			display: grid;
			// grid-template-columns: repeat(16, 1fr);
			grid-template-columns: repeat(auto-fit, minmax(3rem, 1fr));
			grid-template-rows: min-content;
			gap: 0.3rem;
			height: 40vh;
			overflow-y: auto;
			padding-block-end: 6rem;

			.emoticon {
				display: flex;
				align-items: center;
				justify-content: center;
				padding: 0.5rem;
				font-size: 1.3rem;
				height: 2rem;
				width: 2rem;
				cursor: pointer;
				user-select: none;
			}
		}
		.picker-category {
			padding: 0.2rem 0.5rem;
			border-bottom: 2px solid transparent;
			cursor: pointer;
			display: flex;
			justify-content: center;

			&.active {
				border-bottom: 2px solid var(--brand);
			}
		}

		img.emoji {
			height: 1.2em;
			width: 1.2em;
			// margin: 0 0.05em 0 0.1em;
			// vertical-align: -0.1em;
		}
	}
</style>
