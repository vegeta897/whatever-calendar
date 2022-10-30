<script lang="ts">
	export let user: WheneverUser
	export let expanded = false
	export let mini = false
	export let plus = false

	let imgError = false

	$: borderColor = user.color
		? `#${user.color.toString(16).padStart(6, '0')}`
		: ''
	$: backgroundColor = plus
		? ''
		: `#${user.color.toString(16).padStart(6, '0')}`
</script>

<div
	style:border-color={borderColor}
	style:background-color={backgroundColor}
	class:expanded
	class:mini
	class:plus
>
	{#if expanded}
		<svg viewBox="0 0 1 1"><path d="M0.2,0.5 h0.6 M0.5,0.2 v0.6" /></svg>
		<img
			src={user.avatarURL}
			alt="{user.name}'s avatar"
			class:hidden={imgError}
			on:error={() => (imgError = true)}
		/>
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

	div.expanded {
		border-radius: 14px;
		width: 26px;
		height: 26px;
	}

	div.expanded.mini {
		border-radius: 11px;
		width: 22px;
		height: 22px;
	}

	div.plus {
		background: none;
	}

	div:not(.plus) {
		animation-name: bounce;
		animation-duration: 90ms;
	}

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

	.plus img {
		transform: scale(0);
	}

	img.hidden {
		display: none;
	}

	svg {
		position: absolute;
		transition: transform 200ms cubic-bezier(0.39, 1.73, 0.84, 1.11);
	}

	.plus svg {
		display: block;
		width: 20px;
		height: 20px;
		stroke-width: 0.1;
		stroke: #fff;
		fill: none;
	}

	:global(*:hover) > div.plus svg {
		transform: rotate(90deg);
	}

	.plus.mini svg {
		width: 16px;
		height: 16px;
	}

	@keyframes bounce {
		0% {
			transform: scale(1);
		}
		20% {
			transform: scale(0.8);
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
