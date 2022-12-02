<script lang="ts">
	import type { PageData } from './$types'
	import { browser } from '$app/environment'

	export let data: PageData

	if (browser) console.log(data)
</script>

<section>
	{#if !data.discordUser}
		<a
			href="/api/auth"
			data-sveltekit-prefetch="off"
			style="font-size: 2em; margin-top: 1em;">Sign in!</a
		>
	{:else}
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
	{/if}
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	h2 {
		font-size: 1.5em;
	}
</style>
