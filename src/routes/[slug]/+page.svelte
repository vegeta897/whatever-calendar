<script lang="ts">
	import type { PageData } from './$types'
	import Calendar from '../../components/Calendar.svelte'
	import Avatar from '../../components/Avatar.svelte'
	import { browser } from '$app/environment'
	import { weekStart, days } from '$lib/calendar'
	import { serialize } from 'cookie'

	export let data: PageData

	const discordMember = data.discordMember!
	const discordUser = data.users![discordMember.id]
	const username = discordMember.nick || discordMember.username

	weekStart.set(data.weekStart || 7)

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

<section>
	<div class="header">
		<div class="user-info">
			<Avatar user={discordUser} size="1.5rem" />
			<span>{username}</span>
		</div>
		<a href="/api/logout" data-sveltekit-prefetch="off">Sign out</a>
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
		margin-top: 0.5rem;
		gap: 1.5rem;
	}

	.user-info {
		display: flex;
	}

	.user-info span {
		margin-left: 0.25rem;
	}
</style>
