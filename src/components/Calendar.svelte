<script lang="ts" context="module">
	import { writable } from 'svelte/store'
	// This is global in SSR, but that's okay since we only touch it in user actions
	export const saving = writable(false)
</script>

<script lang="ts">
	import {
		getWeekdayNames,
		mondayName,
		sundayName,
		weekStart,
		days,
		getPreDays,
		today,
		now,
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

	$: marks = $page.data.marks!

	// WHAT I'VE LEARNED ABOUT REACTIVITY AND BINDING
	// If you have a reactive variable, and bind it to a component,
	// any update made to it in that component will re-run the reactive statement
	// regardless of the dependencies of the reactive statement

	$: weekdayNames = getWeekdayNames($weekStart)

	export let daySelected: CalendarDay | null = null

	$: preDays = getPreDays($days, $today, $weekStart)

	async function dayOnClick(day: CalendarDay) {
		const newSlug = day === daySelected ? 'calendar' : day.YYYYMMDD
		daySelected = day === daySelected ? null : day
		saving.set(true)
		// Deferred to allow daySelected to propagate
		await new Promise((res) => setTimeout(res))
		await goto(`/${newSlug}`, { noscroll: true, replaceState: true })
		saving.set(false)
	}

	today.set(DateTime.now().setZone(PUBLIC_GLOBAL_TIMEZONE).startOf('day'))
	now.set(DateTime.now().setZone(PUBLIC_GLOBAL_TIMEZONE).startOf('minute'))
	if (browser) {
		onInterval(() => {
			const _now = DateTime.now().setZone(PUBLIC_GLOBAL_TIMEZONE)
			if (!_now.hasSame($now, 'minute')) now.set(_now.startOf('minute'))
			if (!_now.hasSame($today, 'day')) today.set(_now.startOf('day'))
		}, onDestroy)
		today.subscribe((_today) => {
			if (daySelected && daySelected.datetime < _today) dayOnClick(daySelected)
		})
	}
</script>

<svelte:head>
	<title>Whenever{daySelected ? ` ${daySelected.YYYYMMDD}` : ''}</title>
</svelte:head>
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
	<div class="week-start-container">
		<label for="week-start">Start of week:</label>
		<select id="week-start" bind:value={$weekStart}>
			<!-- Use selected property to show correct option on intial render -->
			<option selected={$weekStart === 7} value={7}>{sundayName}</option>
			<option selected={$weekStart === 1} value={1}>{mondayName}</option>
		</select>
	</div>
	<ol class="month">
		{#each weekdayNames as weekdayName}
			<li class="weekday">{weekdayName}</li>
		{/each}
		{#each preDays as day (day)}<li class="pre-day">
				<div class="day-date">{day}</div>
			</li>{/each}
		{#each $days as day (day.YYYYMMDD)}
			{@const dayMarks = marks.filter((mark) => mark.YYYYMMDD === day.YYYYMMDD)}
			{#if day.datetime >= $today}
				<Day {day} bind:daySelected {dayMarks} onClick={dayOnClick} />
			{/if}
			{#if daySelected && day.weekday === ($weekStart === 1 ? 7 : 6) && $days.indexOf(day) >= $days.indexOf(daySelected) && $days.indexOf(day) < $days.indexOf(daySelected) + 7}
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
		border-radius: 1rem;
		padding: 0.8rem 1.2rem;
		box-sizing: border-box;
		background: #090a0b;
		position: sticky;
		top: 0;
		z-index: 9999;
	}

	.week-start-container {
		width: 100%;
	}

	.week-start-container label {
		margin-right: 0.2em;
	}

	.clock {
		color: rgba(255, 255, 255, 0.5);
		display: flex;
		flex-direction: column;
		align-items: flex-start;
	}

	.clock time {
		color: rgba(255, 255, 255, 0.7);
		font-size: 1.1em;
	}

	.refresh button,
	.refresh a {
		color: var(--color-text);
		display: flex;
		align-items: center;
		background: rgba(255, 255, 255, 0.08);
		border-radius: 8px;
		padding: 7px 14px;
		border: none;
		cursor: pointer;
		text-decoration: none;
		transition: background-color 80ms ease-out, color 80ms ease-out;
	}

	.refresh button:hover,
	.refresh a:hover {
		background: rgba(255, 255, 255, 0.15);
	}

	.refresh button:active,
	.refresh a:active {
		background: rgba(255, 255, 255, 0.06);
	}

	.refresh button:disabled {
		background: rgba(255, 255, 255, 0.04);
		color: rgba(255, 255, 255, 0.3);
	}

	.calendar {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100%;
	}

	.month {
		display: grid;
		width: 100%;
		grid-template-columns: repeat(7, calc(94% / 7));
		row-gap: 0.5rem;
		column-gap: 1%;
		list-style: none;
		margin: 0;
		padding: 0;
		justify-items: center;
	}

	.weekday {
		font-size: 1.2rem;
		margin: 0.5rem 0;
		color: rgba(255, 255, 255, 0.4);
	}

	.pre-day {
		color: rgba(255, 255, 255, 0.2);
		cursor: default;
		user-select: none;
		height: 116px;
		display: flex;
		align-items: center;
	}

	.pre-day .day-date {
		height: 100%;
		font-size: 2.2rem;
		display: flex;
		align-items: center;
		transform: translateY(-4px);
	}

	@media (max-width: 40rem) {
		.pre-day {
			height: 5.5rem;
		}
		.pre-day .day-date {
			font-size: 1.8rem;
		}
	}

	@media (max-width: 30rem) {
		.pre-day {
			height: 4rem;
		}
		.weekday {
			font-size: 1rem;
		}
		.pre-day .day-date {
			font-size: 1.5rem;
		}
	}
</style>
