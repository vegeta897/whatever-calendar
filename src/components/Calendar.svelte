<script lang="ts">
	import { enhance } from '$app/forms'
	import { onInterval } from '$lib/interval'
	import {
		getWeekdayNames,
		mondayName,
		sundayName,
		weekStart,
		days,
		MONTH_ABBREV,
		sameDay,
		getPreDays,
	} from '$lib/calendar'
	import type { CalendarDay } from '$lib/calendar'
	import { onDestroy } from 'svelte'
	import { browser } from '$app/environment'
	import { page } from '$app/stores'
	import Dot from './Dot.svelte'
	import { crossfade } from 'svelte/transition'
	import DayDetail from './DayDetail.svelte'
	import { goto } from '$app/navigation'

	let toolMode: 1 | 2 = 1

	const myUserID = $page.data.discordMember!.id
	$: marks = $page.data.marks!
	$: users = $page.data.users!

	// WHAT I'VE LEARNED ABOUT REACTIVITY AND BINDING
	// If you have a reactive variable, and bind it to a component,
	// any update made to it in that component will re-run the reactive statement
	// regardless of the dependencies of the reactive statement

	// TODO: Do we need to separate myMarks anymore?
	// Should marks be stored in an array? Should notes?

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
	export let daySelected: CalendarDay | null = null
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

	function clickDay(day: CalendarDay) {
		if (daySelected === day) {
			goto('/calendar', { noscroll: true, replaceState: true })
		} else {
			goto(`/${day.YYYYMMDD}`, { noscroll: true, replaceState: true })
		}
	}

	function mouseDown(day: CalendarDay, e: PointerEvent) {
		return
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

	const updateToday = () => {
		const now = new Date()
		if (now.getDate() !== today.getDate()) {
			now.setHours(0, 0, 0, 0)
			today = now
			if (daySelected && daySelected.date < today) {
				clickDay(daySelected) // Will navigate to /calendar
			}
		}
	}
	if (browser) onInterval(updateToday, onDestroy)

	$: preDays = getPreDays($days, today, $weekStart)

	// Crossfading expanded day views
	const [send, receive] = crossfade({ duration: 50 })
</script>

<!-- TODO: Fix header to top of page when scrolled out of view -->
<div class="header">
	<div>
		<label for="week-start">Start of week:</label>
		<select id="week-start" bind:value={$weekStart}>
			<!-- Use selected property to show correct option on intial render -->
			<option selected={$weekStart === 0} value={0}>{sundayName}</option>
			<option selected={$weekStart === 1} value={1}>{mondayName}</option>
		</select>
	</div>
	<div class="header-left">
		<!-- TODO: Move this into DayDetail -->
		<form
			method="POST"
			action="?/marks"
			use:enhance={() => {
				unsaved = false
				saving = true
				return async ({ update }) => {
					saving = false
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
</div>
<div class="calendar">
	<!-- TODO: Move this into month ol? -->
	<ol class="weekdays">
		{#each weekdayNames as weekdayName}
			<li class="weekday">{weekdayName}</li>
		{/each}
	</ol>
	<ol class="month" on:pointerleave={outOfMonth}>
		{#each preDays as day}<li class="day pre-day">
				<div class="day-date">{day}</div>
			</li>{/each}
		{#each $days as day, i}
			{@const dayMarks = notMyMarks[day.YYYYMMDD] || {}}
			{@const myMark = myMarks[day.YYYYMMDD]}
			{@const prevDay = $days[i - 1]}
			{#if day.date >= today}
				<li
					class="day"
					on:pointerdown={(e) => mouseDown(day, e)}
					on:pointerup={(e) => mouseUp(day, e)}
					on:mouseenter={(e) => mouseEnter(day, e)}
					on:mouseleave={() => (dayHover = null)}
					on:dblclick={(e) => e.preventDefault()}
					class:expanded={dayHover === day && day !== daySelected}
					class:selected={day === daySelected}
					class:weekend={day.weekend}
					class:first-column={day.weekday === $weekStart}
					on:click={() => clickDay(day)}
				>
					{#if sameDay(day.date, today) || day.day === 1}
						{#if day.day === 1 && day.weekday !== $weekStart}
							<div class="month-divider" />
						{/if}
						<div class="month-label">{MONTH_ABBREV[day.month]}</div>
					{/if}
					<div class="day-date" class:day-today={sameDay(day.date, today)}>
						{day.day}
					</div>
					<div class="day-marks">
						{#if dayHover === day && day !== daySelected}
							<div
								class="day-marks-large"
								class:four-marks={Object.values(dayMarks).length +
									(myMark ? 1 : 0) ===
									4}
								class:six-marks={Object.values(dayMarks).length +
									(myMark ? 1 : 0) ===
									6}
								in:send={{ key: day.YYYYMMDD }}
								out:receive={{ key: day.YYYYMMDD }}
							>
								{#if myMark}<Dot
										user={users[myUserID]}
										expanded={true}
										mini={Object.values(dayMarks).length + 1 >= 7}
									/>{/if}
								{#each Object.entries(dayMarks) as [userID, mark]}<Dot
										user={users[userID]}
										expanded={true}
										mini={Object.values(dayMarks).length + 1 >= 7}
									/>{/each}
							</div>
						{:else}
							<div
								class="day-marks-small"
								class:six-marks={Object.values(dayMarks).length +
									(myMark ? 1 : 0) >=
									5}
								class:eight-marks={Object.values(dayMarks).length +
									(myMark ? 1 : 0) >=
									7}
								class:ten-marks={Object.values(dayMarks).length +
									(myMark ? 1 : 0) >=
									9}
								class:twelve-marks={Object.values(dayMarks).length +
									(myMark ? 1 : 0) >=
									11}
								in:send={{ key: day.YYYYMMDD }}
								out:receive={{ key: day.YYYYMMDD }}
							>
								{#if myMark}<Dot user={users[myUserID]} />{/if}
								{#each Object.entries(dayMarks) as [userID, mark]}
									<Dot user={users[userID]} />
								{/each}
							</div>
						{/if}
					</div>
				</li>
				{#if daySelected && day.weekday === ($weekStart + 7 - 1) % 7 && $days.indexOf(day) >= $days.indexOf(daySelected) && $days.indexOf(day) < $days.indexOf(daySelected) + 7}
					<DayDetail
						day={daySelected}
						marks={notMyMarks[daySelected.YYYYMMDD] || {}}
						myMark={myMarks[daySelected.YYYYMMDD]}
						rightAlignDay={daySelected.weekday === ($weekStart + 6) % 7}
						leftAlignDay={daySelected.weekday === $weekStart}
					/>
				{/if}
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
	}
	.header-left {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
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

	.day.pre-day {
		cursor: default;
		color: rgba(255, 255, 255, 0.2);
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
		height: 100%;
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

	@media (max-width: 640px) {
		/* TODO: This all needs to be redone */
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

		.day-marks {
			padding-top: 0.5px;
		}
	}
</style>
