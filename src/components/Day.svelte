<script lang="ts">
	import type { CalendarDay } from '$lib/calendar'
	import { weekStart, today } from '$lib/calendar'
	import People from './People.svelte'
	import { page } from '$app/stores'

	export let day: CalendarDay
	export let daySelected: CalendarDay | null
	export let dayMarks: MarkData[]
	export let onClick: (day: CalendarDay) => void
	export let firstRow = false

	const myUserID = $page.data.discordMember!.id

	$: myMark = dayMarks.find((m) => m.userID === myUserID)
	$: otherMarks = dayMarks.filter((m) => m.userID !== myUserID)
</script>

<a
	href="/{day === daySelected ? 'calendar' : day.YYYYMMDD}"
	data-sveltekit-prefetch="off"
	on:click|preventDefault={() => {
		onClick(day)
	}}
>
	<li
		class="day"
		class:selected={day === daySelected}
		class:first-column={day.weekday === $weekStart}
		class:no-marks={dayMarks.length === 0}
		class:first-of-month={day.day === 1}
	>
		<div class="month-label">
			{#if day === daySelected || day.day === 1 || (firstRow && day.weekday === $weekStart)}{day
					.datetime.monthShort}{/if}
		</div>
		<div class="day-date" class:day-today={$today.hasSame(day.datetime, 'day')}>
			{day.day}
		</div>
		<div class="day-marks">
			<!-- <People YYYYMMDD={day.YYYYMMDD} count={dayMarks.length + 2} /> -->
			{#if myMark}You{/if}
			{#if otherMarks.length > 0}{#if myMark}
					+
				{/if}{otherMarks.length}{/if}
		</div>
	</li>
</a>

<style>
	a {
		color: var(--color-text);
		display: block;
		width: 100%;
		height: var(--day-height);
		text-decoration: none;
	}

	.day {
		width: 100%;
		height: 100%;
		border-radius: calc(var(--day-height) / 4);
		transition: background-color 50ms ease-out, color 50ms ease-out,
			height 50ms ease-out, border-radius 50ms ease-out;
		position: relative;
		touch-action: manipulation;
		display: flex;
		flex-direction: column;
		align-items: center;
		user-select: none;
		/* background: rgba(0, 0, 0, 0.15); */
	}

	.day.first-of-month {
		background-color: rgba(0, 0, 0, 0.14);
	}

	.day.selected {
		background: rgba(0, 0, 0, 0.25);
		border-bottom-left-radius: 0;
		border-bottom-right-radius: 0;
		padding-bottom: var(--day-row-gap);
	}

	.day:not(.selected):hover {
		background-color: rgba(0, 0, 0, 0.25);
		color: rgba(255, 255, 255, 0.9);
		transition: none;
	}

	.month-label {
		font-size: calc(var(--day-height) * 0.23);
		height: calc(100% / 3);
		color: rgba(255, 255, 255, 0.5);
	}

	.day-date {
		height: calc(100% / 3);
		font-size: calc(var(--day-height) * 0.3);
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		transition: transform 50ms ease-out;
	}

	.day-date.day-today {
		text-decoration: underline;
	}

	.day-marks {
		display: flex;
		color: rgba(255, 255, 255, 0.5);
		align-items: flex-start;
		justify-content: center;
		width: 100%;
		height: calc(100% / 3);
		flex-grow: 1;
		font-size: calc(var(--day-height) * 0.16);
	}
</style>
