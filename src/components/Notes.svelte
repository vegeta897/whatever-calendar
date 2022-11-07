<script lang="ts">
	import { page } from '$app/stores'
	import { enhance } from '$app/forms'
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
		const sec = Math.floor((Date.now() - timestamp) / 1000)
		if (sec < 30) return 'just now'
		const minutes = Math.round(sec / 60)
		if (minutes === 1) return `${minutes} minute ago`
		if (minutes < 60) return `${minutes} minutes ago`
		const hours = Math.round(sec / 60 / 60)
		if (hours === 1) return `${hours} hour ago`
		if (hours < 24) return `${hours} hours ago`
		const days = Math.round(sec / 60 / 60 / 24)
		if (days === 1) return `${days} day ago`
		return `${days} days ago`
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
		<button disabled={saving || !noteText}>Save Note</button>
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
	}

	.notes textarea {
		font: var(--font-body);
		background: rgba(255, 255, 255, 0.04);
		color: var(--color-text);
		border-radius: 16px;
		border: none;
		padding: 8px 20px;
		font-size: 1em;
		min-height: 60px;
		resize: vertical;
	}

	.notes textarea:focus {
		background: rgba(255, 255, 255, 0.02);
		outline: 1px solid rgba(255, 255, 255, 0.1);
	}

	.notes button {
	}
</style>
