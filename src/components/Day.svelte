<script lang="ts">
	import type { CalendarDay } from '$lib/calendar'
	import { weekStart, sameDay, today, MONTH_ABBREV } from '$lib/calendar'
	import { crossfade } from 'svelte/transition'
	import Dot from './Dot.svelte'
	import { page } from '$app/stores'

	export let day: CalendarDay
	export let daySelected: CalendarDay | null
	export let dayMarks: Mark[]
	export let onClick: (day: CalendarDay) => void

	$: users = $page.data.users!

	let hover = false

	// Crossfading expanded day views
	const [send, receive] = crossfade({ duration: 50 })
</script>

<li
	class="day"
	on:mouseenter={() => (hover = true)}
	on:mouseleave={() => (hover = false)}
	class:expanded={hover && day !== daySelected}
	class:selected={day === daySelected}
	class:weekend={day.weekend}
	class:first-column={day.weekday === $weekStart}
	on:click={() => onClick(day)}
>
	{#if sameDay(day.date, $today) || day.day === 1}
		{#if day.day === 1 && day.weekday !== $weekStart}
			<div class="month-divider" />
		{/if}
		<div class="month-label">{MONTH_ABBREV[day.month]}</div>
	{/if}
	<div class="day-date" class:day-today={sameDay(day.date, $today)}>
		{day.day}
	</div>
	<div class="day-marks">
		{#if hover && day !== daySelected}
			<div
				class="day-marks-large"
				class:four-marks={dayMarks.length === 4}
				class:six-marks={dayMarks.length === 6}
				in:send={{ key: day.YYYYMMDD }}
				out:receive={{ key: day.YYYYMMDD }}
			>
				{#each dayMarks as mark, i (mark.userID)}<Dot
						avatar={true}
						mini={dayMarks.length >= 7}
						user={users[mark.userID]}
					/>{/each}
			</div>
		{:else}
			<div
				class="day-marks-small"
				class:six-marks={dayMarks.length >= 5}
				class:eight-marks={dayMarks.length >= 7}
				class:ten-marks={dayMarks.length >= 9}
				class:twelve-marks={dayMarks.length >= 11}
				in:send={{ key: day.YYYYMMDD }}
				out:receive={{ key: day.YYYYMMDD }}
			>
				{#each dayMarks as mark (mark.userID)}
					<Dot user={users[mark.userID]} />
				{/each}
			</div>
		{/if}
	</div>
</li>

<style>
	.day {
		width: calc(100%);
		height: 116px;
		box-sizing: border-box;
		border-radius: 20px;
		border: 3px solid transparent;
		/* background-color: rgba(255, 255, 255, 0.06); */
		transition: background-color 50ms ease-out, color 50ms ease-out,
			height 50ms ease-out, margin-bottom 50ms ease-out,
			border-radius 50ms ease-out;
		position: relative;
		touch-action: manipulation;
		display: flex;
		flex-direction: column;
		/* justify-content: space-between; */
		align-items: center;
		cursor: pointer;
		user-select: none;
	}

	.day-date.day-today {
		text-decoration: underline;
	}

	.day.selected {
		/* border-color: var(--color-user); */
		background: rgba(0, 0, 0, 0.25);
		border-bottom-left-radius: 0;
		border-bottom-right-radius: 0;
		height: 124px;
		margin-bottom: -8px;
	}

	.day.expanded {
		background-color: rgba(0, 0, 0, 0.25);
		color: rgba(255, 255, 255, 0.9);
		transition: none;
	}

	.month-label {
		font-size: 1.5em;
		color: rgba(255, 255, 255, 0.5);
		position: absolute;
		top: -3px;
		transition: opacity 50ms ease-out;
	}

	.day:not(.selected):not(.expanded) .month-divider {
		position: absolute;
		height: 55px;
		width: 3px;
		border-radius: 1.5px;
		top: 26px;
		left: -4px;
		background: rgba(255, 255, 255, 0.25);
		pointer-events: none;
		transition: opacity 50ms ease-out;
	}
	.day.expanded .month-label,
	.day.selected .month-divider,
	.day.expanded .month-divider {
		opacity: 0;
	}

	.day-date {
		font-size: 2.2em;
		position: absolute;
		height: 110px; /* Height of .day less padding */
		display: flex;
		justify-content: center;
		align-items: center;
		transform: translateY(-4px);
		transition: transform 50ms ease-out;
	}

	.day.expanded .day-date {
		/* padding-top: 0; */
		transform: translateY(-32px);
	}

	/* TODO: Don't animate dots, just fade/swipe between expanded and normal views */

	.day-marks {
		display: grid;
		grid-template-rows: 1fr;
		grid-template-columns: 1fr;
		justify-items: center;
		margin-top: 50%;
		height: 50%;
	}

	.day-marks-small,
	.day-marks-large {
		width: 100%;
		height: 100%;
		display: flex;
		flex-wrap: wrap;
		align-content: center;
		justify-content: center;
		grid-row: 1;
		grid-column: 1;
	}

	.day-marks-small {
		transform: translateY(6px);
	}

	.day-marks-large {
		transform: translateY(-10px);
	}

	.day-marks-small.six-marks {
		width: 48px;
	}

	.day-marks-small.eight-marks {
		width: 64px;
	}

	.day-marks-small.ten-marks {
		width: 80px;
	}

	.day-marks-small.twelve-marks {
		width: 96px;
	}

	.day-marks-large.four-marks {
		width: 60px;
	}

	.day-marks-large.six-marks {
		width: 90px;
	}
</style>
