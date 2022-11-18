<script lang="ts">
	import type { CalendarDay } from '$lib/calendar'
	import { weekStart, today } from '$lib/calendar'
	import { crossfade } from 'svelte/transition'
	import Dot from './Dot.svelte'
	import { page } from '$app/stores'
	import { browser } from '$app/environment'

	export let day: CalendarDay
	export let daySelected: CalendarDay | null
	export let dayMarks: MarkData[]
	export let onClick: (day: CalendarDay) => void

	$: users = $page.data.users!

	let hover = false
	const noJS = !browser

	// Crossfading expanded day views
	const [send, receive] = crossfade({ duration: 50 })
</script>

<a
	href="/{day === daySelected ? 'calendar' : day.YYYYMMDD}"
	data-sveltekit-prefetch="off"
	on:click|preventDefault={() => {
		// hover = false
		onClick(day)
	}}
>
	<li
		class="day"
		on:mouseenter={() => (hover = true)}
		on:mouseleave={() => (hover = false)}
		class:selected={day === daySelected}
		class:first-column={day.weekday === $weekStart}
		class:noJS
		class:no-marks={dayMarks.length === 0}
	>
		{#if $today.hasSame(day.datetime, 'day') || day.day === 1}
			{#if day.day === 1 && day.weekday !== $weekStart}
				<div class="month-divider" />
			{/if}
			<div class="month-label">{day.datetime.monthShort}</div>
		{/if}
		<div class="day-date" class:day-today={$today.hasSame(day.datetime, 'day')}>
			{day.day}
		</div>
		<div class="day-marks">
			{#if (hover && day !== daySelected) || noJS}
				<div
					class="day-marks-large"
					class:four-marks={dayMarks.length === 4}
					class:ten-marks={dayMarks.length >= 9}
					class:twelve-marks={dayMarks.length >= 11}
					in:send={{ key: day.YYYYMMDD }}
					out:receive={{ key: day.YYYYMMDD }}
				>
					{#each dayMarks as mark (mark.userID)}<Dot
							avatar={dayMarks.length <= 8}
							mini={dayMarks.length >= 7}
							user={users[mark.userID]}
							note={!!mark.note}
						/>{/each}
				</div>
			{/if}
			{#if !hover || day === daySelected || noJS}
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
						<Dot user={users[mark.userID]} note={!!mark.note} />
					{/each}
				</div>
			{/if}
		</div>
	</li>
</a>

<style>
	a {
		color: var(--color-text);
		display: block;
		width: 100%;
		height: 7.25rem;
		text-decoration: none;
	}

	.day {
		width: 100%;
		height: 100%;
		border-radius: 1.5rem;
		transition: background-color 50ms ease-out, color 50ms ease-out,
			height 50ms ease-out, margin-bottom 50ms ease-out,
			border-radius 50ms ease-out;
		position: relative;
		touch-action: manipulation;
		display: flex;
		flex-direction: column;
		align-items: center;
		user-select: none;
	}

	.day.selected {
		background: rgba(0, 0, 0, 0.25);
		border-bottom-left-radius: 0;
		border-bottom-right-radius: 0;
		height: 7.75rem;
	}

	.day:not(.selected):hover {
		background-color: rgba(0, 0, 0, 0.25);
		color: rgba(255, 255, 255, 0.9);
		transition: none;
	}

	.month-label {
		font-size: 1.5rem;
		color: rgba(255, 255, 255, 0.5);
		position: absolute;
		top: -0.25rem;
		transition: opacity 50ms ease-out;
	}

	.month-divider {
		position: absolute;
		height: 50%;
		width: 3px;
		border-radius: 1.5px;
		top: 25%;
		left: -4px;
		background: rgba(255, 255, 255, 0.25);
		pointer-events: none;
		transition: opacity 50ms ease-out;
	}

	.day:not(.selected):not(.no-marks):hover .month-label,
	.day.selected .month-divider,
	.day:not(.selected):hover .month-divider {
		opacity: 0;
	}

	.day-date {
		font-size: 2.2rem;
		position: absolute;
		height: 7.25rem;
		display: flex;
		justify-content: center;
		align-items: center;
		transform: translateY(-0.25rem);
		transition: transform 50ms ease-out;
	}

	.day-date.day-today {
		text-decoration: underline;
	}

	.day:not(.selected):not(.no-marks):hover .day-date {
		transform: translateY(-2rem);
	}

	.day-marks {
		display: grid;
		grid-template-rows: 1fr;
		grid-template-columns: 1fr;
		justify-items: center;
		position: relative;
		top: 3.625rem;
		height: 3.625rem;
	}

	/* TODO: Redesign how dot sizing works */

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
		transform: translateY(0.375rem);
	}

	.day-marks-large {
		transform: translateY(-0.75rem);
	}

	.day.noJS .day-marks-large {
		display: none;
	}

	.day.noJS:not(.selected):hover .day-marks-small {
		display: none;
	}

	.day.noJS:not(.selected):hover .day-marks-large {
		display: flex;
	}

	.day-marks-small.six-marks {
		width: 48px;
	}

	.day-marks-small.eight-marks {
		width: 64px;
	}

	.day-marks-small.ten-marks,
	.day-marks-large.ten-marks {
		width: 80px;
	}

	.day-marks-small.twelve-marks,
	.day-marks-large.twelve-marks {
		width: 96px;
	}

	.day-marks-large.four-marks {
		width: 60px;
	}

	@media (max-width: 40rem) {
		a,
		.day-date {
			height: 5.5rem;
		}
		.day {
			border-radius: 1.2rem;
		}
		.month-label {
			font-size: 1.2rem;
			top: -0.5625rem;
		}
		.day-date {
			font-size: 1.8rem;
		}
	}

	@media (max-width: 30rem) {
		a,
		.day-date {
			height: 4rem;
		}
		.day {
			border-radius: 1rem;
		}
		.month-label {
			font-size: 1rem;
			top: -0.6875rem;
		}
		.month-divider {
			width: 2px;
			border-radius: 1px;
			left: -2px;
		}
		.day-date {
			font-size: 1.5rem;
		}
	}
</style>
