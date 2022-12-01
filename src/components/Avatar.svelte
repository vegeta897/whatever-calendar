<script lang="ts">
	import { fade } from 'svelte/transition'

	export let size = '3rem'
	export let user: WheneverUser
	export let unmarked = false
	export let markable = false
	export let responsive = false

	let imgError = false
</script>

<div style="--size: {size}" class:unmarked class:responsive>
	<img
		src={user.avatarURL}
		alt="{user.name}'s avatar"
		class:hidden={imgError}
		on:error={() => (imgError = true)}
	/>
	{#if markable && user.me}
		<svg
			version="1.1"
			xmlns="http://www.w3.org/2000/svg"
			transition:fade|local={{ duration: 100 }}
			class="plus"
			viewBox="0 0 1 1"
		>
			<path d="M0.2,0.5 h0.6 M0.5,0.2 v0.6" />
		</svg>
	{/if}
</div>

<style>
	div {
		background: var(--color-bg);
		border: 1px solid var(--color-fg);
		border-radius: 50%;
		width: var(--size);
		height: var(--size);
		position: relative;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-shrink: 0;
	}

	img {
		pointer-events: none;
		display: block;
		width: 75%;
		height: 75%;
		border-radius: 50%;
		position: absolute;
		background: var(--color-bg);
		transition: transform 90ms cubic-bezier(0.39, 1.73, 0.84, 1.11);
	}

	.hidden {
		display: none;
	}

	div.unmarked img {
		transform: scale(0);
	}

	svg.plus {
		position: absolute;
		transition: transform 200ms cubic-bezier(0.39, 1.73, 0.84, 1.11),
			opacity 100ms ease-out, background-color 100ms ease-out;
		display: block;
		width: 100%;
		height: 100%;
		border-radius: 50%;
		stroke-width: 0.1;
		stroke: var(--color-fg);
		fill: none;
	}

	:not(.unmarked) svg.plus {
		transform: rotate(0);
		opacity: 0;
	}

	:global(*:hover) > .unmarked svg.plus {
		transform: rotate(90deg);
	}

	:global(*:hover) > :not(.unmarked) svg.plus {
		transform: rotate(-45deg);
		background-color: var(--color-bg);
		opacity: 1;
	}

	@media (max-width: 30rem) {
		/* 480px */
		div.responsive {
			--size: 2rem !important;
		}
	}
</style>
