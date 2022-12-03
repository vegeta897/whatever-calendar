<script lang="ts">
	import { fly } from 'svelte/transition'
	import { page } from '$app/stores'
	import Vote from './Vote.svelte'
	import { weekStart, days, getPreDays, type CalendarDay } from '$lib/calendar'

	export let day: CalendarDay
	export let votes: VoteData[]
	export let preDays: ReturnType<typeof getPreDays>

	const myUserID = $page.data.discordMember!.id

	$: myVote = votes.find((vote) => vote.userID === myUserID)
	$: otherVotes = votes.filter((m) => m !== myVote)

	$: rightAlignDay = day.weekday === ($weekStart === 1 ? 7 : 6)
	$: leftAlignDay = day.weekday === $weekStart

	$: cornerStyle = rightAlignDay
		? 'border-top-right-radius: 0;'
		: leftAlignDay
		? 'border-top-left-radius: 0;'
		: ''

	$: gridRowStyle = ` grid-row: ${
		3 + Math.floor((preDays.length + $days.indexOf(day)) / 7)
	};`
</script>

<div
	class="day-detail"
	style={cornerStyle + gridRowStyle}
	in:fly={{ duration: 100, y: -80 }}
>
	<h3 class="day-heading">
		{day.datetime.weekdayLong},
		{day.datetime.monthLong}
		{day.day}
	</h3>
	<h4>
		{#if otherVotes.length > 0}
			{#if myVote}
				You and {otherVotes.length} other{otherVotes.length > 1 ? 's' : ''}
			{:else}
				{otherVotes.length} {otherVotes.length > 1 ? 'people' : 'person'}
			{/if}
		{:else if myVote}
			It's just you
		{:else}
			&nbsp;
		{/if}
	</h4>
	<div class="votes">
		<Vote vote={myVote} {day} mine />
		{#if otherVotes.length > 0}
			<hr />
		{/if}
		{#each otherVotes as vote, m (vote.YYYYMMDD + vote.userID)}
			<Vote {vote} {day} />
			{#if m < otherVotes.length - 1}
				<hr />
			{/if}
		{/each}
	</div>
</div>

<style>
	.day-detail {
		width: 100%;
		box-sizing: border-box;
		grid-column: 1 / 8;
		display: flex;
		flex-direction: column;
		box-shadow: 0 0 0 1px var(--color-fg);
		padding: calc(var(--day-height) / 5);
		border-radius: calc(var(--day-height) / 4);
		transition: border-radius 50ms ease-out;
	}

	h3,
	h4 {
		font-weight: 400;
	}

	.day-heading {
		font-size: 2rem;
		margin: 0 0 0.5rem 1rem;
	}

	h4 {
		margin: 0 0 0.5rem 1rem;
	}

	.votes {
		display: flex;
		flex-direction: column;
		padding: 0 1rem;
	}

	hr {
		width: 100%;
		border: none;
		border-top: 1px solid var(--color-fg);
		margin: 0.25rem 0;
	}

	@media (max-width: 50rem) {
		/* 800px */
	}

	@media (max-width: 35rem) {
		/* 560px */
		.day-heading {
			font-size: 1.5rem;
		}

		h4 {
			font-size: 0.875rem;
		}
	}
</style>
