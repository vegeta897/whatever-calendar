<script lang="ts">
	import { offInterval, onInterval } from '$lib/interval'
	import { getMonthData } from '$lib/month'
	import { onDestroy } from 'svelte'

	export let year: number
	export let month: number
	export let weekStart: 0 | 1

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

<div class="month-container">
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

	.day.invalid {
		background-color: rgba(255, 255, 255, 0.025);
	}

	.day.out-of-month {
		background-color: transparent;
	}

	@media (max-width: 480px) {
		.day {
			height: 16px;
		}
	}
</style>
