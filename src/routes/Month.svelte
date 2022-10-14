<script lang="ts">
	import { enhance } from '$app/forms'
	import { onInterval } from '$lib/interval'
	import {
		getCalendarDays,
		getWeekdayNames,
		MONTH_NAMES,
		mondayName,
		sundayName,
	} from '$lib/calendar'
	import type { CalendarDay } from '$lib/calendar'
	import { onDestroy } from 'svelte'
	import { browser } from '$app/environment'

	export let year: number
	export let month: number
	export let days: CalendarDay[]
	export let users: Record<string, WheneverUser>
	export let marks: Record<string, Record<string, Mark>>
	export let myUserID: string
	export let weekStart: 0 | 1
	export let toolMode: 1 | 2

	// WHAT I'VE LEARNED ABOUT REACTIVITY AND BINDING
	// If you have a reactive variable, and bind it to a component,
	// any update made to it in that component will re-run the reactive statement
	// regardless of the dependencies of the reactive statement

	let myMarks: Record<string, Mark | null>
	$: myMarks = getMyMarks(marks)
	function getMyMarks(allMarks: typeof marks) {
		const myNewMarks: typeof myMarks = { ...myMarks }
		for (const [yyyymmdd, dayMarks] of Object.entries(allMarks)) {
			for (const [userID, mark] of Object.entries(dayMarks)) {
				if (userID !== myUserID) continue
				myNewMarks[yyyymmdd] ||= { ...mark }
			}
		}
		return myNewMarks
	}

	$: weekdayNames = getWeekdayNames(weekStart)
	$: calendarDays = getCalendarDays(days, year, month, weekStart)

	let unsaved = false
	let marking = false
	let unmarking = false
	const dragDays: Set<CalendarDay> = new Set()

	// TODO: Need to listen to mouse events outside of day boxes

	function dayClick(day: CalendarDay, e: MouseEvent) {
		if (e.button !== 0) return
		const myMark = myMarks[day.YYYYMMDD]
		// console.log('drag start', day)
		if (myMark?.type === toolMode) {
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
		if (e.button !== 0) return
		if (day.date < today) return
		dragDays.add(day)
		const myMark = myMarks[day.YYYYMMDD]
		// console.log('drag start', day)
		if (myMark?.type === toolMode) {
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
	function mouseEnter(day: CalendarDay, e: PointerEvent) {
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
		// console.log('drag stop', day)
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
		}
	}
	if (browser) onInterval(updateToday, onDestroy)
</script>

<div class="header">
	<h2>{MONTH_NAMES[month - 1]}</h2>
	<form
		method="POST"
		action="?/update"
		use:enhance
		on:submit={() => (unsaved = false)}
	>
		<input name="myMarks" hidden value={JSON.stringify(myMarks)} />
		<button disabled={!unsaved}>Save</button>
	</form>
	<div>
		<label for="week-start">Start of week:</label>
		<select id="week-start" bind:value={weekStart}>
			<option value={0}>{sundayName}</option>
			<option value={1}>{mondayName}</option>
		</select>
	</div>
</div>
<ol class="weekdays">
	{#each weekdayNames as weekdayName}
		<li class="weekday">{weekdayName}</li>
	{/each}
</ol>
<ol class="month" on:pointerleave={outOfMonth}>
	{#each calendarDays as day, i}
		{@const dayMarks = marks[day.YYYYMMDD] || {}}
		<li
			class="day"
			on:pointerdown={(e) => mouseDown(day, e)}
			on:pointerup={(e) => mouseUp(day, e)}
			on:pointerenter={(e) => mouseEnter(day, e)}
			on:dblclick={(e) => e.preventDefault()}
			class:weekend={day.weekend}
			class:invalid={day.date < today}
			class:out-of-month={day.month !== month}
		>
			<div class="day-upper">
				<div class="day-upper-left">
					{day.day}
				</div>
				<div class="day-upper-right">
					{#if myMarks[day.YYYYMMDD]}
						<div
							class="circle"
							class:circle-empty={myMarks[day.YYYYMMDD]?.type === 2}
						/>
					{/if}
				</div>
			</div>
			<div class="day-lower">
				{#each Object.entries(dayMarks) as [userID, mark]}
					{#if userID !== myUserID}
						<div
							class="circle small"
							class:circle-empty={mark.type === 2}
							style="border-color: {users[userID].color
								? '#' + users[userID].color.toString(16).padStart(6, '0')
								: 'var(--color-theme-1)'};"
						/>
					{/if}
				{/each}
			</div>
		</li>
	{/each}
</ol>

<style>
	.header {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		margin: 0.8rem 0;
	}

	.header label {
		margin-right: 0.2em;
	}

	h2 {
		font-size: 2em;
		margin: 0 1rem 0 0;
	}

	form {
		flex-grow: 1;
		position: relative;
		top: -4px;
	}

	ol {
		display: grid;
		grid-template-columns: repeat(7, minmax(0, 1fr));
		list-style: none;
		margin: 0;
		padding: 0;
		text-align: center;
	}

	.weekdays {
		margin-bottom: 0.8rem;
		color: rgba(255, 255, 255, 0.6);
	}

	.month {
		row-gap: 1px;
		column-gap: 1px;
		overflow: hidden;
	}

	.day {
		height: 70px;
		box-sizing: border-box;
		background-color: rgba(255, 255, 255, 0.06);
		transition: background-color 50ms ease-out;
		position: relative;
		touch-action: manipulation;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		font-size: 1.5em;
	}

	.day .day-upper {
		display: flex;
		align-items: flex-start;
		cursor: default;
		user-select: none;
		height: 32px;
		padding-top: 6px;
	}

	.day .day-upper-left {
		padding-left: 0.4em;
		display: flex;
		flex-grow: 1;
	}

	.day .day-upper-right {
		display: flex;
		flex-grow: 1;
	}

	.day .day-lower {
		display: flex;
		flex-grow: 1;
		flex-direction: row-reverse;
		justify-content: flex-end;
		align-items: center;
		padding-left: 0.4em;
	}

	.day .circle {
		box-sizing: border-box;
		width: 32px;
		height: 32px;
		border-width: 16px;
		border-radius: 16px;
		border-style: solid;
		border-color: var(--color-theme-1);
	}

	.day .circle.circle-empty {
		border-width: 5px;
	}

	.day .circle.small {
		width: 20px;
		height: 20px;
		border-width: 10px;
		border-radius: 10px;
	}

	.day .circle.circle-empty.small {
		border-width: 4px;
	}

	.day .circle.small:not(:last-child) {
		margin-left: -12px;
	}

	.day.weekend {
		background-color: rgba(255, 255, 255, 0.1);
	}

	.day.out-of-month {
		background-color: rgba(255, 255, 255, 0.03);
	}

	.day.invalid {
		background-color: rgba(255, 255, 255, 0.02) !important;
		color: rgba(255, 255, 255, 0.25) !important;
	}

	.day.out-of-month.invalid {
		background-color: rgba(255, 255, 255, 0.008) !important;
	}

	.day:hover {
		background-color: rgba(255, 255, 255, 0.16);
		color: rgba(255, 255, 255, 0.9);
		transition: none;
	}

	@media (max-width: 480px) {
		.day {
			height: 54px;
			font-size: 0.9em;
		}

		.day .circle {
			width: 20px;
			height: 20px;
			border-width: 10px;
		}

		.day .circle.circle-empty {
			border-width: 3.125px;
		}
	}
</style>
