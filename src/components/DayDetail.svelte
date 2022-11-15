<script lang="ts">
	import { fly } from 'svelte/transition'
	import { page } from '$app/stores'
	import Mark from './Mark.svelte'
	import { weekStart, type CalendarDay } from '$lib/calendar'

	export let day: CalendarDay
	export let marks: MarkData[]

	const myUserID = $page.data.discordMember!.id

	$: myMark = marks.find((mark) => mark.userID === myUserID)
	$: otherMarkCount = marks.length - (myMark ? 1 : 0)

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
		{#if otherMarkCount > 0}
			{#if myMark}
				You and {otherMarkCount} other{otherMarkCount > 1 ? 's' : ''}
			{:else}
				{otherMarkCount} {otherMarkCount > 1 ? 'people' : 'person'}
			{/if}
		{:else if myMark}
			It's just you
		{:else}
			&nbsp;
		{/if}
	</h4>
	<div class="marks">
		<Mark mark={myMark} {day} mine />
		{#each marks.filter((m) => m !== myMark) as mark (mark.userID)}
			<Mark {mark} {day} />
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
		background: rgba(0, 0, 0, 0.25);
		padding: 14px 20px;
		border-radius: 20px;
		transition: border-radius 50ms ease-out;
	}

	h3,
	h4 {
		width: 100%;
		font-weight: 400;
	}

	.day-heading {
		font-size: 2em;
		margin: 0 0 6px 14px;
		color: rgba(255, 255, 255, 0.5);
	}

	h4 {
		margin: 0 0 10px 18px;
	}

	.marks {
		display: flex;
		flex-direction: column;
	}
</style>
