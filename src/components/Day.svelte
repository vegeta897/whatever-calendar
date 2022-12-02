<script lang="ts">
	import type { CalendarDay } from '$lib/calendar'
	import { weekStart, today } from '$lib/calendar'
	import { selectedUserID } from './Calendar.svelte'
	import { page } from '$app/stores'

	export let day: CalendarDay
	export let selected = false
	export let dayMarks: MarkData[]
	export let onClick: (day: CalendarDay) => void
	export let firstRow = false

	const myUserID = $page.data.discordMember!.id

	$: myMark = dayMarks.find((m) => m.userID === myUserID)
	$: otherMarks = dayMarks.filter((m) => m.userID !== myUserID)
	$: hasSelectedUser =
		$selectedUserID && dayMarks.some((m) => m.userID === $selectedUserID)
</script>

<a
	href="/{selected ? 'calendar' : day.YYYYMMDD}"
	data-sveltekit-preload-data="off"
	data-sveltekit-noscroll
	on:click|preventDefault={() => {
		onClick(day)
	}}
>
	<li
		class="day"
		class:selected
		class:first-column={day.weekday === $weekStart}
		class:no-marks={dayMarks.length === 0}
		class:faded={$selectedUserID && !hasSelectedUser}
	>
		<div class="month-label">
			{#if selected || day.day === 1 || (firstRow && day.weekday === $weekStart)}{day
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
		transition: padding-bottom 150ms ease-out, border-radius 150ms ease-out,
			opacity 100ms ease-out;
		position: relative;
		touch-action: manipulation;
		display: flex;
		flex-direction: column;
		align-items: center;
		user-select: none;
	}

	.day.selected {
		box-shadow: 0 0 0 1px var(--color-fg);
		border-bottom-left-radius: 0;
		border-bottom-right-radius: 0;
		padding-bottom: calc(var(--day-row-gap) - 1px);
	}

	@media (hover: hover) {
		.day:not(.selected):hover {
			box-shadow: 0 0 0 1px var(--color-fg);
		}
	}

	.day:not(.selected):not(:hover).faded {
		background: var(--color-bg);
		color: var(--color-fg);
		opacity: 0.3;
	}

	.month-label {
		font-size: calc(var(--day-height) * 0.23);
		height: calc(100% / 3);
	}

	.day-date {
		height: calc(100% / 3);
		padding: 0 calc(var(--day-height) * 0.1);
		border-radius: calc(var(--day-height) * 0.12);
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

	.day-marks {
		display: flex;
		font-size: calc(var(--day-height) * 0.16);
		background: var(--color-fg);
		color: var(--color-bg);
		border-radius: calc(var(--day-height) * 0.08);
		padding: 0 calc(var(--day-height) * 0.08);
		margin-top: calc(var(--day-height) * 0.03);
		box-sizing: border-box;
		font-weight: 700;
		font-variation-settings: 'wght' 700;
	}

	.plus {
		margin: 0 0.25rem;
	}

	.day-detail-join-cover {
		transition: width 150ms ease-out;
		background: var(--color-bg);
		position: absolute;
		bottom: -2px;
		width: 0;
		height: 3px;
	}

	.day.selected .day-detail-join-cover {
		width: 100%;
	}
</style>
