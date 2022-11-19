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

	export let mark: MarkData | undefined
	export let day: CalendarDay
	export let mine = false

	const myUserID = $page.data.discordMember!.id
	const noJS = !browser

	$: users = $page.data.users!

	let myNoteText = mark?.note
	let myNoteDetailsElement: HTMLDetailsElement

	beforeNavigate(() => (myNoteText = mark?.note))
	afterNavigate(() => (myNoteText = mark?.note))
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
			<details bind:this={myNoteDetailsElement} open={!mark.note}>
				<summary>
					{#if mark.note}
						<div class="edit-note-button">
							<svg
								viewBox="0 0 14 14"
								version="1.1"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path d="M6 3 l8 8 v3 h-3 l-8 -8 Z" fill="#fffa" />
								<path d="M3 0 l2 2 l-3 3 l-2 -2 Z" fill="#fffa" />
							</svg>
						</div>
						<div class="cancel-note-button">
							<svg
								viewBox="0 0 10 10"
								version="1.1"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M1.5 1.5 L8.5 8.5 M8.5 1.5 L1.5 8.5"
									stroke="#fffa"
									stroke-width="2"
								/>
							</svg>
						</div>
						<q class="user-note">{mark.note}</q>
					{/if}
				</summary>
				<form
					class="add-note"
					method="POST"
					action="?/note"
					use:enhance={() => {
						saving.set(true)
						if (myNoteText) myNoteText = myNoteText.substring(0, 256).trim()
						if (mark) mark.note = myNoteText
						return async ({ update }) => {
							saving.set(false)
							myNoteDetailsElement.open = !myNoteText
							update()
						}
					}}
				>
					<input name="day" hidden value={day.YYYYMMDD} />
					<input
						type="text"
						name="noteText"
						disabled={$saving}
						bind:value={myNoteText}
						placeholder="Add a note"
						maxlength="256"
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
			</details>
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
		padding: 0.75rem 1rem;
		border-radius: 1rem;
		transition: background-color 50ms ease-out;
		--note-input-height: 2.5rem;
	}

	:global(.user-mark + .user-mark) {
		margin-top: 0.5rem;
	}

	.user-info {
		display: flex;
		align-items: center;
		width: 16rem;
		flex-shrink: 0;
		overflow: hidden;
		margin-right: 0.75rem;
	}

	.user-info span {
		margin-left: 0.75rem;
		font-size: 1.3rem;
	}

	.my-mark .user-info {
		padding-right: calc(var(--note-input-height) + 0.5rem);
		width: calc(16rem + 0.875rem);
		box-sizing: border-box;
	}

	.my-mark .user-info button {
		color: var(--color-text);
		display: flex;
		align-items: center;
		background: rgba(255, 255, 255, 0.05);
		border-radius: 0.75rem;
		padding: 0.75rem;
		border: 0.125rem solid transparent;
		cursor: pointer;
	}

	.my-mark.marked .user-info button {
		border-color: var(--color-user);
		background: rgba(0, 0, 0, 0.4);
	}

	.my-mark .user-info button:hover {
		background: rgba(255, 255, 255, 0.08);
	}

	.my-mark:not(.marked) .user-info button:hover span {
		color: #fff;
	}

	details[open] summary {
		position: absolute;
		height: 100%;
	}

	summary {
		display: flex;
		align-items: center;
		list-style: none;
		counter-increment: none;
	}
	summary::-webkit-details-marker {
		display: none;
	}

	.edit-note-button,
	.cancel-note-button {
		position: absolute;
		left: calc(var(--note-input-height) * -1 - 0.5rem);
		cursor: pointer;
		background: rgba(255, 255, 255, 0.05);
		padding: 0.5625rem;
		border-radius: 0.5rem;
		height: var(--note-input-height);
		width: var(--note-input-height);
		box-sizing: border-box;
		display: flex;
	}

	.edit-note-button:hover,
	.cancel-note-button:hover {
		background: rgba(255, 255, 255, 0.08);
	}

	.cancel-note-button,
	details[open] .user-note,
	details[open] .edit-note-button {
		display: none;
	}

	details[open] .cancel-note-button {
		display: flex;
	}

	.my-note {
		flex-grow: 1;
	}

	.my-note form {
		display: flex;
		flex-direction: row;
		align-items: center;
		height: var(--note-input-height);
	}

	.my-note input[type='text'] {
		resize: none;
		overflow: hidden;
		flex-grow: 1;
		color: rgba(255, 255, 255, 0.6);
		background: rgba(255, 255, 255, 0.05);
		border-radius: 8px;
		padding: 6px 10px 8px;
		box-sizing: border-box;
		font-family: var(--font-body);
		font-size: 1rem;
		height: var(--note-input-height);
		border: 2px solid rgba(255, 255, 255, 0.1);
	}

	.my-note input[type='text']:enabled:hover {
		background: rgba(255, 255, 255, 0.05);
	}

	.my-note input[type='text']:focus,
	.my-note input[type='text']:focus-visible {
		color: #fff;
		outline: none !important;
		border: 2px solid rgba(255, 255, 255, 0.3);
	}

	.my-note button {
		margin-left: 0.5rem;
		border: none;
		border-radius: 0.5rem;
		background: rgba(255, 255, 255, 0.05);
		color: var(--color-text);
		cursor: pointer;
		padding: 0 0.625rem;
		height: 100%;
	}

	.my-note button:hover {
		background: rgba(255, 255, 255, 0.08);
	}

	.my-note button:disabled {
		background: rgba(255, 255, 255, 0.03);
		color: rgba(255, 255, 255, 0.2);
		cursor: not-allowed;
	}

	.my-mark {
		background: rgba(0, 0, 0, 0.2);
	}

	.my-mark.marked {
		background: rgba(0, 0, 0, 0.4);
	}

	.user-mark:not(.my-mark) {
		padding-left: 1.875rem;
	}

	.user-note {
		quotes: '\201C''\201D''\2018''\2019';
		position: relative;
		color: rgba(255, 255, 255, 0.6);
		flex-grow: 1;
		line-height: 1.25rem;
	}

	.user-note::before,
	.user-note::after {
		color: rgba(255, 255, 255, 0.3);
		font-size: 1.2rem;
		position: relative;
	}

	.user-note::before {
		left: -0.125rem;
	}

	.user-note::after {
		right: -0.125rem;
	}
</style>
