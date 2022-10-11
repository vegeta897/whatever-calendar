<script lang="ts">
	import { enhance } from '$app/forms'
	import Month from './Month.svelte'
	import MonthMini from './MonthMini.svelte'
	import { mondayName, sundayName, weekStart } from '$lib/month'

	export let discordUser: NonNullable<App.Locals['discordUser']>
	export let discordGuild: NonNullable<App.Locals['discordGuild']>

	const MONTHS = [10, 11, 12]
	let focusedMonth: number = MONTHS[0]
	let tool: 'preferred' | 'possible' = 'preferred'

	const avatar = discordGuild.avatar || discordUser.avatar
	const avatarURL =
		'https://cdn.discordapp.com/' +
		(avatar
			? `avatars/${discordUser.id}/${avatar}`
			: `embed/avatars/${+discordUser.discriminator % 5}`) +
		(avatar?.startsWith('a_') ? '.gif' : '.png') +
		'?size=24'
</script>

<section>
	<img
		width="24px"
		style="border-radius: 12px;"
		alt="{discordGuild.nick || discordUser.username}'s avatar"
		src={avatarURL}
	/>
	{discordGuild.nick || discordUser.username}<a
		href="/api/logout"
		data-sveltekit-prefetch="off">Log out!</a
	>
	<form method="POST" action="?/update" use:enhance>
		<!-- <input name="userData" hidden value={JSON.stringify(userData)} /> -->
		<button>Save</button>
	</form>
	<div class="month-select">
		{#each MONTHS as month}
			<div
				class="month-container"
				class:focused={focusedMonth === month}
				on:click={() => (focusedMonth = month)}
			>
				<MonthMini year={2022} {month} weekStart={$weekStart} />
			</div>
		{/each}
	</div>
	<div class="tools">
		<label>
			<input type="radio" bind:group={tool} name="tool" value="preferred" />
			Preferred
		</label>
		<label>
			<input type="radio" bind:group={tool} name="tool" value="possible" />
			Possible
		</label>
	</div>
	<div class="focused-month">
		<Month
			year={2022}
			month={focusedMonth}
			weekStart={$weekStart}
			toolMode={tool === 'preferred' ? 1 : 2}
		/>
	</div>

	<label for="week-start">Start of week:</label>
	<select id="week-start" bind:value={$weekStart}>
		<option value={0}>{sundayName}</option>
		<option value={1}>{mondayName}</option>
	</select>
</section>

<style>
	section {
		width: 100%;
	}

	.month-select {
		display: flex;
		flex-wrap: wrap;
		gap: 2%;
		width: 100%;
		margin: 1rem 0;
	}

	.month-container {
		box-sizing: border-box;
		border: 2px solid transparent;
		flex: 1;
		overflow: hidden;
	}

	.month-container.focused {
		border-color: var(--color-theme-1);
	}

	.focused-month {
		margin-bottom: 1rem;
	}
</style>
