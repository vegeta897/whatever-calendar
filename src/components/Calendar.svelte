<script lang="ts" context="module">
	import { writable, type Writable } from 'svelte/store'
	// This is global in SSR, but that's okay since we only touch it in user actions
	export const saving: Writable<boolean> = writable(false)
	export const selectedUserID: Writable<null | string> = writable(null)
</script>

<script lang="ts">
	import {
		getWeekdayNames,
		weekStart,
		days,
		getPreDays,
		today,
		now,
	} from '$lib/calendar'
	import type { CalendarDay } from '$lib/calendar'
	import { page } from '$app/stores'
	import Day from './Day.svelte'
	import { goto } from '$app/navigation'
	import DayDetail from './DayDetail.svelte'
	import { onInterval } from '$lib/interval'
	import { onDestroy, tick } from 'svelte'
	import { browser } from '$app/environment'
	import { DateTime } from 'luxon'
	import { PUBLIC_GLOBAL_TIMEZONE } from '$env/static/public'

	let daySelected: CalendarDay | null

	// WHAT I'VE LEARNED ABOUT REACTIVITY AND BINDING
	// If you have a reactive variable, and bind it to a component,
	// any update made to it in that component will re-run the reactive statement
	// regardless of the dependencies of the reactive statement

	// ALSO HOLY COW!
	// Use the |local directive on transtitions whenever possible,
	// because they can cause weird issues with stuck components!

	$: votes = $page.data.votes!
	$: weekdayNames = getWeekdayNames($weekStart)
	$: preDays = getPreDays($days, $today, $weekStart)
	$: daySelected =
		$page.data.day && $days.find((d) => d.YYYYMMDD === $page.data.day)

	const dayOnClick = async (day: CalendarDay) => {
		const closeDetail = daySelected && day.YYYYMMDD === daySelected.YYYYMMDD
		const newSlug = closeDetail ? 'calendar' : day.YYYYMMDD
		saving.set(true)
		daySelected = closeDetail ? null : day
		await tick()
		await goto(`/${newSlug}`, { noScroll: true, replaceState: true })
		saving.set(false)
	}

	today.set(DateTime.now().setZone(PUBLIC_GLOBAL_TIMEZONE).startOf('day'))
	now.set(DateTime.now().setZone(PUBLIC_GLOBAL_TIMEZONE).startOf('minute'))

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
<div class="calendar">
	<div class="month">
		<div class="weekdays">
			{#each weekdayNames as weekdayName}
				<div class="weekday">{weekdayName}</div>
			{/each}
		</div>
		{#each preDays as day, pd (day)}
			<!-- Use Day component for these? -->
			<div class="pre-day" class:faded={$selectedUserID}>
				<div class="month-label">
					{#if day.day === 1 || pd === 0}{day.month}{/if}
				</div>
				<div class="day-date">{day.day}</div>
			</div>
		{/each}
		{#each $days as day, d (day.YYYYMMDD)}
			{@const dayVotes = votes.filter((vote) => vote.YYYYMMDD === day.YYYYMMDD)}
			<Day
				{day}
				selected={day === daySelected}
				{dayVotes}
				onClick={dayOnClick}
				firstRow={preDays.length + d < 7}
			/>
		{/each}
		{#if daySelected}
			<DayDetail
				day={daySelected}
				votes={votes.filter((m) => m.YYYYMMDD === daySelected?.YYYYMMDD)}
				{preDays}
			/>
		{/if}
	</div>
</div>

<style>
	.calendar {
		display: flex;
		flex-direction: column;
		align-items: center;
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
		justify-items: center;
	}

	.weekdays {
		grid-column: 1 / 8;
		column-gap: 1%;
		width: 100%;
		display: grid;
		grid-template-columns: repeat(7, calc(94% / 7));
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
