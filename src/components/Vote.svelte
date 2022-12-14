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

	// This component is pretty big, can it be split?

	export let vote: VoteData | undefined
	export let day: CalendarDay
	export let mine = false

	const myUserID = $page.data.discordMember!.id
	const noJS = !browser

	$: users = $page.data.users!

	let myNoteText = vote?.note
	let myNoteDetailsElement: HTMLDetailsElement

	beforeNavigate(() => (myNoteText = vote?.note))
	afterNavigate(() => (myNoteText = vote?.note))
</script>

<div class="user-vote" class:my-vote={mine} class:voted={mine && vote}>
	<div class="user-info">
		{#if mine}
			<form
				method="POST"
				action="?/vote"
				use:enhance={() => {
					saving.set(true)
					if (vote) {
						myNoteText = ''
						vote = undefined
					} else {
						vote = {
							YYYYMMDD: day.YYYYMMDD,
							userID: myUserID,
							timestamp: Date.now(),
						}
					}
					return async ({ update }) => {
						saving.set(false)
						update({ reset: false })
					}
				}}
			>
				<input name="day" hidden value={day.YYYYMMDD} />
				<input name="vote" hidden value={!vote} />
				<button disabled={$saving}>
					<Avatar
						user={users[myUserID]}
						canVote={!$saving}
						unvoted={!vote}
						responsive
					/>
					{#if vote}<span>{users[myUserID].name}</span>
					{:else}<span>Add your vote</span>{/if}
				</button>
			</form>
		{:else if vote}
			<Avatar user={users[vote.userID]} responsive />
			<span>{users[vote.userID].name}</span>
		{/if}
	</div>
	{#if mine && vote}
		<div
			class="user-note my-note"
			class:no-note={!vote.note}
			transition:fade|local={{ duration: 100, easing: quadOut }}
		>
			<details bind:this={myNoteDetailsElement} open={!vote.note}>
				<summary>
					{#if vote.note}
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
						<q class="user-note">{vote.note}</q>
					{/if}
				</summary>
				<form
					class="add-note"
					method="POST"
					action="?/note"
					use:enhance={() => {
						saving.set(true)
						if (myNoteText) myNoteText = myNoteText.substring(0, 256).trim()
						if (vote) vote.note = myNoteText
						return async ({ update }) => {
							saving.set(false)
							myNoteDetailsElement.open = !myNoteText
							update({ reset: false })
						}
					}}
				>
					<input name="day" hidden value={day.YYYYMMDD} />
					<div class="note-input-wrapper">
						<input
							type="text"
							name="noteText"
							disabled={$saving}
							bind:value={myNoteText}
							placeholder="Add a note"
							maxlength="256"
						/>
					</div>
					<button
						disabled={!noJS &&
							($saving ||
								(myNoteText?.split('\r\n').join('\n') || '') ===
									(vote.note?.split('\r\n').join('\n') || ''))}
					>
						Save
					</button>
				</form>
			</details>
		</div>
	{:else if vote?.note}
		<q class="user-note">{vote.note}</q>
	{/if}
</div>

<style>
	.user-vote {
		display: flex;
		align-items: center;
		text-align: left;
		width: 100%;
		box-sizing: border-box;
		padding: 0.75rem 0;
		border-radius: 1rem;
		transition: background-color 50ms ease-out;
		--note-input-height: 2.5rem;
	}

	:global(.user-vote + .user-vote) {
		margin-top: 0.5rem;
	}

	.user-info {
		display: flex;
		align-items: center;
		width: 19rem;
		flex-shrink: 0;
		overflow: hidden;
		padding-right: 0.75rem;
		box-sizing: border-box;
	}

	.user-info span {
		margin-left: 0.75rem;
		font-size: 1.3rem;
		text-align: left;
	}

	.my-vote .user-info {
		padding-right: calc(var(--note-input-height) + 2rem);
	}

	.my-vote .user-info button {
		color: var(--color-fg);
		display: flex;
		align-items: center;
		background: var(--color-bg);
		border-radius: 0.75rem;
		padding: 0.75rem;
		cursor: pointer;
		box-shadow: none;
		border: 1px solid transparent;
	}

	.my-vote.voted .user-info button {
		border: 1px solid var(--color-fg);
	}

	@media (hover: hover) {
		.my-vote .user-info button:hover {
			border: 1px solid var(--color-fg);
		}
	}

	details[open] summary {
		position: absolute;
		height: var(--note-input-height);
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

	@media (hover: hover) {
		.edit-note-button:hover {
			background: var(--color-fg);
			fill: var(--color-bg);
		}

		.cancel-note-button:hover {
			background: var(--color-fg);
			stroke: var(--color-bg);
		}
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

	.my-note .note-input-wrapper {
		border: 1px solid var(--color-fg);
		border-radius: 0.5rem;
		flex-grow: 1;
	}

	.my-note input[type='text'] {
		overflow: hidden;
		color: var(--color-fg);
		background: none;
		padding: 0.5rem;
		box-sizing: border-box;
		font-family: var(--font-body);
		font-size: 1rem;
		height: var(--note-input-height);
		border: none;
		width: 100%;
		max-width: 100%;
		min-width: 10rem;
	}

	.my-note input[type='text']::placeholder {
		color: var(--color-fg);
	}

	.my-note input[type='text']:focus::placeholder,
	.my-note input[type='text']:focus-visible::placeholder {
		opacity: 0;
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
		flex-shrink: 0;
	}

	@media (hover: hover) {
		.my-note button:not(:disabled):hover {
			background: var(--color-fg);
			color: var(--color-bg);
		}
	}

	.my-note button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.user-vote:not(.my-vote) .user-info {
		padding-left: 0.8125rem;
	}

	.user-note {
		quotes: '\201C''\201D''\2018''\2019';
		position: relative;
		flex-grow: 1;
		line-height: 1.25rem;
		word-break: break-word;
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

	@media (max-width: 50rem) {
		/* 800px */
		.user-vote {
			flex-wrap: wrap;
			padding: 0.75rem 0 0;
		}

		.user-info {
			width: 100%;
		}

		.my-vote .user-info {
			padding-right: 0;
			margin-right: 0;
			width: 100%;
		}

		.user-info:last-child {
			margin-bottom: 0.75rem;
		}

		.user-note {
			width: calc(100% - calc(var(--note-input-height) + 1rem));
			margin: 0.75rem 0;
			padding-left: 1rem;
		}

		.my-note {
			margin-left: calc(var(--note-input-height) + 1rem);
			padding-left: 0;
		}

		.my-note.no-note {
			margin-left: 0;
		}
	}

	@media (max-width: 30rem) {
		/* 480px */
		.user-vote {
			padding-top: 0.5rem;
		}

		.user-info:last-child {
			margin-bottom: 0.5rem;
		}

		.user-info span {
			font-size: 1rem;
		}

		.user-note {
			font-size: 0.875rem;
		}

		details[open] summary {
			top: 1px;
		}

		.my-note form {
			flex-wrap: wrap;
			flex-direction: row-reverse;
			height: calc(var(--note-input-height) * 2 + 0.5rem);
		}

		.my-note .note-input-wrapper {
			width: 100%;
		}

		.my-note button {
			margin-top: 0.5rem;
			font-size: 1rem;
			height: var(--note-input-height);
		}

		.user-note::before,
		.user-note::after {
			font-size: 1rem;
		}
	}
</style>
