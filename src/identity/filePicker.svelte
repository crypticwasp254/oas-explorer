<script>
	import CloseIcon from '$icons/close.svelte';
	import FileIcon from '$icons/file.svelte';
	import PhotoIcon from '$icons/photo.svelte';
	import VideoIcon from '$icons/video.svelte';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let files = [];
	let preview;
	let uploadBtn;

	const uploadFile = (type) => {
		uploadBtn.accept = type;
		uploadBtn.click();
	};

	const handleFiles = () => {
		for (let file of files) {
			if (!file.type.startsWith('image/')) continue;
			const img = document.createElement('img');
			img.classList.add('obj');
			// @ts-ignore
			img.file = file;
			img.dataset['name'] = file.name;
			preview.appendChild(img);

			const reader = new FileReader();
			reader.onload = (function (aImg) {
				return function (e) {
					// @ts-ignore
					aImg.src = e.target.result;
				};
			})(img);
			reader.readAsDataURL(file);
		}
	};
</script>

<div class="filepicker">
	<div class="options">
		<div class="option" on:click={() => dispatch('close-panel', '')}>
			<CloseIcon />
		</div>
		<div class="option" on:click={() => uploadFile('image/*')}>
			<PhotoIcon />
		</div>
		<div class="option">
			<VideoIcon />
		</div>
		<div class="option">
			<FileIcon />
		</div>
	</div>
	<div class="preview">
		<input
			type="file"
			name="files"
			id="files"
			style="display: none;"
			bind:files
			bind:this={uploadBtn}
			on:change={handleFiles}
		/>
		<!-- TODO remove 1 file upload limit later -->
		<!-- multiple -->

		{#if files?.length}
			<div class="file-previews" bind:this={preview}>
				<!-- {#each files as fpreview}
					{#if fpreview.type.startsWith('image/')}
						<div class="file-prev">
							<div class="delete">remove</div>
							<img src="{fpreview.url}" alt="">
						</div>
					{/if}
				{/each} -->
			</div>
		{:else}
			<div class="none-shown">upload or drop files here to preview</div>
		{/if}
	</div>
</div>

<style lang="scss">
	.filepicker {
		display: flex;
		height: 100%;

		.options {
			padding-inline: 1rem;
			display: flex;
			flex-direction: column;
			gap: 1rem;
			justify-content: center;

			.option {
				cursor: pointer;
			}
		}
	}

	.preview {
		width: 100%;
		overflow: auto;
		.none-shown {
			width: 100%;
			height: 100%;
			display: grid;
			place-items: center;
		}

		.file-previews {
			display: grid;
			gap: 0.5rem;
			grid-auto-flow: column;

			:global(img) {
				max-height: 33vh;
				border-radius: 0.3rem;
			}
		}
	}

	.file-previews {
		:global(img) {
			max-height: 12rem;
		}
	}
</style>
