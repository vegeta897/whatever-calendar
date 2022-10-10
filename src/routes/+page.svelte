<script lang="ts">
	import type { PageData } from './$types'
	import Planner from './Planner.svelte'
	import { browser } from '$app/environment'
	import { weekStart } from '$lib/month'

	export let data: PageData

	if (data.weekStart !== undefined) weekStart.set(+data.weekStart as 0 | 1)
	if (browser) {
		weekStart.subscribe((value) => (document.cookie = `wec-weekStart=${value}`))
	}
</script>

<section>
	<h1>Whenever</h1>
	<Planner userData={data.userData} />
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		align-items: center;
		flex: 0.6;
	}

	h1 {
		width: 100%;
		font-size: 2em;
		margin: 0 0 1rem;
	}
</style>
