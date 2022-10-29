<script lang="ts">
	import type { PageData } from './$types'
	import Calendar from '../../components/Calendar.svelte'
	import { browser } from '$app/environment'
	import { weekStart, days } from '$lib/calendar'
	import { serialize } from 'cookie'

	export let data: PageData

	const discordMember = data.discordMember!
	const username = discordMember.nick || discordMember.username

	weekStart.set(data.weekStart || 0)

	if (browser) {
		console.log(data)
		weekStart.subscribe((value) => {
			document.cookie = serialize(`wec-weekStart`, `${value}`, {
				maxAge: 90 * 24 * 60 * 60,
			})
			// TODO: Save locale in cookie too, to SSR with correct language
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
	<Calendar daySelected={$days.find((d) => d.YYYYMMDD === data.day)} />
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		align-items: center;
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
</style>
