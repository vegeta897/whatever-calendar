<script lang="ts">
	import { fade } from 'svelte/transition'
	import { quadOut } from 'svelte/easing'
	import { page } from '$app/stores'
	import { enhance } from '$app/forms'
	import { browser } from '$app/environment'
	import Avatar from './Avatar.svelte'
	import type { CalendarDay } from '$lib/calendar'
	import { afterNavigate, beforeNavigate } from '$app/navigation'
	import { saving } from './Calendar.svelte'
	import { onMount } from 'svelte'

	export let mark: MarkData | undefined
	export let day: CalendarDay
	export let mine = false

	const myUserID = $page.data.discordMember!.id
	const noJS = !browser

	$: users = $page.data.users!

	let myNoteText = mark?.note
	let myNoteTextArea: HTMLTextAreaElement
	let myNoteForm: HTMLFormElement

	function updateMyNoteTextAreaHeight() {
		if (!myNoteTextArea) return
		myNoteTextArea.style.height = '0'
		myNoteTextArea.style.height = `${myNoteTextArea.scrollHeight}px`
	}

	beforeNavigate(() => (myNoteText = mark?.note))
	afterNavigate(() => (myNoteText = mark?.note))

	onMount(() => {
		updateMyNoteTextAreaHeight()
	})
</script>

<div class="user-mark" class:my-mark={mine} class:marked={mine && mark}>
	<div class="user-info">
		{#if mine}
			<form
				method="POST"
				action="?/mark"
				use:enhance={() => {
					saving.set(true)
					if (mark) {
						myNoteText = ''
						mark = undefined
					} else {
						mark = {
							YYYYMMDD: day.YYYYMMDD,
							userID: myUserID,
							timestamp: Date.now(),
						}
					}
					return async ({ update }) => {
						saving.set(false)
						update()
					}
				}}
			>
				<input name="day" hidden value={day.YYYYMMDD} />
				<input name="mark" hidden value={!mark} />
				<button disabled={$saving}>
					<Avatar
						user={users[myUserID]}
						avatar
						markable={!$saving}
						unmarked={!mark}
					/>
					{#if mark}<span>{users[myUserID].name}</span>
					{:else}<span>Add me</span>{/if}
				</button>
			</form>
		{:else if mark}
			<Avatar user={users[mark.userID]} avatar />
			<span>{users[mark.userID].name}</span>
		{/if}
	</div>
	{#if mine && mark}
		<div
			class="user-note my-note"
			transition:fade={{ duration: 100, easing: quadOut }}
		>
			<form
				class="add-note"
				method="POST"
				action="?/note"
				bind:this={myNoteForm}
				use:enhance={() => {
					saving.set(true)
					if (myNoteText) myNoteText = myNoteText.substring(0, 256).trim()
					if (mark) mark.note = myNoteText
					return async ({ update }) => {
						saving.set(false)
						update()
					}
				}}
			>
				<input name="day" hidden value={day.YYYYMMDD} />
				<textarea
					name="noteText"
					disabled={$saving}
					bind:value={myNoteText}
					bind:this={myNoteTextArea}
					placeholder="Add a note"
					maxlength="256"
					on:change={updateMyNoteTextAreaHeight}
					on:keydown={(e) => {
						if (e.target && e.code === 'Enter' && !e.shiftKey) {
							myNoteForm.dispatchEvent(
								new Event('submit', { cancelable: true })
							)
							e.preventDefault()
						}
					}}
				/>
				<button
					disabled={!noJS &&
						($saving ||
							(myNoteText?.split('\r\n').join('\n') || '') ===
								(mark.note?.split('\r\n').join('\n') || ''))}
				>
					Save
				</button>
			</form>
		</div>
	{:else if mark?.note}
		<q class="user-note">{mark.note}</q>
	{/if}
</div>

<style>
	.user-mark {
		display: flex;
		align-items: center;
		text-align: left;
		width: 100%;
		box-sizing: border-box;
		background: rgba(0, 0, 0, 0.4);
		padding: 12px 16px;
		border-radius: 16px;
		transition: background-color 50ms ease-out;
	}

	:global(.user-mark + .user-mark) {
		margin-top: 8px;
	}

	.user-info {
		display: flex;
		align-items: center;
		width: 33.33%;
		flex-shrink: 0;
		overflow: hidden;
		margin-right: 12px;
	}

	.user-info span {
		margin-left: 12px;
		font-size: 1.3em;
	}

	.my-mark .user-info button {
		color: var(--color-text);
		display: flex;
		align-items: center;
		background: rgba(255, 255, 255, 0.05);
		border-radius: 12px;
		padding: 12px 11px;
		border: 2px solid transparent;
		cursor: pointer;
	}

	.my-mark.marked .user-info button {
		border: 2px solid var(--color-user);
		background: rgba(0, 0, 0, 0.4);
	}

	.my-mark .user-info button:hover {
		background: rgba(255, 255, 255, 0.08);
	}

	.my-mark:not(.marked) .user-info button:hover span {
		color: #fff;
	}

	.my-note {
		flex-grow: 1;
	}

	.my-note form {
		display: flex;
		flex-direction: row;
		align-items: center;
	}

	.my-note textarea {
		resize: none;
		overflow: hidden;
		flex-grow: 1;
		color: rgba(255, 255, 255, 0.6);
		background: rgba(255, 255, 255, 0.03);
		border-radius: 8px;
		padding: 6px 10px 10px;
		box-sizing: border-box;
		font-family: var(--font-body);
		font-size: 1rem;
		border: 2px solid transparent;
	}

	.my-note textarea:enabled:hover {
		background: rgba(255, 255, 255, 0.05);
	}

	.my-note textarea:focus,
	.my-note textarea:focus-visible {
		color: #fff;
		outline: none !important;
		border: 2px solid rgba(255, 255, 255, 0.3);
	}

	.my-note button {
		margin-left: 8px;
		border: none;
		border-radius: 8px;
		background: rgba(255, 255, 255, 0.05);
		color: var(--color-text);
		cursor: pointer;
		padding: 0 10px;
		height: 38px;
	}

	.my-note button:hover {
		background: rgba(255, 255, 255, 0.08);
	}

	.my-note button:disabled {
		background: rgba(255, 255, 255, 0.03);
		color: rgba(255, 255, 255, 0.2);
	}

	.my-mark {
		background: rgba(0, 0, 0, 0.2);
	}

	.my-mark.marked {
		background: rgba(0, 0, 0, 0.4);
	}

	.user-mark:not(.my-mark) {
		padding-left: 29px;
	}

	.user-note {
		quotes: '\201C''\201D''\2018''\2019';
		position: relative;
		color: rgba(255, 255, 255, 0.6);
	}

	.user-note::before,
	.user-note::after {
		color: rgba(255, 255, 255, 0.3);
		font-size: 1.2em;
		position: relative;
	}

	.user-note::before {
		left: -2px;
	}

	.user-note::after {
		right: -2px;
	}
</style>
