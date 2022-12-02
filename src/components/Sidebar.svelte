<script lang="ts">
	import { enhance } from '$app/forms'
	import { page } from '$app/stores'
	import { weekStart, sunName, monName } from '$lib/calendar'
	import { serialize } from 'cookie'
	import { selectedUserID } from './Calendar.svelte'
	import UserInfo from './UserInfo.svelte'

	export let fullWidth = false

	const myUserID = $page.data.discordMember!.id
	const myUser = $page.data.users![myUserID]

	$: users = [
		{ ...myUser, name: 'You' },
		...Object.values($page.data.users!)
			.filter((u) => u.id !== myUserID)
			.sort((a, b) =>
				a.name.toLocaleLowerCase() > b.name.toLocaleLowerCase() ? 1 : -1
			),
	]

	function setWeekStart(start: 1 | 7) {
		console.log('setWeekStart', start)
		weekStart.set(start)
		console.log(
			serialize(`wec-weekStart`, `${start}`, {
				maxAge: 90 * 24 * 60 * 60,
				path: '/',
			})
		)
		document.cookie = serialize(`wec-weekStart`, `${start}`, {
			maxAge: 90 * 24 * 60 * 60,
			path: '/',
		})
	}
</script>

<div class="sidebar" class:full-width={fullWidth}>
	{#if fullWidth}
		<div class="user-info"><UserInfo /></div>
		<hr />
	{/if}
	<div>
		<h3>Filter marks</h3>
		<div class="user-grid">
			{#each users as user (user.id)}
				<div>
					<a
						href={user.id === $selectedUserID
							? new URL($page.url.href).pathname
							: `?filter=${user.id}`}
						data-sveltekit-prefetch="off"
						on:click|preventDefault={() =>
							selectedUserID.set($selectedUserID === user.id ? null : user.id)}
					>
						<div
							class="user-circle"
							class:selected={user.id === $selectedUserID}
						>
							<div class="inner-dot" />
						</div>
						<span>{user.name}</span>
					</a>
				</div>
			{/each}
		</div>
	</div>

	<div class="week-start-container">
		<h3>Start of week</h3>
		<form method="POST" action="?/weekStart" use:enhance>
			<button
				disabled={$weekStart === 7}
				name="start"
				value={7}
				on:click|preventDefault={() => setWeekStart(7)}>{sunName}</button
			>
			<button
				disabled={$weekStart === 1}
				name="start"
				value={1}
				on:click|preventDefault={() => setWeekStart(1)}>{monName}</button
			>
		</form>
	</div>
	<hr />
	<form method="POST" action="/api/logout"><button>Sign out</button></form>
</div>

<style>
	.sidebar {
		width: 224px;
		box-sizing: border-box;
		margin-left: 1rem;
		padding: 1rem;
		position: sticky;
		border-radius: 1rem;
		top: 0;
		flex-shrink: 0;
		display: flex;
		flex-direction: column;
		background: var(--color-bg);
	}

	.sidebar.full-width {
		box-shadow: 0 0 0 1px var(--color-fg);
	}

	.sidebar:not(.full-width) {
		width: 100%;
		margin-left: 0;
		padding-top: 0;
	}

	.sidebar > * + * {
		margin-top: 1rem;
	}

	.user-info {
		height: 2.5rem;
	}

	h3 {
		font-size: 1rem;
		font-weight: 400;
		margin: 0;
		margin-bottom: 0.5rem;
	}

	.sidebar:not(.full-width) h3 {
		margin-top: 0;
	}

	.user-grid {
		display: grid;
		grid-template-columns: 100%;
	}

	.sidebar:not(.sidebar.full-width) .user-grid {
		row-gap: 1rem;
		column-gap: 0.5rem;
		grid-template-columns: repeat(auto-fill, min(10rem, calc(50% - 0.25rem)));
	}

	.user-grid > div {
		padding: 0.375rem 0 0.375rem 0.5rem;
	}

	.sidebar:not(.full-width) .user-grid > div {
		padding: 0;
	}

	.user-grid > div > a {
		display: flex;
		align-items: center;
		cursor: pointer;
		text-decoration: none;
		padding: 1px 0 1px 1px;
	}

	.user-grid > li > a span {
		display: inline-block;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.user-circle {
		width: 1.5rem;
		height: 1.5rem;
		margin-right: 0.75rem;
		border-radius: 50%;
		box-shadow: 0 0 0 1px var(--color-fg);
		flex-shrink: 0;
	}

	.inner-dot {
		width: 0.5rem;
		height: 0.5rem;
		border-radius: 50%;
		margin: 0.5rem 0 0 0.5rem;
		background-color: var(--color-fg);
	}

	.user-circle .inner-dot {
		transform: scale(0);
		transition: transform 50ms ease-out;
	}

	a:hover .user-circle:not(.selected) .inner-dot {
		transform: scale(1);
		transition: none;
	}

	.user-circle.selected .inner-dot {
		transition: transform 100ms cubic-bezier(0.39, 1.73, 0.84, 1.11);
		transform: scale(3.1);
	}

	.week-start-container button {
		margin: 0;
	}

	.week-start-container button:disabled {
		background: var(--color-fg);
		color: var(--color-bg);
		cursor: default;
	}

	.week-start-container button:nth-child(1) {
		border-top-right-radius: 0;
		border-bottom-right-radius: 0;
	}

	.week-start-container button:nth-child(2) {
		border-top-left-radius: 0;
		border-bottom-left-radius: 0;
		margin-left: -3px;
	}

	hr {
		width: 100%;
		margin-left: 0;
		margin-bottom: 0;
		border: none;
		border-top: 1px solid var(--color-fg);
	}
</style>
