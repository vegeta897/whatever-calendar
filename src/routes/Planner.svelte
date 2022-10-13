<script lang="ts">
	import { enhance } from '$app/forms'
	import Month from './Month.svelte'
	import MonthMini from './MonthMini.svelte'
	import { getDays } from '$lib/calendar'
	import { fade } from 'svelte/transition'
	import { cubicOut } from 'svelte/easing'

	export let discordMember: DiscordMember

	const YEAR = 2022
	const MONTHS = [10, 11, 12]

	let focusedMonth: number = MONTHS[0]
	let tool: 'preferred' | 'possible' = 'preferred'
	let weekStart: 0 | 1 = 0

	// weekStart.subscribe((value) => {
	// 	// Save to user on server? Or in cookie?
	// 	// Save locale in cookie too, to SSR with correct language
	// })

	let days = getDays(YEAR, MONTHS)

	const username = discordMember.nick || discordMember.username
</script>

<section>
	<div class="header">
		<img
			width="24px"
			style="border-radius: 12px;"
			alt="{username}'s avatar"
			src={discordMember.avatarURL}
		/>
		{username}<a href="/api/logout" data-sveltekit-prefetch="off">Log out</a>
	</div>
	<div class="month-select">
		{#each MONTHS as month}
			<MonthMini
				year={YEAR}
				{month}
				{days}
				{weekStart}
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
	<div class="big-month-container">
		{#each MONTHS as month}
			{#if month === focusedMonth}
				<div
					class="big-month"
					transition:fade={{ duration: 100, easing: cubicOut }}
				>
					<Month
						year={YEAR}
						{month}
						{days}
						bind:weekStart
						toolMode={tool === 'preferred' ? 1 : 2}
					/>
				</div>
			{/if}
		{/each}
	</div>
</section>

<style>
	section {
		width: 100%;
	}

	.header {
		display: flex;
		align-items: center;
		gap: 0.4em;
	}

	.month-select {
		display: flex;
		flex-wrap: wrap;
		gap: 2%;
		width: 100%;
		margin: 1rem 0;
	}

	.big-month-container {
		margin-bottom: 1rem;
		display: grid;
	}

	.big-month {
		width: 100%;
		grid-area: 1 / 1 /2 /2;
	}
</style>
