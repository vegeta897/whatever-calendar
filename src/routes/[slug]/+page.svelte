<script lang="ts">
	import type { PageData } from './$types'
	import Calendar, { selectedUserID } from '../../components/Calendar.svelte'
	import SidebarContainer from '../../components/SidebarContainer.svelte'
	import Topbar from '../../components/Topbar.svelte'
	import { browser } from '$app/environment'
	import { weekStart, days, getDays } from '$lib/calendar'

	export let data: PageData

	weekStart.set(data.weekStart || 7)
	selectedUserID.set(data.selectedUserID)
	days.set(getDays())

	if (browser) console.log(data)
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
