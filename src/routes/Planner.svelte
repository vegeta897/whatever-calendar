<script lang="ts">
	import type { UserData } from './+page.server'
	import { enhance } from '$app/forms'
	import Month from './Month.svelte'

	export let userData: UserData

	let weekStart: 0 | 1 = 0
</script>

<section>
	{userData.users}
	<form method="POST" action="?/update" use:enhance>
		<input name="userData" hidden value={JSON.stringify(userData)} />
		<button>Save</button>
	</form>
	<div class="month-container">
		{#each [5, 10, 11, 12] as month}
			<Month year={2022} {month} bind:userData {weekStart} />
		{/each}
	</div>
	<label for="week-start">Start of week:</label>
	<select id="week-start" bind:value={weekStart}>
		<option value={0}>Sunday</option>
		<option value={1}>Monday</option>
	</select>
</section>

<style>
	.month-container {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		margin-bottom: 1rem;
	}
</style>
