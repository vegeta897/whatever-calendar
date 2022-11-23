<script lang="ts">
	import type { PageData } from './$types'
	import Calendar from '../../components/Calendar.svelte'
	import Sidebar from '../../components/Sidebar.svelte'
	import { browser } from '$app/environment'
	import { weekStart, days, getDays } from '$lib/calendar'
	import { serialize } from 'cookie'

	export let data: PageData

	weekStart.set(data.weekStart || 7)

	let selectedUserID: string | null = data.selectedUserID

	days.set(getDays())

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
	<Sidebar bind:selectedUserID />
	<Calendar {selectedUserID} />
</section>

<style>
	section {
		display: flex;
		align-items: flex-start;
		padding-top: 0.875rem;
	}
</style>
