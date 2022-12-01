<script lang="ts">
	import type { PageData } from './$types'
	import Calendar, {
		selectedUserID,
		saving,
	} from '../../components/Calendar.svelte'
	import SidebarContainer from '../../components/SidebarContainer.svelte'
	import Topbar from '../../components/Topbar.svelte'
	import { browser } from '$app/environment'
	import { weekStart, days, getDays } from '$lib/calendar'
	import { onDestroy } from 'svelte'
	import { invalidateAll } from '$app/navigation'

	export let data: PageData

	weekStart.set(data.weekStart || 7)
	selectedUserID.set(data.selectedUserID)
	days.set(getDays())

	if (browser) {
		console.log(data)
		const refreshInterval = setInterval(async () => {
			saving.set(true)
			await invalidateAll()
			saving.set(false)
		}, 15 * 1000)
		onDestroy(() => clearInterval(refreshInterval))
	}
</script>

<section>
	<main>
		<Topbar />
		<Calendar />
	</main>
	<SidebarContainer />
</section>

<style>
	section {
		display: flex;
		align-items: flex-start;
		padding-top: 0.5rem;
		height: 100%;
	}

	main {
		flex-grow: 1;
	}
</style>
