<script lang="ts">
	import { fade } from 'svelte/transition'

	export let user: WheneverUser
	export let avatar = false
	export let unmarked = false
	export let markable = false
	export let note = false
	export let wumbo = false

	let imgError = false

	// TODO: Split this into Dot and Avatar. Too much conditional CSS!
	// Maybe also make Markable that has Avatar inside it
</script>

<div
	style:border-color={user.color}
	style:background-color={unmarked ? '' : user.color}
	class:avatar
	class:unmarked
	class:wumbo
	class:me={user.me}
>
	{#if avatar}
		<img
			src={user.avatarURL}
			alt="{user.name}'s avatar"
			class:hidden={imgError}
			on:error={() => (imgError = true)}
		/>
		{#if markable && user.me}
			<svg transition:fade={{ duration: 100 }} class="plus" viewBox="0 0 1 1">
				<path d="M0.2,0.5 h0.6 M0.5,0.2 v0.6" />
			</svg>
		{/if}
	{/if}
	{#if note}
		<span class="note">*</span>
	{/if}
</div>

<style>
	div {
		background: var(--color-theme-1);
		box-sizing: border-box;
		border: calc(var(--dot-size) / 7) solid var(--color-theme-1);
		border-radius: 50%;
		width: var(--dot-size);
		height: var(--dot-size);
		margin: calc(0.125rem * var(--dot-scale));
		position: relative;
		flex-shrink: 0;
	}

	div.me {
		order: -1;
	}

	div .note {
		font-size: var(--dot-size);
		color: #fff;
		position: absolute;
		top: -75%;
		right: -50%;
		text-shadow: calc(var(--dot-size) / -8) calc(var(--dot-size) / 8)
			calc(var(--dot-size) / 6) #0008;
	}

	div.unmarked {
		background: none;
	}

	img {
		pointer-events: none;
		display: block;
		width: 100%;
		height: 100%;
		border-radius: 50%;
		position: absolute;
		background: rgba(0, 0, 63, 0.6);
		transition: transform 90ms cubic-bezier(0.39, 1.73, 0.84, 1.11);
	}

	img.hidden {
		display: none;
	}

	@media (max-width: 30rem) {
		:not(.wumbo) img {
			display: none;
		}

		.note {
			display: none;
		}
	}

	div.unmarked img {
		transform: scale(0);
	}

	svg.plus {
		position: absolute;
		transition: transform 200ms cubic-bezier(0.39, 1.73, 0.84, 1.11),
			opacity 100ms ease-out, background-color 100ms ease-out;
		display: block;
		width: 32px;
		height: 32px;
		border-radius: 16px;
		stroke-width: 0.1;
		stroke: #fff;
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
		background-color: rgba(0, 0, 0, 0.7);
		opacity: 1;
	}
</style>
