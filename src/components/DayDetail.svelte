<script lang="ts">
	import { fly } from 'svelte/transition'
	import { page } from '$app/stores'
	import Dot from './Dot.svelte'
	import { MONTH_NAMES, WEEKDAY_NAMES, type CalendarDay } from '$lib/calendar'
	import { onMount } from 'svelte'
	import { enhance } from '$app/forms'

	export let day: CalendarDay
	export let marks: Record<string, Mark>
	export let myMark: Mark | null

	const myUserID = $page.data.discordMember!.id
	$: users = $page.data.users!

	let newNote: string

	let element: HTMLElement
	onMount(() => {
		setTimeout(() => {
			element.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
		}, 100) // Delay matches duration of fly transition
	})
</script>

<div class="day-detail" in:fly={{ duration: 100, y: -80 }} bind:this={element}>
	<h3 class="day-heading">
		{WEEKDAY_NAMES[day.weekday]},
		{MONTH_NAMES[day.month]}
		{day.day}
	</h3>
	<div class="marks">
		{Object.entries(marks).length} people
		{#each Object.entries(marks) as [userID, mark]}
			<div class="user-mark">
				<Dot user={users[userID]} expanded={true} />
				<span class="username">{users[userID].name}</span>
			</div>
		{/each}
		<div class="user-mark">
			<Dot user={users[myUserID]} expanded={true} plus={!myMark} />
			{#if myMark}<span class="username">{users[myUserID].name}</span>{/if}
		</div>
	</div>
	<div class="notes">
		<form
			method="POST"
			action="?/notes"
			use:enhance={() => {
				// unsaved = false
				// saving = true
				return async ({ update }) => {
					// saving = false
					update()
				}
			}}
		>
			<textarea name="newNote" bind:value={newNote} />
			<button disabled={!newNote}>Save Note</button>
		</form>
	</div>
	<!-- TODO: Show user notes, and textbox for user to type a note 
	 Store notes separately from marks. A note can have an icon like X or ?
   shows alongside marks on calendar days in the user's color -->
</div>

<style>
	.day-detail {
		width: 100%;
		grid-column: 1 / 8;
		display: flex;
		flex-wrap: wrap;
		background: rgba(0, 0, 0, 0.25);
		padding: 10px 16px;
		border-radius: 20px;
	}

	.day-heading {
		width: 100%;
		font-size: 2em;
		font-weight: 400;
		margin: 4px 0 14px;
		color: rgba(255, 255, 255, 0.5);
	}

	.marks {
		display: flex;
		flex-wrap: wrap;
		width: 50%;
	}

	.user-mark {
		display: flex;
		align-items: center;
		background: rgba(0, 0, 0, 0.4);
		padding: 8px 10px;
		margin-right: 6px;
		margin-bottom: 4px;
		border-radius: 12px;
	}

	.username {
		margin-left: 5px;
	}

	.notes {
		width: 50%;
	}
</style>
