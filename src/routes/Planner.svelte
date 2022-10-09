<script lang="ts">
	import type { UserData } from './+page.server'
	import { enhance } from '$app/forms'
	import Month from './Month.svelte'
	import MonthMini from './MonthMini.svelte'
	import { mondayName, sundayName, weekStart } from '$lib/month'

	export let userData: UserData

	const MONTHS = [10, 11, 12]
	let focusedMonth: number = MONTHS[0]
</script>

<section>
	{userData.users}
	<form method="POST" action="?/update" use:enhance>
		<input name="userData" hidden value={JSON.stringify(userData)} />
		<button>Save</button>
	</form>
	<div class="month-select">
		{#each MONTHS as month}
			<div
				class="month-container"
				class:focused={focusedMonth === month}
				on:click={() => (focusedMonth = month)}
			>
				<MonthMini year={2022} {month} bind:userData weekStart={$weekStart} />
			</div>
		{/each}
	</div>
	<div class="focused-month">
		<Month
			year={2022}
			month={focusedMonth}
			bind:userData
			weekStart={$weekStart}
		/>
	</div>

	<label for="week-start">Start of week:</label>
	<select id="week-start" bind:value={$weekStart}>
		<option value={0}>{sundayName}</option>
		<option value={1}>{mondayName}</option>
	</select>
</section>

<style>
	section {
		width: 100%;
	}

	.month-select {
		display: flex;
		flex-wrap: wrap;
		gap: 2%;
		width: 100%;
	}

	.month-container {
		box-sizing: border-box;
		border: 2px solid transparent;
		flex: 1;
	}

	.month-container.focused {
		border-color: var(--color-theme-1);
	}

	.focused-month {
		margin-bottom: 1rem;
	}
</style>
