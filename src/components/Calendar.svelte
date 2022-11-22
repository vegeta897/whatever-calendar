<script lang="ts" context="module">
	import { writable } from 'svelte/store'
	// This is global in SSR, but that's okay since we only touch it in user actions
	export const saving = writable(false)
</script>

<script lang="ts">
	import {
		getWeekdayNames,
		weekStart,
		days,
		getPreDays,
		today,
		now,
		getDays,
	} from '$lib/calendar'
	import type { CalendarDay } from '$lib/calendar'
	import { page } from '$app/stores'
	import Day from './Day.svelte'
	import { goto, invalidateAll } from '$app/navigation'
	import DayDetail from './DayDetail.svelte'
	import { onInterval } from '$lib/interval'
	import { onDestroy } from 'svelte'
	import { browser } from '$app/environment'
	import { DateTime } from 'luxon'
	import { PUBLIC_GLOBAL_TIMEZONE } from '$env/static/public'

	export let daySelected: CalendarDay | null = null
	export let selectedUser: WheneverUser | null

	// WHAT I'VE LEARNED ABOUT REACTIVITY AND BINDING
	// If you have a reactive variable, and bind it to a component,
	// any update made to it in that component will re-run the reactive statement
	// regardless of the dependencies of the reactive statement

	$: marks = $page.data.marks!
	$: weekdayNames = getWeekdayNames($weekStart)
	$: preDays = getPreDays($days, $today, $weekStart)

	async function dayOnClick(day: CalendarDay) {
		const closeDetail = day === daySelected
		const newSlug = closeDetail ? 'calendar' : day.YYYYMMDD
		daySelected = closeDetail ? null : day
		saving.set(true)
		// Deferred to allow daySelected to propagate
		await new Promise((res) => setTimeout(res))
		await goto(`/${newSlug}`, { noscroll: true, replaceState: true })
		daySelected = closeDetail ? null : day
		saving.set(false)
	}

	today.set(DateTime.now().setZone(PUBLIC_GLOBAL_TIMEZONE).startOf('day'))
	now.set(DateTime.now().setZone(PUBLIC_GLOBAL_TIMEZONE).startOf('minute'))
	days.set(getDays())

	if (browser) {
		onInterval(() => {
			const _now = DateTime.now().setZone(PUBLIC_GLOBAL_TIMEZONE)
			if (!_now.hasSame($now, 'minute')) now.set(_now.startOf('minute'))
			if (!_now.hasSame($today, 'day')) {
				today.set(_now.startOf('day'))
				days.set($days.filter((day) => day.datetime >= $today))
			}
		}, onDestroy)
		today.subscribe((_today) => {
			if (daySelected && daySelected.datetime < _today) dayOnClick(daySelected)
		})
	}
</script>

<svelte:head>
	<title>Whenever{daySelected ? ` ${daySelected.YYYYMMDD}` : ''}</title>
