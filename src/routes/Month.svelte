<script lang="ts">
	import { offInterval, onInterval } from '$lib/interval'
	import { getMonthData } from '$lib/month'
	import type { CalendarDay } from '$lib/month'
	import { onDestroy } from 'svelte'
	import type { UserData } from './+page.server'

	export let year: number
	export let month: number
	export let weekStart: 0 | 1
	export let userData: UserData

	$: monthData = getMonthData(year, month, weekStart)

	let marking = false
	let unmarking = false

	// TODO: Need to listen to mouse events outside of day boxes

	function dayClick(day: CalendarDay, e: MouseEvent) {
		if (e.button !== 0) return
		day.marked = !day.marked
		monthData.days = monthData.days
		userData = { users: ['hi'] }
	}

	function mouseDown(day: CalendarDay, e: PointerEvent) {
		if (e.button !== 0) return
		if (day.date < today) return
		console.log('drag start', day)
		if (day.marked) {
			unmarking = true
			day.marked = false
		} else {
			marking = true
			day.marked = true
		}
		monthData.days = monthData.days
	}
	function mouseEnter(day: CalendarDay, e: PointerEvent) {
		if (!marking && !unmarking) return
		console.log(e.button, e.buttons)
		if ((e.buttons & 1) === 0) {
			marking = false
			unmarking = false
			return
		}
		day.marked = marking
		monthData.days = monthData.days
	}
	function mouseUp(day: CalendarDay, e: PointerEvent) {
		if (e.button !== 0) return
		if (!marking && !unmarking) return
		marking = false
		unmarking = false
		console.log('drag stop', day)
		userData = { users: ['hi'] }
	}

	function outOfMonth(e: PointerEvent) {
		if ((e.buttons & 1) === 0) return
		if (!marking && !unmarking) return
		marking = false
		unmarking = false
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

<h2>{monthData.name}</h2>
<ol class="weekdays">
	{#each monthData.weekdayNames as weekdayName}
		<li class="weekday">{weekdayName}</li>
	{/each}
</ol>
<ol class="month" on:pointerleave={outOfMonth}>
	{#each monthData.days as day, i}
		<!-- <li
				class="day"
				on:click={(e) => dayClick(day, e)}
				class:weekend={day.weekend}
				class:marked={day.marked}
				class:invalid={day.date < today}
			>
				{day.day}
			</li> -->

		<li
			class="day"
			on:pointerdown={(e) => mouseDown(day, e)}
			on:pointerup={(e) => mouseUp(day, e)}
			on:pointerenter={(e) => mouseEnter(day, e)}
			class:weekend={day.weekend}
			class:marked={day.marked}
			class:invalid={day.date < today}
			class:out-of-month={!day.inMonth}
		>
			{day.day}
		</li>
	{/each}
</ol>

<style>
	h2 {
		text-align: center;
		font-size: 1.5em;
		margin: 1rem 0;
	}

	ol {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		list-style: none;
		margin: 0;
		padding: 0;
		text-align: center;
	}

	.weekdays {
		margin-bottom: 0.8rem;
		color: rgba(255, 255, 255, 0.6);
	}

	.month {
		row-gap: 1px;
		column-gap: 1px;
	}

	.day {
		height: 60px;
		box-sizing: border-box;
		background-color: rgba(255, 255, 255, 0.06);
		display: flex;
		flex-wrap: wrap;
		align-content: center;
		justify-content: center;
		cursor: default;
		user-select: none;
		transition: background-color 50ms ease-out;
		/* touch-action: none; */
	}

	.day.weekend {
		background-color: rgba(255, 255, 255, 0.1);
	}

	.day.marked {
		border-top: 5px solid var(--color-theme-1);
	}

	.day.out-of-month {
		background-color: rgba(255, 255, 255, 0.03);
	}

	.day.invalid {
		background-color: rgba(255, 255, 255, 0.02) !important;
		color: rgba(255, 255, 255, 0.25) !important;
	}

	.day.out-of-month.invalid {
		background-color: rgba(255, 255, 255, 0.008) !important;
	}

	.day:hover {
		background-color: rgba(255, 255, 255, 0.16);
		color: rgba(255, 255, 255, 0.9);
		transition: none;
	}

@media (max-width: 480px) {
	.day {
		height: 40px;
	}
}
</style>
