<script lang="ts">
	import { enhance } from '$app/forms'
	import { onInterval } from '$lib/interval'
	import {
		getCalendarDays,
		getWeekdayNames,
		MONTH_NAMES,
		mondayName,
		sundayName,
		weekStart,
		days,
		MONTH_ABBREV,
	} from '$lib/calendar'
	import type { CalendarDay } from '$lib/calendar'
	import { onDestroy } from 'svelte'
	import { browser } from '$app/environment'
	import { page } from '$app/stores'
	import Dot from './Dot.svelte'
	import { crossfade } from 'svelte/transition'
	import { trusted } from 'svelte/internal'

	let toolMode: 1 | 2 = 1

	const myUserID = $page.data.discordMember!.id
	$: marks = $page.data.marks!
	$: users = $page.data.users!

	// WHAT I'VE LEARNED ABOUT REACTIVITY AND BINDING
	// If you have a reactive variable, and bind it to a component,
	// any update made to it in that component will re-run the reactive statement
	// regardless of the dependencies of the reactive statement

	let myMarks: Record<string, Mark | null>
	$: myMarks = Object.fromEntries(
		Object.entries(marks)
			.map(([yyyymmdd, dayMarks]) => [
				yyyymmdd,
				dayMarks[myUserID] ? dayMarks[myUserID] : false,
			])
			.filter(([, myMarkOrFalse]) => myMarkOrFalse !== false)
	)
	let notMyMarks: Record<string, Record<string, Mark>>
	$: notMyMarks = Object.fromEntries(
		Object.entries(marks)
			.map(([yyyymmdd, dayMarks]) => [
				yyyymmdd,
				Object.fromEntries(
					Object.entries(dayMarks).filter(([userID]) => userID !== myUserID)
				),
			])
			.filter(([, dayMarks]) => Object.entries(dayMarks).length !== 0)
	)

	$: weekdayNames = getWeekdayNames($weekStart)
	// $: calendarDays = getCalendarDays($days, year, month, $weekStart)

	let dayHover: CalendarDay | null = null
	let daysSelected: Set<CalendarDay> = new Set()
	let unsaved = false
	let saving = false
	let marking = false
	let unmarking = false
	const dragDays: Set<CalendarDay> = new Set()

	// TODO: Need to listen to mouse events outside of day boxes

	function dayClick(day: CalendarDay, e: MouseEvent) {
		if (e.button !== 0) return
		const myMark = myMarks[day.YYYYMMDD]
		// console.log('drag start', day)
		if (myMark) {
			unmarking = true
			myMarks[day.YYYYMMDD] = null
		} else {
			marking = true
			myMarks[day.YYYYMMDD] = {
				type: toolMode,
				createTimestamp: Date.now(),
				lastModifyTimestamp: Date.now(),
			}
		}
		unsaved = true
	}

	function mouseDown(day: CalendarDay, e: PointerEvent) {
		if (daysSelected.has(day)) {
			daysSelected.delete(day)
		} else {
			daysSelected.add(day)
		}
		daysSelected = daysSelected // For reactivity
		if (e.button !== 0) return
		if (day.date < today) return
		dragDays.add(day)
		const myMark = myMarks[day.YYYYMMDD]
		// console.log('drag start', day)
		if (myMark) {
			unmarking = true
			myMarks[day.YYYYMMDD] = null
		} else {
			marking = true
			myMarks[day.YYYYMMDD] = {
				type: toolMode,
				createTimestamp: Date.now(),
				lastModifyTimestamp: Date.now(),
			}
		}
		unsaved = true
	}
	function mouseEnter(day: CalendarDay, e: MouseEvent) {
		dayHover = day
		if (!marking && !unmarking) return
		if (dragDays.has(day)) return
		dragDays.add(day)
		// console.log(e.button, e.buttons)
		if ((e.buttons & 1) === 0) {
			marking = false
			unmarking = false
			return
		}
		if (unmarking) {
			myMarks[day.YYYYMMDD] = null
		} else {
			myMarks[day.YYYYMMDD] = {
				type: toolMode,
				createTimestamp: Date.now(),
				lastModifyTimestamp: Date.now(),
			}
		}
		unsaved = true
	}
	function mouseUp(day: CalendarDay, e: PointerEvent) {
		if (e.button !== 0) return
		if (!marking && !unmarking) return
		dragDays.clear()
		marking = false
		unmarking = false
	}

	function outOfMonth(e: PointerEvent) {
		if ((e.buttons & 1) === 0) return
		if (!marking && !unmarking) return
		marking = false
		unmarking = false
	}

	let today = new Date()
	today.setHours(0, 0, 0, 0)

	const isToday = (day: CalendarDay) => day.date.getTime() === today.getTime()

	const updateToday = () => {
		const now = new Date()
		if (now.getDate() !== today.getDate()) {
			now.setHours(0, 0, 0, 0)
			today = now
		}
	}
	if (browser) onInterval(updateToday, onDestroy)

	const [send, receive] = crossfade({ duration: 50 })
