<script lang="ts">
	export let user: WheneverUser
	export let avatar = false
	export let mini = false
	export let mark: Mark | null
	export let markable = false

	let imgError = false
</script>

<div
	style:border-color={user.color
		? `#${user.color.toString(16).padStart(6, '0')}`
		: ''}
	style:background-color={mark
		? `#${user.color.toString(16).padStart(6, '0')}`
		: ''}
	class:avatar
	class:mini
	class:unmarked={!mark}
>
	{#if avatar}
		<img
			src={user.avatarURL}
			alt="{user.name}'s avatar"
			class:hidden={imgError}
			on:error={() => (imgError = true)}
		/>
		{#if markable && user.me}
			<svg class="plus" viewBox="0 0 1 1"
				><path d="M0.2,0.5 h0.6 M0.5,0.2 v0.6" /></svg
			>
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
	}

	div.avatar {
		border-radius: 14px;
		width: 26px;
		height: 26px;
	}

	div.avatar.mini {
		border-radius: 11px;
		width: 22px;
		height: 22px;
	}

	div.unmarked {
		background: none;
	}

	/* div:not(.avatar):not(.plus) {
		animation-name: bounce;
		animation-timing-function: ease-out;
		animation-duration: 250ms;
	} */

	img {
		pointer-events: none;
		display: block;
		width: 20px;
		height: 20px;
		border-radius: 10px;
		position: absolute;
		transition: transform 90ms cubic-bezier(0.39, 1.73, 0.84, 1.11);
	}

	.mini img {
		width: 16px;
		height: 16px;
		border-radius: 8px;
	}

	div.unmarked img {
		transform: scale(0);
	}

	img.hidden {
		display: none;
	}

	svg {
		position: absolute;
		transition: transform 200ms cubic-bezier(0.39, 1.73, 0.84, 1.11),
			opacity 100ms ease-out, background-color 100ms ease-out;
	}

	svg {
		display: block;
		width: 20px;
		height: 20px;
		border-radius: 10px;
		stroke-width: 0.1;
		stroke: #fff;
		fill: none;
	}

	:not(.unmarked) svg {
		transform: rotate(0);
		opacity: 0;
	}

	:global(*:hover) > .unmarked svg {
		transform: rotate(90deg);
	}

	:global(*:hover) > :not(.unmarked) svg {
		transform: rotate(-45deg);
		background-color: rgba(0, 0, 0, 0.7);
		opacity: 1;
	}

	@keyframes bounce {
		0% {
			transform: scale(0);
		}
		30% {
			transform: scale(1.2);
		}
		100% {
			transform: scale(1);
		}
	}

	@media (max-width: 640px) {
		div {
			border-width: 2.5px;
			border-radius: 2.5px;
		}
	}
</style>
