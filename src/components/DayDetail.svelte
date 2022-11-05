<script lang="ts">
	import { fly } from 'svelte/transition'
	import { page } from '$app/stores'
	import Dot from './Dot.svelte'
	import Notes from './Notes.svelte'
	import {
		MONTH_NAMES,
		WEEKDAY_NAMES,
		weekStart,
		type CalendarDay,
	} from '$lib/calendar'
	import { onMount } from 'svelte'
	import { enhance } from '$app/forms'

	export let day: CalendarDay
	export let marks: Mark[]
	export let notes: Note[]

	const myUserID = $page.data.discordMember!.id

	$: myMark = marks.find((mark) => mark.userID === myUserID)
	$: users = $page.data.users!
	$: otherMarkCount = marks.length - (myMark ? 1 : 0)

	$: rightAlignDay = day.weekday === ($weekStart + 6) % 7
	$: leftAlignDay = day.weekday === $weekStart

	let saving = false

	$: cornerStyle = rightAlignDay
		? 'border-top-right-radius: 0;'
		: leftAlignDay
		? 'border-top-left-radius: 0;'
		: ''

	let element: HTMLElement
	onMount(() => {
		setTimeout(() => {
			element &&
				element.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
		}, 100) // Delay matches duration of fly transition
	})
</script>

<div
	class="day-detail"
	in:fly={{ duration: 100, y: -80 }}
	bind:this={element}
	style={cornerStyle}
>
	<div class="column">
		<h3 class="day-heading">
			{WEEKDAY_NAMES[day.weekday]},
			{MONTH_NAMES[day.month]}
			{day.day}
		</h3>
		<h4>
			{#if otherMarkCount > 0}
				{#if myMark}
					You and {otherMarkCount} other{otherMarkCount > 1 ? 's' : ''}
				{:else}
					{otherMarkCount} {otherMarkCount > 1 ? 'people' : 'person'}
				{/if}
			{:else if myMark}
				It's just you
			{/if}
		</h4>
		<div class="marks">
			<form
				method="POST"
				action="?/mark"
				use:enhance={() => {
					saving = true
					return async ({ update }) => {
						saving = false
						update()
					}
				}}
			>
				<input name="day" hidden value={day.YYYYMMDD} />
				<input name="mark" hidden value={!myMark} />
				<button
					disabled={saving}
					class="user-mark my-mark"
					class:marked={myMark}
				>
					<Dot
						user={users[myUserID]}
						avatar={true}
						unmarked={!myMark}
						markable={true}
					/>
					{#if myMark}<span>{users[myUserID].name}</span>
					{:else}<span>Add me</span>{/if}
				</button>
			</form>
			{#each marks.filter((m) => m !== myMark) as { userID } (userID)}
				<div class="user-mark">
					<Dot user={users[userID]} avatar={true} />
					<span>{users[userID].name}</span>
				</div>
			{/each}
		</div>
	</div>
	<div class="column">
		<Notes {notes} {day} />
		<!-- TODO: Show user notes, and textbox for user to type a note 
	 Store notes separately from marks. A note can have an icon like X or ?
   shows alongside marks on calendar days in the user's color -->
	</div>
</div>

<style>
	.day-detail {
		width: 100%;
		box-sizing: border-box;
		grid-column: 1 / 8;
		display: flex;
		background: rgba(0, 0, 0, 0.25);
		padding: 10px 16px;
		border-radius: 20px;
		transition: border-radius 50ms ease-out;
	}

	.column {
		align-content: flex-start;
		width: 50%;
		display: flex;
		flex-wrap: wrap;
	}

	h3,
	h4 {
		width: 100%;
		font-weight: 400;
	}

	.day-heading {
		font-size: 2em;
		margin: 4px 0 6px;
		color: rgba(255, 255, 255, 0.5);
	}

	h4 {
		margin: 0 0 10px 4px;
	}

	.marks {
		display: flex;
		flex-wrap: wrap;
	}

	.user-mark {
		display: flex;
		align-items: center;
		color: var(--color-text);
		background: rgba(0, 0, 0, 0.4);
		padding: 7px 9px;
		margin: 0 6px 6px 0;
		border-radius: 12px;
		transition: background-color 50ms ease-out;
	}

	.my-mark {
		border: 2px solid var(--color-user);
		cursor: pointer;
	}

	.my-mark:hover {
		background: rgba(255, 255, 255, 0.1);
	}

	.user-mark span {
		margin-left: 5px;
	}

	.my-mark:not(.marked):hover span {
		color: #fff;
	}
</style>
