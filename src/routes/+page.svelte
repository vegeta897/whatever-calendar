<script lang="ts">
	import type { PageData } from './$types'
	import Planner from './Planner.svelte'
	import { browser } from '$app/environment'
	import { weekStart } from '$lib/calendar'

	export let data: PageData

	weekStart.set(data.weekStart || 0)

	if (browser) {
		console.log(data.discordMember || data.discordUser)
		console.log(data.marks)
		console.log(data.users)
	}
</script>

<section>
	<h1><small><span>📅 w</span>/<span>e</span></small>Whenever</h1>
	{#if !data.discordUser}
		<a href="/api/auth" data-sveltekit-prefetch="off" style="font-size: 2em;"
			>Log in!</a
		>
	{:else if !data.discordMember}
		<h2>Something isn't right...</h2>
		<p>
			We can't find <code
				>{data.discordUser.username}#{data.discordUser.discriminator}</code
			>
			in the <strong>Whatever Dudes</strong> server
		</p>
		<p>
			Did you connect the right account?
			<a href="/api/auth" data-sveltekit-prefetch="off">Try again here</a>
		</p>
		<p>
			Or, you can <a href="/api/logout" data-sveltekit-prefetch="off">log out</a
			>
		</p>
	{:else}
		<Planner />
	{/if}
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	h1 {
		width: 100%;
		font-size: 2em;
		margin: 0;
	}

	h1 small {
		font-size: 0.9em;
		margin-right: 0.5em;
		position: relative;
		bottom: 1px;
		background-color: var(--color-theme-1);
		color: var(--color-bg-0);
		padding: 0 3px 0 2px;
		border-radius: 16px;
		border-top-left-radius: 4px;
		border-bottom-left-radius: 4px;
	}

	h1 small span {
		display: inline-block;
		font-size: 0.8em;
		position: relative;
		bottom: 4px;
		left: 1px;
		transform: scaleY(0.95);
	}

	h1 small span:last-child {
		left: -1px;
	}

	h2 {
		font-size: 1.5em;
	}
</style>