</svelte:head>
<div class="container">
	<div class="header">
		<div class="clock">
			<time datetime={$now.toISO({ includeOffset: false })}>
				{$now.toFormat('f')}
			</time>
			{$now.offsetNameLong}
		</div>
		<div class="refresh">
			{#if browser}
				<button
					on:click={async () => {
						saving.set(true)
						await invalidateAll()
						saving.set(false)
					}}
					disabled={$saving}
				>
					Refresh
				</button>
			{:else}
				<a href={$page.data.href}>Refresh</a>
			{/if}
		</div>
	</div>
	<div class="calendar">
		<ol class="month">
			<div class="weekdays">
				{#each weekdayNames as weekdayName}
					<li class="weekday">{weekdayName}</li>
				{/each}
			</div>
			{#each preDays as day, pd (day)}
				<!-- Use Day component for these? -->
				<li class="pre-day" class:faded={selectedUser}>
					<div class="month-label">
						{#if day.day === 1 || pd === 0}{day.month}{/if}
					</div>
					<div class="day-date">{day.day}</div>
				</li>
			{/each}
			{#each $days as day, d (day.YYYYMMDD)}
				{@const dayMarks = marks.filter(
					(mark) => mark.YYYYMMDD === day.YYYYMMDD
				)}
				{#if day.datetime >= $today}
					<Day
						{day}
						bind:daySelected
						{dayMarks}
						onClick={dayOnClick}
						firstRow={preDays.length + d < 7}
						{selectedUser}
					/>
				{/if}
			{/each}
			{#if daySelected}
				{daySelected.YYYYMMDD}
				<DayDetail
					day={daySelected}
					marks={marks.filter((m) => m.YYYYMMDD === daySelected?.YYYYMMDD)}
					{preDays}
				/>
			{/if}
		</ol>
	</div>
</div>

<style>
	.container {
		flex-grow: 1;
	}

	.header {
		width: 100%;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		margin: 0 0 0.8rem;
		border-radius: 1rem;
		padding: 0.8rem 1.2rem;
		box-sizing: border-box;
		background: var(--color-bg);
		box-shadow: 0 0 0 1px var(--color-fg);
		position: sticky;
		top: 1px;
		z-index: 9999;
	}

	.clock {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
	}

	.clock time {
		font-size: 1.1em;
	}

	.refresh button,
	.refresh a {
		display: flex;
		align-items: center;
		color: var(--color-fg);
		background: var(--color-bg);
		box-shadow: 0 0 0 1px var(--color-fg);
		border-radius: 8px;
		padding: 7px 14px;
		border: none;
		cursor: pointer;
		text-decoration: none;
		transition: background-color 80ms ease-out, color 80ms ease-out,
			opacity 80ms ease-out;
	}

	.refresh button:hover,
	.refresh a:hover {
		color: var(--color-bg);
		background: var(--color-fg);
	}

	.refresh button:active,
	.refresh a:active {
		opacity: 0.5;
	}

	.refresh button:disabled {
		opacity: 0.5;
	}

	.calendar {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100%;
	}

	.month {
		display: grid;
		--day-height: 7.25rem;
		width: 100%;
		grid-template-columns: repeat(7, calc(94% / 7));
		--day-row-gap: 0.5rem;
		--day-date-font-size: 2.2rem;
		row-gap: var(--day-row-gap);
		column-gap: 1%;
		list-style: none;
		margin: 0;
		padding: 0;
		justify-items: center;
	}

	.weekdays {
		grid-column: 1 / 8;
		width: 100%;
		display: grid;
		grid-template-columns: repeat(7, calc(100% / 7));
		border-bottom: 1px solid var(--color-fg);
	}

	.weekday {
		font-size: calc(var(--day-height) * 0.2);
		margin: 0.5rem 0 0.5rem;
		text-align: center;
		width: 100%;
	}

	.pre-day {
		cursor: default;
		user-select: none;
		height: var(--day-height);
		display: flex;
		flex-direction: column;
		align-items: center;
		transition: opacity 100ms ease-out;
	}

	.faded {
		opacity: 0.3;
	}

	.pre-day .month-label {
		font-size: calc(var(--day-height) * 0.23);
		height: calc(100% / 3);
	}

	.pre-day .day-date {
		height: calc(100% / 3);
		font-size: calc(var(--day-height) * 0.3);
		line-height: calc(var(--day-height) * 0.3);
		display: flex;
		flex-direction: column;
		justify-content: center;
	}

	@media (max-width: 55rem) {
		/* 880px */
		.month {
			--day-height: 6.75rem;
			--day-row-gap: 0.45rem;
		}
	}

	@media (max-width: 50rem) {
		/* 800px */
		.month {
			--day-height: 6.25rem;
			--day-row-gap: 0.45rem;
		}
	}

	@media (max-width: 45rem) {
		/* 720px */
		.month {
			--day-height: 5.75rem;
			--day-row-gap: 0.4rem;
		}
	}

	@media (max-width: 40rem) {
		/* 640px */
		.month {
			--day-height: 5rem;
			--day-row-gap: 0.35rem;
		}
	}

	@media (max-width: 35rem) {
		/* 560px */
		.month {
			--day-height: 4.5rem;
			--day-row-gap: 0.3rem;
		}
	}

	@media (max-width: 30rem) {
		/* 480px */
		.month {
			--day-height: 3.75rem;
			--day-row-gap: 0.25rem;
		}
		.header {
			font-size: 0.75rem;
		}
	}

	@media (max-width: 25rem) {
		/* 400px */
		.month {
			--day-height: 3.25rem;
			--day-row-gap: 0.2rem;
		}
	}

	@media (max-width: 20rem) {
		/* 320px */
		.month {
			--day-height: 2.625rem;
			--day-row-gap: 0.15rem;
		}
	}
</style>
