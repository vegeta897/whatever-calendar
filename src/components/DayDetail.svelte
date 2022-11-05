<script lang="ts">
	import { fly } from 'svelte/transition'
	import { page } from '$app/stores'
	import Dot from './Dot.svelte'
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

	let addingNote = false
	let noteText: string
	let saving = false
	let noteTextArea: HTMLTextAreaElement

	$: if (noteTextArea) {
		noteTextArea.focus()
	}

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
		<div class="notes">
			<ol>
				{#each notes as note (note.userID + note.timestamp)}
					{@const user = users[note.userID]}
					<li>
						<span class="username" style="color: {user.color}">{user.name}</span
						>
						<span class="note-text">{note.text}</span>
						{#if note.userID === myUserID}
							<form method="POST" action="?/deleteNote" use:enhance>
								<input
									name="noteID"
									hidden
									value={`${day.YYYYMMDD}:${note.userID}:${note.timestamp}`}
								/>
								<button>Delete Note</button>
							</form>
						{/if}
					</li>
				{/each}
			</ol>
			{#if !addingNote}
				<button on:click={() => (addingNote = true)}>Add Note</button>
			{/if}
			{#if addingNote}
				<form
					class="add-note"
					method="POST"
					action="?/addNote"
					use:enhance={() => {
						// unsaved = false
						// saving = true
						return async ({ update }) => {
							// saving = false
							noteText = ''
							addingNote = false
							update()
						}
					}}
				>
					<input name="day" hidden value={day.YYYYMMDD} />
					<textarea
						name="noteText"
						bind:value={noteText}
						bind:this={noteTextArea}
					/>
					<button disabled={!noteText}>Save Note</button>
				</form>
			{/if}
		</div>
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
		margin: 0 6px 4px 0;
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

	.notes {
		width: 100%;
	}

	.notes ol {
		list-style: none;
		margin: 12px 0;
		padding: 0;
		display: flex;
		flex-direction: column;
	}

	.notes li {
		width: 100%;
		background: rgba(255, 255, 255, 0.06);
		border-radius: 16px;
		padding: 8px 40px 8px 20px;
		margin-bottom: 8px;
		box-sizing: border-box;
		position: relative;
	}

	.notes li .username {
		font-weight: 700;
		margin-right: 5px;
	}

	.notes li .note-text {
		white-space: pre-wrap;
	}

	.notes li form {
		width: 0;
		height: 0;
		margin: 0;
	}

	.notes li button {
		font-size: 0;
		padding: 0;
		width: 24px;
		height: 24px;
		position: absolute;
		right: 8px;
		top: 6px;
		background: none;
		border: none;
		cursor: pointer;
		overflow: hidden;
	}

	.notes li button:after {
		font-size: 32px;
		line-height: 24px;
		height: 24px;
		color: rgba(255, 255, 255, 0.2);
		transition: color 100ms ease-out;
		content: '\00d7';
	}

	.notes li button:hover:after {
		color: rgba(255, 255, 255, 0.8);
	}

	.notes form.add-note {
		display: flex;
		flex-direction: column;
	}

	.notes textarea {
		font-size: 1em;
		min-height: 60px;
	}

	.notes button {
	}
</style>
