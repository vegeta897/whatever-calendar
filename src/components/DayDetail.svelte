<script lang="ts">
	import { fly } from 'svelte/transition'
	import { page } from '$app/stores'
	import Mark from './Mark.svelte'
	import { weekStart, type CalendarDay } from '$lib/calendar'

	export let day: CalendarDay
	export let marks: MarkData[]

	const myUserID = $page.data.discordMember!.id

	$: myMark = marks.find((mark) => mark.userID === myUserID)
	$: otherMarks = marks.filter((m) => m !== myMark)

	$: rightAlignDay = day.weekday === ($weekStart === 1 ? 7 : 6)
	$: leftAlignDay = day.weekday === $weekStart

	$: cornerStyle = rightAlignDay
		? 'border-top-right-radius: 0;'
		: leftAlignDay
		? 'border-top-left-radius: 0;'
		: ''
</script>

<div class="day-detail" style={cornerStyle} in:fly={{ duration: 100, y: -80 }}>
	<h3 class="day-heading">
		{day.datetime.weekdayLong},
		{day.datetime.monthLong}
		{day.day}
	</h3>
	<h4>
		{#if otherMarks.length > 0}
			{#if myMark}
				You and {otherMarks.length} other{otherMarks.length > 1 ? 's' : ''}
			{:else}
				{otherMarks.length} {otherMarks.length > 1 ? 'people' : 'person'}
			{/if}
		{:else if myMark}
			It's just you
		{:else}
			&nbsp;
		{/if}
	</h4>
	<div class="marks">
		<Mark mark={myMark} {day} mine />
		{#if otherMarks.length > 0}
			<hr />
		{/if}
		{#each otherMarks as mark, m (mark.YYYYMMDD + mark.userID)}
			<Mark {mark} {day} />
			{#if m < otherMarks.length - 1}
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
		padding: 1.25rem;
		border-radius: 1.25rem;
		transition: border-radius 50ms ease-out;
	}

	h3,
	h4 {
		width: 100%;
		font-weight: 400;
	}

	.day-heading {
		font-size: 2rem;
		margin: 0 0 0.5rem 1rem;
	}

	h4 {
		margin: 0 0 0.5rem 1rem;
	}

	.marks {
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
