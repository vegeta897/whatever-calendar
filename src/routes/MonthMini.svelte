<script lang="ts">
	import { onInterval } from '$lib/interval'
	import { days, MONTH_NAMES, weekStart } from '$lib/calendar'
	import { onDestroy } from 'svelte'
	import { browser } from '$app/environment'

	export let year: number
	export let month: number
	export let focused: boolean
	export let onClick: () => {}

	const monthDays = $days.filter(
		(day) => day.year === year && day.month === month
	)
	$: preMonthDays = (7 + monthDays[0].weekday - $weekStart) % 7

	let today = new Date()
	today.setHours(0, 0, 0, 0)

	const updateToday = () => {
		const now = new Date()
		if (now.getDate() !== today.getDate()) {
			now.setHours(0, 0, 0, 0)
			today = now
		}
	}
	if (browser) onInterval(updateToday, onDestroy)
</script>

<div class="month-container" class:focused on:click={onClick}>
	<h2>{MONTH_NAMES[month - 1]}</h2>
	<ol class="month">
		{#each Array(preMonthDays) as _}
			<li class="day out-of-month" />
		{/each}
		{#each monthDays as day}
			<li class="day" class:invalid={day.date < today} />
		{/each}
	</ol>
</div>

<style>
	.month-container {
		box-sizing: border-box;
		border: 2px solid transparent;
		/* background: var(--color-bg-1);
		padding: 1px; */
		flex: 1;
		overflow: hidden;
		transition: border-color 50ms ease-out;
	}

	.month-container.focused {
		border-color: var(--color-theme-1);
	}

	h2 {
		font-size: 1.2em;
		color: rgba(255, 255, 255, 0.4);
		margin: 0.5rem 0;
	}

	.focused h2 {
		color: rgba(255, 255, 255, 0.6);
	}

	.month {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		list-style: none;
		margin: 0;
		padding: 0;
		text-align: center;
		row-gap: 1px;
		column-gap: 1px;
	}

	.day {
		height: 24px;
		background-color: rgba(255, 255, 255, 0.05);
	}
	.focused .day,
	.month-container:hover .day {
		background-color: rgba(255, 255, 255, 0.09);
	}

	.day.invalid {
		background-color: rgba(255, 255, 255, 0.025);
	}
	.focused .day.invalid,
	.month-container:hover .day.invalid {
		background-color: rgba(255, 255, 255, 0.04);
	}

	.day.out-of-month {
		background-color: transparent !important;
	}

	@media (max-width: 480px) {
		.day {
			height: 16px;
		}
	}
</style>
