<script lang="ts">
	import type { UserData } from './+page.server'

	export let year: number
	export let month: number
	export let userData: UserData

	const monthStart = new Date()
	monthStart.setHours(0, 0, 0, 0)
	monthStart.setFullYear(year)
	monthStart.setMonth(month - 1)
	monthStart.setDate(1)

	const firstDayColumn = monthStart.getDay() + 1
	const monthName = monthStart.toLocaleString('default', { month: 'long' })

	type CalendarDay = {
		date: Date
		day: number
		selected: boolean
	}

	const day = new Date(monthStart)
	const days: CalendarDay[] = []
	while (day.getMonth() === month - 1) {
		days.push({ date: new Date(day), day: day.getDate(), selected: false })
		day.setDate(day.getDate() + 1)
	}

	let spanStart: number | null = null // Index in days array
	let spanEnd: number | null = null

	function mouseDown(day: CalendarDay) {
		console.log('dragging!', day)
		spanStart = days.indexOf(day)
	}
	function mouseUp(day: CalendarDay) {
		console.log('drag stop!', day)
		spanEnd = days.indexOf(day)
		for (let i = spanStart!; i <= spanEnd; i++) {
			days[i].selected = true
		}
		userData = { users: ['hi'] }
	}
</script>

<div>
	<h2>{monthName}</h2>
	<ol class="month" style="--first-day: {firstDayColumn}">
		{#each days as day, i}
			<li
				class="day"
				on:mousedown={() => mouseDown(day)}
				on:mouseup={() => mouseUp(day)}
				class:selected={day.selected}
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
		width: 40px;
		height: 40px;
		border: 0.5px solid rgba(255, 255, 255, 0.05);
		box-sizing: border-box;
		background-color: rgba(255, 255, 255, 0.05);
		display: flex;
		flex-wrap: wrap;
		align-content: center;
		justify-content: center;
		cursor: default;
		user-select: none;
		transition: background-color 0.1s ease-out;
	}

	.day.selected {
		border-top: 5px solid var(--color-theme-1);
	}

	.day:hover {
		background-color: rgba(255, 255, 255, 0.15);
		transition: none;
	}

	.day:first-child {
		grid-column-start: var(--first-day);
	}
</style>
