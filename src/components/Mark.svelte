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
	import Pencil from './Pencil.svelte'

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
								<path d="M6 3 l8 8 v3 h-3 l-8 -8 Z" />
								<path d="M3 0 l2 2 l-3 3 l-2 -2 Z" />
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
		width: 18rem;
		flex-shrink: 0;
		overflow: hidden;
		margin-right: 0.75rem;
	}

	.user-info span {
		margin-left: 0.75rem;
		font-size: 1.3rem;
	}

	.my-mark .user-info {
		padding-right: calc(var(--note-input-height) + 1rem);
		width: calc(18rem + 0.875rem);
		box-sizing: border-box;
	}

	.my-mark .user-info button {
		color: var(--color-fg);
		display: flex;
		align-items: center;
		background: var(--color-bg);
		border-radius: 0.75rem;
		padding: 0.75rem;
		cursor: pointer;
		border: 1px solid transparent;
	}

	.my-mark.marked .user-info button {
		border: 1px solid var(--color-fg);
	}

	.my-mark .user-info button:hover {
		border: 1px solid var(--color-fg);
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
		left: calc(var(--note-input-height) * -1 - 1rem);
		cursor: pointer;
		background: var(--color-bg);
		box-shadow: 0 0 0 1px var(--color-fg);
		padding: 0.5625rem;
		border-radius: 0.5rem;
		height: var(--note-input-height);
		width: var(--note-input-height);
		box-sizing: border-box;
		display: flex;
	}

	.edit-note-button {
		fill: var(--color-fg);
	}

	.cancel-note-button {
		stroke: var(--color-fg);
	}

	.edit-note-button:hover {
		background: var(--color-fg);
		fill: var(--color-bg);
	}

	.cancel-note-button:hover {
		background: var(--color-fg);
		stroke: var(--color-bg);
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
		color: var(--color-fg);
		background: var(--color-bg);
		box-shadow: 0 0 0 1px var(--color-fg);
		border-radius: 8px;
		padding: 0.5rem;
		box-sizing: border-box;
		font-family: var(--font-body);
		font-size: 1rem;
		height: var(--note-input-height);
		border: none;
	}

	.my-note input[type='text']::placeholder {
		color: var(--color-fg);
	}

	.my-note input[type='text']:focus::placeholder,
	.my-note input[type='text']:focus-visible::placeholder {
		opacity: 0;
	}

	.my-note input[type='text']:enabled:hover {
	}

	.my-note input[type='text']:focus,
	.my-note input[type='text']:focus-visible {
		outline: none !important;
	}

	.my-note button {
		margin-left: 0.5rem;
		border: none;
		border-radius: 0.5rem;
		background: var(--color-bg);
		color: var(--color-fg);
		box-shadow: 0 0 0 1px var(--color-fg);
		cursor: pointer;
		padding: 0 0.625rem;
		height: 100%;
	}

	.my-note button:not(:disabled):hover {
		background: var(--color-fg);
		color: var(--color-bg);
	}

	.my-note button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.user-mark:not(.my-mark) {
		padding-left: 1.875rem;
	}

	.user-note {
		quotes: '\201C''\201D''\2018''\2019';
		position: relative;
		flex-grow: 1;
		line-height: 1.25rem;
		word-break: break-all;
	}

	.user-note::before,
	.user-note::after {
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
