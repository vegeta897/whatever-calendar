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
					in:send={{ key: day.YYYYMMDD }}
					out:receive={{ key: day.YYYYMMDD }}
					style="--dot-cols: {dayMarks.length > 10
						? 6
						: dayMarks.length > 8
						? 5
						: dayMarks.length > 6
						? 4
						: dayMarks.length === 4
						? 2
						: 3}; --dot-size: calc({dayMarks.length > 6
						? 1.375
						: 1.75}rem * var(--dot-scale));"
				>
					{#each dayMarks as mark (mark.userID)}<Dot
							avatar={dayMarks.length <= 8}
							user={users[mark.userID]}
							note={!!mark.note}
						/>{/each}
				</div>
			{/if}
			{#if !hover || day === daySelected || noJS}
				<div
					class="day-marks-small"
					in:send={{ key: day.YYYYMMDD }}
					out:receive={{ key: day.YYYYMMDD }}
					style="--dot-cols: {dayMarks.length > 10
						? 6
						: dayMarks.length > 8
						? 5
						: dayMarks.length > 6
						? 4
						: dayMarks.length > 4
						? 3
						: 4}; --dot-size: calc(0.75rem * var(--dot-scale));"
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
		height: var(--day-height);
		text-decoration: none;
	}

	.day {
		width: 100%;
		height: 100%;
		border-radius: calc(var(--day-height) / 4);
		transition: background-color 50ms ease-out, color 50ms ease-out,
			height 50ms ease-out, margin-bottom 50ms ease-out,
			border-radius 50ms ease-out;
		position: relative;
		touch-action: manipulation;
		display: flex;
		flex-direction: column;
		align-items: center;
		user-select: none;
		background: rgba(0, 0, 0, 0.15);
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
		font-size: var(--day-date-font-size);
		line-height: var(--day-date-font-size);
		height: calc(var(--day-height) * 0.55);
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		transition: transform 50ms ease-out;
	}

	.day-date.day-today {
		text-decoration: underline;
	}

	.day:not(.selected):not(.no-marks):hover .day-date {
		transform: translateY(-25%);
	}

	.day-marks {
		display: grid;
		grid-template-rows: 1fr;
		grid-template-columns: 1fr;
		justify-items: center;
		width: 100%;
		flex-grow: 1;
		/* height: calc(var(--day-height) / 2); */
		--dot-scale: 1;
	}

	.day-marks-small,
	.day-marks-large {
		/* width: 100%; */
		/* width: calc(var(--dot-size) * 4 / 3 * var(--dot-cols)); */
		width: calc(
			calc(var(--dot-size) + calc(0.25rem * var(--dot-scale))) * var(--dot-cols)
		);
		/* height: var(--day-height); */
		display: flex;
		flex-wrap: wrap;
		align-content: center;
		justify-content: center;
		grid-row: 1;
		grid-column: 1;
	}

	.day-marks-small {
		/* transform: translateY(calc(0.375rem * var(--dot-scale))); */
	}

	.day-marks-large {
		/* transform: translateY(-0.75rem); */
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

	@media (max-width: 55rem) {
		.day-marks {
			--dot-scale: 0.8;
		}
	}

	@media (max-width: 45rem) {
		.day-marks {
			--dot-scale: 0.7;
		}
	}

	@media (max-width: 40rem) {
		.month-label {
			font-size: 1.2rem;
			top: -0.5625rem;
		}
		.day-marks {
			--dot-scale: 0.6;
		}
	}

	@media (max-width: 35rem) {
		.day-marks {
			--dot-scale: 0.5;
		}
	}

	@media (max-width: 30rem) {
		.month-label {
			font-size: 1rem;
			top: -0.6875rem;
		}
		.month-divider {
			width: 2px;
			border-radius: 1px;
			left: -2px;
		}
		.day-marks {
			--dot-scale: 0.45;
		}
	}

	@media (max-width: 25rem) {
		.day-marks {
			--dot-scale: 0.35;
		}
	}
</style>
