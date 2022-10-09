<script lang="ts">
	import { offInterval, onInterval } from '$lib/images/interval'
	import { onDestroy } from 'svelte'
	import type { UserData } from './+page.server'

	export let year: number
	export let month: number
	export let weekStart: 0 | 1
	export let userData: UserData

	const monthStart = new Date()
	monthStart.setHours(0, 0, 0, 0)
	monthStart.setFullYear(year)
	monthStart.setMonth(month - 1)
	monthStart.setDate(1)

	$: firstDayColumn = ((7 + monthStart.getDay() - weekStart) % 7) + 1

	const monthName = monthStart.toLocaleString('default', { month: 'long' })

	type CalendarDay = {
		date: Date
		day: number
		selected: boolean
		weekend: boolean
	}

	const dayLooper = new Date(monthStart)
	let days: CalendarDay[] = []
	while (dayLooper.getMonth() === month - 1) {
		days.push({
			date: new Date(dayLooper),
			day: dayLooper.getDate(),
			selected: false,
			weekend: [0, 6].includes(dayLooper.getDay()),
		})
		dayLooper.setDate(dayLooper.getDate() + 1)
	}

	let selecting = false
	function mouseDown(day: CalendarDay) {
		if (day.date < today) return
		console.log('drag start', day)
		selecting = true
		day.selected = true
		days = days
	}
	function mouseEnter(day: CalendarDay) {
		if (!selecting) return
		day.selected = true
		days = days
	}
	function mouseUp(day: CalendarDay) {
		if (!selecting) return
		selecting = false
		console.log('drag stop', day)
		userData = { users: ['hi'] }
	}

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

<div>
	<h2>{monthName}</h2>
	<ol class="month" style="--first-day: {firstDayColumn}">
		{#each days as day, i}
			<li
				class="day"
				class:weekend={day.weekend}
				on:mousedown={() => mouseDown(day)}
				on:mouseup={() => mouseUp(day)}
				on:mouseenter={() => mouseEnter(day)}
				class:selected={day.selected}
				class:invalid={day.date < today}
			>
				{day.day}
			</li>
		{/each}
	</ol>
</div>

<style>
	h2 {
		text-align: center;
		font-size: 1.5em;
	}

	.month {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		list-style: none;
		margin: 0;
		padding: 0;
		text-align: center;
	}

	.day {
		width: 50px;
		height: 50px;
		border: 1px solid rgba(255, 255, 255, 0.05);
		margin-left: -1px;
		margin-top: -1px;
		box-sizing: border-box;
		background-color: rgba(255, 255, 255, 0.05);
		display: flex;
		flex-wrap: wrap;
		align-content: center;
		justify-content: center;
		cursor: default;
		user-select: none;
		transition: background-color 50ms ease-out;
	}

	.day.selected {
		border-top: 5px solid var(--color-theme-1);
	}

	.day.invalid {
		background-color: transparent !important;
		color: rgba(255, 255, 255, 0.3) !important;
	}

	.day.weekend {
		background-color: rgba(255, 255, 255, 0.1);
	}

	.day:hover {
		background-color: rgba(255, 255, 255, 0.16);
		color: rgba(255, 255, 255, 0.9);
		transition: none;
	}

	.day:first-child {
		grid-column-start: var(--first-day);
	}
</style>
