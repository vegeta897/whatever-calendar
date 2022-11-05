<script lang="ts">
	import {
		getWeekdayNames,
		mondayName,
		sundayName,
		weekStart,
		days,
		getPreDays,
		today,
	} from '$lib/calendar'
	import type { CalendarDay } from '$lib/calendar'
	import { page } from '$app/stores'
	import Day from './Day.svelte'
	import { goto } from '$app/navigation'
	import DayDetail from './DayDetail.svelte'

	const myUserID = $page.data.discordMember!.id
	$: marks = $page.data.marks!

	// WHAT I'VE LEARNED ABOUT REACTIVITY AND BINDING
	// If you have a reactive variable, and bind it to a component,
	// any update made to it in that component will re-run the reactive statement
	// regardless of the dependencies of the reactive statement

	$: weekdayNames = getWeekdayNames($weekStart)

	export let daySelected: CalendarDay | null = null

	$: preDays = getPreDays($days, $today, $weekStart)

	function dayOnClick(day: CalendarDay) {
		const newSlug = day === daySelected ? 'calendar' : day.YYYYMMDD
		goto(`/${newSlug}`, { noscroll: true, replaceState: true })
	}
</script>

<!-- TODO: Affix header to top of page when scrolled out of view -->
<div class="header">
	<div>
		<label for="week-start">Start of week:</label>
		<select id="week-start" bind:value={$weekStart}>
			<!-- Use selected property to show correct option on intial render -->
			<option selected={$weekStart === 0} value={0}>{sundayName}</option>
			<option selected={$weekStart === 1} value={1}>{mondayName}</option>
		</select>
	</div>
</div>
<div class="calendar">
	<ol class="month">
		{#each weekdayNames as weekdayName}
			<li class="weekday">{weekdayName}</li>
		{/each}
		{#each preDays as day (day)}<li class="pre-day">
				<div class="day-date">{day}</div>
			</li>{/each}
		{#each $days as day, i (day.YYYYMMDD)}
			{@const dayMarks = marks.filter((mark) => mark.YYYYMMDD === day.YYYYMMDD)}
			{#if day.date >= $today}
				<Day {day} bind:daySelected {dayMarks} onClick={dayOnClick} />
			{/if}
			{#if daySelected && day.weekday === ($weekStart + 7 - 1) % 7 && $days.indexOf(day) >= $days.indexOf(daySelected) && $days.indexOf(day) < $days.indexOf(daySelected) + 7}
				<DayDetail
					day={daySelected}
					marks={marks.filter((m) => m.YYYYMMDD === daySelected?.YYYYMMDD)}
				/>
			{/if}
		{/each}
	</ol>
</div>

<style>
	.header {
		width: 100%;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		margin: 0.8rem 0;
	}

	.header label {
		margin-right: 0.2em;
	}

	.calendar {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.month {
		display: grid;
		grid-template-columns: repeat(7, 116px);
		row-gap: 8px;
		column-gap: 8px;
		list-style: none;
		margin: 0;
		padding: 0;
		justify-items: center;
	}

	.weekday {
		font-size: 1.2em;
		margin: 0.5rem 0;
		color: rgba(255, 255, 255, 0.4);
	}

	.pre-day {
		color: rgba(255, 255, 255, 0.2);
		cursor: default;
		user-select: none;
		font-size: 2.2em;
		height: 114px;
		transform: translateY(-3px);
		display: flex;
		align-items: center;
	}

	@media (max-width: 640px) {
		/* TODO: This all needs to be redone */
		ol {
			grid-template-columns: repeat(7, 45px);
			row-gap: 4px;
			column-gap: 4px;
		}
	}
</style>