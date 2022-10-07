<script lang="ts">
	import type { UserData } from './+page.server'
	import { enhance } from '$app/forms'
	import Month from './Month.svelte'

	export let userData: UserData
</script>

<section>
	{userData.users}
	<form method="POST" action="?/update" use:enhance>
		<input name="userData" hidden value={JSON.stringify(userData)} />
		<button>Save</button>
	</form>
	<div class="month-container">
		{#each [10, 11, 12] as month}
			<Month year={2022} {month} bind:userData />
		{/each}
	</div>
</section>

<style>
	.month-container {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
	}
</style>
