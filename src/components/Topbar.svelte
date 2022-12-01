<script lang="ts">
	import { now } from '$lib/calendar'
	import { invalidateAll } from '$app/navigation'
	import { page } from '$app/stores'
	import { browser } from '$app/environment'
	import { saving } from './Calendar.svelte'
</script>

<section>
	<!-- <div class="user-info">
		<UserInfo />
	</div> -->
	<div class="hud">
		<div class="clock">
			<time datetime={$now.toISO({ includeOffset: false })}>
				{$now.toFormat('f')}
			</time>
			{$now.offsetNameLong}
		</div>
		<div class="refresh">
			{#if browser}
				<button
					on:click={async () => {
						saving.set(true)
						await invalidateAll()
						saving.set(false)
					}}
				>
					Refresh
				</button>
			{:else}
				<a href={$page.url.href}>Refresh</a>
			{/if}
		</div>
	</div>
</section>

<style>
	section {
		width: 100%;
		height: 4.5rem;
		display: flex;
		/* flex-wrap: wrap; */
		align-items: center;
		justify-content: space-between;
		margin: 0 0 0.8rem;
		position: sticky;
		top: 1px;
		z-index: 9999;
		background: var(--color-bg);
		box-shadow: -2px 3px 8px 8px var(--color-bg);

		/* TODO: Parent should have minimum 100vh height so sidebar can show fully */
	}

	section > div {
		height: 100%;
		box-sizing: border-box;
		background: var(--color-bg);
		border-radius: 1rem;
		padding: 0 1.1875rem;
		box-shadow: 0 0 0 1px var(--color-fg);
	}

	section > div + div {
		margin-left: 1rem;
	}

	.hud {
		flex-grow: 1;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
	}

	.clock {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
	}

	.clock time {
		font-size: 1.1em;
	}

	.refresh button,
	.refresh a {
		display: flex;
		align-items: center;
		color: var(--color-fg);
		background: var(--color-bg);
		box-shadow: 0 0 0 1px var(--color-fg);
		border-radius: 0.5rem;
		padding: 0.4375rem 0.875rem;
		border: none;
		cursor: pointer;
		text-decoration: none;
		transition: background-color 80ms ease-out, color 80ms ease-out,
			opacity 80ms ease-out;
	}

	.refresh button:hover,
	.refresh a:hover {
		color: var(--color-bg);
		background: var(--color-fg);
		transition: none;
	}

	.refresh button:active,
	.refresh a:active {
		opacity: 0.5;
	}

	.refresh button:disabled {
		opacity: 0.5;
	}

	@media (max-width: 30rem) {
		/* 480px */
		section {
			font-size: 0.75rem;
		}
	}
</style>
