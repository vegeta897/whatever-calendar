<script lang="ts">
	import { fade } from 'svelte/transition'

	export let user: WheneverUser
	export let avatar = false
	export let mini = false
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
	class:mini
	class:unmarked
	class:note
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
</div>

<style>
	div {
		background: var(--color-theme-1);
		box-sizing: border-box;
		border: 3px solid var(--color-theme-1);
		border-radius: 6px;
		width: 12px;
		height: 12px;
		margin: 2px;
		position: relative;
		flex-shrink: 0;
	}

	div.me {
		order: -1;
	}

	div.note::after {
		font-size: 24px;
		content: '*';
		color: #fff;
		position: relative;
		top: -11px;
		right: -15px;
		text-shadow: -2px 2px 3px rgba(0, 0, 0, 0.9);
	}

	div.note.mini::after {
		font-size: 20px;
		top: -9px;
		right: -13px;
	}

	div.note:not(.avatar)::after {
		font-size: 14px;
		top: -9px;
		right: -4px;
		text-shadow: -1px 1px 2px rgba(0, 0, 0, 0.5);
	}

	div.avatar {
		border-radius: 13px;
		width: 26px;
		height: 26px;
	}

	div.avatar.mini {
		border-radius: 11px;
		width: 22px;
		height: 22px;
	}

	div.avatar.wumbo {
		width: 40px;
		height: 40px;
		border-radius: 20px;
		border-width: 4px;
	}

	div.unmarked {
		background: none;
	}

	img {
		pointer-events: none;
		display: block;
		width: 20px;
		height: 20px;
		border-radius: 10px;
		position: absolute;
		background: rgba(0, 0, 63, 0.6);
		transition: transform 90ms cubic-bezier(0.39, 1.73, 0.84, 1.11);
	}

	.mini img {
		width: 16px;
		height: 16px;
		border-radius: 8px;
	}

	.wumbo img {
		width: 32px;
		height: 32px;
		border-radius: 16px;
	}

	div.unmarked img {
		transform: scale(0);
	}

	img.hidden {
		display: none;
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
