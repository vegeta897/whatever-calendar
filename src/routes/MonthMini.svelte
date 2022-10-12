<script lang="ts">
	import { offInterval, onInterval } from '$lib/interval'
	import { getMonthData } from '$lib/month'
	import { onDestroy } from 'svelte'

	export let year: number
	export let month: number
	export let weekStart: 0 | 1
	export let focused: boolean
	export let onClick: () => {}

	$: monthData = getMonthData(year, month, weekStart)

	let today = new Date()
	today.setHours(0, 0, 0, 0)
	$: today

	const updateToday = () => {
		const now = new Date()
		if (now.getDate() !== today.getDate()) {
			now.setHours(0, 0, 0, 0)
			today = now
		}
	}
	onInterval(updateToday)
	onDestroy(() => offInterval(updateToday))
</script>

<div class="month-container" class:focused on:click={onClick}>
	<h2>{monthData.name}</h2>
	<ol class="month">
		{#each monthData.days as day, i}
			<li
				class="day"
				class:invalid={day.date < today}
				class:out-of-month={!day.inMonth}
			/>
		{/each}
	</ol>
</div>

<style>
	.month-container {
		box-sizing: border-box;
		border: 2px solid transparent;
		flex: 1;
		overflow: hidden;
		transition: border-color 50ms ease-out;
	}

	.month-container.focused {
		border-color: var(--color-theme-1);
	}

	h2 {
		text-align: center;
		font-size: 1em;
		color: rgba(255, 255, 255, 0.6);
		margin: 0.5rem 0;
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
