<script lang="ts">
	import type { CalendarDay } from '$lib/calendar'
	import { weekStart, today } from '$lib/calendar'
	// import People from './People.svelte'
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
			{#if myMark}<span class="you">You</span>{/if}
			{#if otherMarks.length > 0}{#if myMark}
					<span class="plus">+</span>
				{/if}<span class="others">{otherMarks.length}</span>{/if}
			<!-- {#if dayMarks.some((m) => m.note)}
				<span class="quote-mark">&#10078;</span>
			{/if} -->
		</div>
		<div class="day-detail-join-cover" />
	</li>
</a>

<style>
	a {
		display: block;
		width: 100%;
		height: var(--day-height);
		text-decoration: none;
	}

	.day {
		width: 100%;
		height: 100%;
		border-radius: calc(var(--day-height) / 4);
		transition: padding-bottom 50ms ease-out, border-radius 100ms ease-out,
			box-shadow 50ms ease-out;
		position: relative;
		touch-action: manipulation;
		display: flex;
		flex-direction: column;
		align-items: center;
		user-select: none;
	}

	.day.first-of-month {
		box-shadow: 0 0 0 1px var(--color-fg);
	}

	.day.selected {
		box-shadow: 0 0 0 1px var(--color-fg);
		border-bottom-left-radius: 0;
		border-bottom-right-radius: 0;
		padding-bottom: calc(var(--day-row-gap) - 1px);
	}

	.day:not(.selected):hover {
		box-shadow: 0 0 0 1px var(--color-fg);
		transition: none;
	}

	.month-label {
		font-size: calc(var(--day-height) * 0.23);
		height: calc(100% / 3);
	}

	.day-date {
		height: calc(100% / 3);
		padding: 0 0.5rem;
		border-radius: 0.75rem;
		font-size: calc(var(--day-height) * 0.3);
		line-height: calc(var(--day-height) * 0.3);
		display: flex;
		flex-direction: column;
		justify-content: center;
		transition: background-color 100ms ease-out, color 100ms ease-out;
	}

	.day-date.day-today {
		text-decoration: underline;
	}

	.day.selected .day-date {
		background: var(--color-fg);
		color: var(--color-bg);
	}

	.day-marks {
		display: flex;
		align-items: flex-start;
		justify-content: center;
		width: 100%;
		height: calc(100% / 3);
		flex-grow: 1;
		font-size: calc(var(--day-height) * 0.16);
	}

	.you {
		font-weight: 700;
		font-variation-settings: 'wght' 700;
	}

	.plus {
		margin: 0 0.25rem;
	}

	.day-detail-join-cover {
		transition: width 100ms ease-out;
		background: var(--color-bg);
		position: absolute;
		bottom: -1.5px;
		width: 0;
		height: 2px;
	}

	.day.selected .day-detail-join-cover {
		width: 100%;
	}
</style>