</script>

<div class="header">
	<div class="header-left">
		<form
			method="POST"
			action="?/update"
			use:enhance={() => {
				unsaved = false
				saving = true
				return async ({ update }) => {
					// TODO: Apply "saving" class to modified days, with a lil animation
					saving = false
					daysSelected.clear()
					daysSelected = daysSelected
					update()
				}
			}}
		>
			<input name="myMarks" hidden value={JSON.stringify(myMarks)} />
			<button disabled={!unsaved}>{saving ? 'Saving...' : 'Save'}</button>
		</form>
		<div class="tools">
			<label>
				<input type="radio" bind:group={toolMode} name="tool" value={1} />
				Preferred
			</label>
			<label>
				<input type="radio" bind:group={toolMode} name="tool" value={2} />
				Possible
			</label>
		</div>
	</div>
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
	<!-- TODO: Move this into month ol? -->
	<ol class="weekdays">
		{#each weekdayNames as weekdayName}
			<li class="weekday">{weekdayName}</li>
		{/each}
	</ol>
	<ol class="month" on:pointerleave={outOfMonth}>
		{#each $days as day, i}
			{@const dayMarks = notMyMarks[day.YYYYMMDD] || {}}
			{@const prevDay = $days[i - 1]}
			{#if day.date >= today}
				<li
					class="day"
					on:pointerdown={(e) => mouseDown(day, e)}
					on:pointerup={(e) => mouseUp(day, e)}
					on:mouseenter={(e) => mouseEnter(day, e)}
					on:mouseleave={() => (dayHover = null)}
					on:dblclick={(e) => e.preventDefault()}
					class:expanded={dayHover === day || daysSelected.has(day)}
					class:selected={daysSelected.has(day)}
					class:weekend={day.weekend}
					style={isToday(day)
						? `grid-column:${((7 + day.weekday - $weekStart) % 7) + 1};`
						: ''}
				>
					{#if isToday(day) || prevDay?.month === day.month - 1}
						<div class="month-label">{MONTH_ABBREV[day.month - 1]}</div>
					{/if}
					<div class="day-date">{day.day}</div>
					<div class="day-lower">
						{#if dayHover === day || daysSelected.has(day)}
							<div
								class="day-marks-large"
								class:four-marks={Object.values(dayMarks).length + 1 === 4}
								in:send={{ key: day.YYYYMMDD }}
								out:receive={{ key: day.YYYYMMDD }}
							>
								{#each Object.entries(dayMarks) as [userID, mark]}
									<Dot
										user={users[userID]}
										expanded={true}
										mini={Object.values(dayMarks).length >= 7}
									/>
								{/each}

								<Dot
									user={users[myUserID]}
									expanded={true}
									mini={Object.values(dayMarks).length >= 7}
									plus={!myMarks[day.YYYYMMDD]}
								/>
							</div>
						{:else}
							<div
								class="day-marks-small"
								class:six-marks={Object.values(dayMarks).length >= 5}
								class:eight-marks={Object.values(dayMarks).length >= 7}
								class:ten-marks={Object.values(dayMarks).length >= 9}
								class:twelve-marks={Object.values(dayMarks).length >= 11}
								in:send={{ key: day.YYYYMMDD }}
								out:receive={{ key: day.YYYYMMDD }}
							>
								{#each Object.entries(dayMarks) as [userID, mark]}
									<Dot user={users[userID]} />
								{/each}
								{#if myMarks[day.YYYYMMDD]}
									<Dot user={users[myUserID]} />
								{/if}
							</div>
						{/if}
					</div>
				</li>
			{/if}
		{/each}
	</ol>
</div>

<style>
	.header {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		margin: 0.8rem 0;
		gap: 0.3rem;
	}
	.header-left {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		flex-grow: 1;
	}

	form {
		position: relative;
		top: -4px;
		margin-right: 1rem;
	}

	.header label {
		margin-right: 0.2em;
	}

	.tools {
		background: rgba(255, 255, 255, 0.08);
		padding: 5px 5px 0 5px;
		position: relative;
		top: -3px;
		margin-left: -4px;
		margin-top: 4px;
		height: 1.6rem;
	}

	.calendar {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.weekdays {
		font-size: 1.2em;
		margin: 0.5rem 0;
		color: rgba(255, 255, 255, 0.4);
	}

	ol {
		display: grid;
		grid-template-columns: repeat(7, 116px);
		row-gap: 8px;
		column-gap: 8px;
		list-style: none;
		margin: 0;
		padding: 0;
		justify-items: center;
	}

	.month {
		/* overflow: hidden; */
	}

	/* TODO: Try grid-column: span 2 / 8 etc for connected outlined days? */

	.day {
		width: calc(100%);
		height: 116px;
		box-sizing: border-box;
		border-radius: 20px;
		border: 3px solid transparent;
		/* background-color: rgba(255, 255, 255, 0.06); */
		transition: background-color 50ms ease-out, color 50ms ease-out;
		position: relative;
		touch-action: manipulation;
		display: flex;
		flex-direction: column;
		/* justify-content: space-between; */
		align-items: center;
		cursor: default;
		user-select: none;
	}

	.day:first-child .day-date {
		text-decoration: underline;
	}

	.day.selected {
		border-color: var(--color-user);
	}

	.day.expanded {
		background-color: rgba(0, 0, 0, 0.2);
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

	.day.expanded .month-label {
		opacity: 0;
	}

	.day:not(:first-child) .month-label:before {
		content: '';
		position: absolute;
		height: 61px;
		width: 3px;
		border-radius: 1.5px;
		top: 28px;
		left: -38px;
		background: rgba(255, 255, 255, 0.25);
	}

	.day-date {
		font-size: 2.2em;
		position: absolute;
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
		transition: transform 50ms ease-out;
	}

	.day.expanded .day-date {
		/* padding-top: 0; */
		transform: translateY(-32px);
	}

	/* TODO: Don't animate dots, just fade/swipe between expanded and normal views */

	.day-lower {
		display: grid;
		grid-template-rows: 1fr;
		grid-template-columns: 1fr;
		justify-items: center;
		margin-top: 50%;
		height: 50%;
	}

	.day.expanded .day-lower {
		/* transform: translateY(-9px); */
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

	@media (max-width: 640px) {
		ol {
			grid-template-columns: repeat(7, 45px);
			row-gap: 4px;
			column-gap: 4px;
		}
		.day {
			height: 45px;
			font-size: 1em;
			border-radius: 12px;
			border-width: 2px;
		}

		.month-label {
			font-size: 0.7em;
			top: -2px;
		}

		.day-upper {
			padding-top: 9px;
		}
		.day-lower {
			padding-top: 0.5px;
		}
	}
</style>
