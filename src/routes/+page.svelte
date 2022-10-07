<script lang="ts">
	import Counter from './Counter.svelte'
	import type { PageData } from './$types'
	import Planner from './Planner.svelte'

	export let data: PageData
</script>

<section>
	<h1>Whatever Calendar</h1>
	<Planner userData={data.userData} />
	<Counter />
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 0.6;
	}

	h1 {
		width: 100%;
	}
</style>
