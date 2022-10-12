<script lang="ts">
	import { enhance } from '$app/forms'
	import Month from './Month.svelte'
	import MonthMini from './MonthMini.svelte'
	import { mondayName, sundayName, weekStart } from '$lib/month'

	export let discordMember: DiscordMember

	const MONTHS = [10, 11, 12]
	let focusedMonth: number = MONTHS[0]
	let tool: 'preferred' | 'possible' = 'preferred'

	const username = discordMember.nick || discordMember.username
</script>

<section>
	<img
		width="24px"
		style="border-radius: 12px;"
		alt="{username}'s avatar"
		src={discordMember.avatarURL}
	/>
	{username}<a href="/api/logout" data-sveltekit-prefetch="off">Log out!</a>
	<form method="POST" action="?/update" use:enhance>
		<!-- <input name="userData" hidden value={JSON.stringify(userData)} /> -->
		<button>Save</button>
	</form>
	<div class="month-select">
		{#each MONTHS as month}
			<MonthMini
				year={2022}
				{month}
				weekStart={$weekStart}
				focused={focusedMonth === month}
				onClick={() => (focusedMonth = month)}
			/>
		{/each}
	</div>
	<div class="tools">
		<label>
			<input type="radio" bind:group={tool} name="tool" value="preferred" />
			Preferred
		</label>
		<label>
			<input type="radio" bind:group={tool} name="tool" value="possible" />
			Possible
		</label>
	</div>
	<div class="focused-month">
		<Month
			year={2022}
			month={focusedMonth}
			weekStart={$weekStart}
			toolMode={tool === 'preferred' ? 1 : 2}
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
		margin: 1rem 0;
	}

	.focused-month {
		margin-bottom: 1rem;
	}
</style>
