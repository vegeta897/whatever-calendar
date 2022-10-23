<script lang="ts">
	import Calendar from './Calendar.svelte'
	import MonthMini from './MonthMini.svelte'
	import { MONTHS, weekStart, YEAR } from '$lib/calendar'
	import { fade } from 'svelte/transition'
	import { cubicOut } from 'svelte/easing'
	import { browser } from '$app/environment'
	import { page } from '$app/stores'
	import { serialize } from 'cookie'

	const discordMember = $page.data.discordMember!
	const username = discordMember.nick || discordMember.username

	let focusedMonth: number = MONTHS[0]

	if (browser) {
		weekStart.subscribe((value) => {
			document.cookie = serialize(`wec-weekStart`, `${value}`, {
				maxAge: 90 * 24 * 60 * 60,
			})
			// Save locale in cookie too, to SSR with correct language
		})
	}
</script>

<section
	style="--color-user:#{discordMember.color.toString(16).padStart(6, '0')};"
>
	<div class="header">
		<img width="24px" alt="{username}'s avatar" src={discordMember.avatarURL} />
		<span class="username">{username}</span><a
			href="/api/logout"
			data-sveltekit-prefetch="off">Log out</a
		>
	</div>
	<!-- <div class="month-select">
		{#each MONTHS as month}
			<MonthMini
				year={YEAR}
				{month}
				focused={focusedMonth === month}
				onClick={() => (focusedMonth = month)}
			/>
		{/each}
	</div> -->
	<div class="big-month-container">
		{#each MONTHS as month}
			{#if month === focusedMonth}
				<div
					class="big-month"
					transition:fade={{ duration: 100, easing: cubicOut }}
				>
					<Calendar />
				</div>
			{/if}
		{/each}
	</div>
</section>

<style>
	section {
		width: 100%;
	}

	.header {
		display: flex;
		align-items: center;
		gap: 0.4em;
	}

	.header img {
		border-radius: 15px;
		border: 3px solid var(--color-user);
		margin-right: 0.2rem;
	}

	.username {
		color: var(--color-user);
		font-weight: bold;
	}

	.month-select {
		display: flex;
		flex-wrap: wrap;
		gap: 2%;
		width: 100%;
		margin: 1rem 0;
	}

	.big-month-container {
		margin-bottom: 1rem;
		display: grid;
	}

	.big-month {
		width: 100%;
		grid-area: 1 / 1 /2 /2;
	}
</style>
