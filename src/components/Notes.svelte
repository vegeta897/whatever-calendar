<script lang="ts">
	import { page } from '$app/stores'
	import { enhance } from '$app/forms'
	import { DateTime, Duration } from 'luxon'
	import type { CalendarDay } from '$lib/calendar'

	export let day: CalendarDay
	export let notes: Note[]

	const myUserID = $page.data.discordMember!.id
	$: users = $page.data.users!

	let saving = false
	let noteText: string
	let noteTextArea: HTMLTextAreaElement
	let noteAddForm: HTMLFormElement

	function relativeTime(timestamp: number) {
		const datetime = DateTime.fromMillis(timestamp)
		if (datetime.diffNow().as('minutes') > -1) return 'just now'
		return datetime.toRelative({ unit: ['days', 'hours', 'minutes'] })
	}
</script>

<div class="notes">
	<ol>
		{#each notes as note (note.userID + note.timestamp)}
			{@const user = users[note.userID]}
			{@const date = new Date(note.timestamp)}
			<li>
				<span class="username" style="color: {user.color}">{user.name}</span>
				<span class="note-text">{note.text}</span>
				<time
					title={date.toLocaleString()}
					datetime={date.toISOString()}
					class="note-date">{relativeTime(note.timestamp)}</time
				>
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
	<form
		class="add-note"
		method="POST"
		action="?/addNote"
		bind:this={noteAddForm}
		use:enhance={() => {
			saving = true
			return async ({ update }) => {
				saving = false
				noteText = ''
				update()
			}
		}}
	>
		<input name="day" hidden value={day.YYYYMMDD} />
		<textarea
			name="noteText"
			disabled={saving}
			bind:value={noteText}
			bind:this={noteTextArea}
			placeholder="Add a note"
			on:focus={() => {
				noteTextArea.setAttribute('placeholder', '')
			}}
			on:blur={() => {
				noteTextArea.setAttribute('placeholder', 'Add a note')
			}}
			on:keydown={(e) => {
				if (e.target && e.code === 'Enter' && !e.shiftKey) {
					noteAddForm.dispatchEvent(new Event('submit', { cancelable: true }))
					e.preventDefault()
				}
			}}
		/>
		<button disabled={saving || !noteText}>Post</button>
	</form>
</div>

<style>
	.notes {
		width: 100%;
	}

	.notes ol {
		list-style: none;
		margin: 12px 0 0;
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

	.notes li .note-date {
		display: block;
		font-size: 0.8em;
		color: rgba(255, 255, 255, 0.4);
		margin: 2px 0 0;
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
		top: 8px;
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
		align-items: flex-start;
	}

	.notes textarea {
		font: var(--font-body);
		background: rgba(255, 255, 255, 0.04);
		color: var(--color-text);
		border-radius: 16px;
		border: none;
		padding: 8px 20px;
		font-size: 1em;
		min-height: 76px;
		resize: vertical;
		width: 100%;
		box-sizing: border-box;
	}

	.notes textarea:focus {
		background: rgba(255, 255, 255, 0.02);
		outline: 2px solid rgba(255, 255, 255, 0.1);
	}

	.notes form.add-note button {
		cursor: pointer;
		margin-top: 8px;
		color: var(--color-text);
		border-radius: 16px;
		padding: 8px 20px;
		background: rgba(0, 0, 0, 0.8);
		border: none;
	}

	.notes form.add-note button:hover {
		background: rgba(0, 0, 0, 0.5);
	}

	.notes form.add-note button:disabled {
		color: rgba(255, 255, 255, 0.35);
		background: rgba(0, 0, 0, 0.3);
	}
</style>
