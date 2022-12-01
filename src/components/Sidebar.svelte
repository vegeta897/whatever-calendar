<script lang="ts">
	import { page } from '$app/stores'
	import { weekStart, sundayName, mondayName } from '$lib/calendar'
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

	// TODO: Move sidebar to right side
	// Use hamburger menu, button placed in top right, sticky
</script>

<div class="sidebar" class:full-width={fullWidth}>
	{#if fullWidth}
		<div class="user-info"><UserInfo /></div>
		<hr />
	{/if}
	<h3>Filter marks</h3>
	<div class="user-list">
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
					<div class="user-circle" class:selected={user.id === $selectedUserID}>
						<div class="inner-dot" />
					</div>
					<span>{user.name}</span>
				</a>
			</div>
		{/each}
	</div>

	<div class="week-start-container">
		<label for="week-start">Start of week</label>
		<!-- TODO: Change to Sun/Mon links that look like buttons -->
		<select id="week-start" bind:value={$weekStart}>
			<!-- Use selected property to show correct option on intial render -->
			<option selected={$weekStart === 7} value={7}>{sundayName}</option>
			<option selected={$weekStart === 1} value={1}>{mondayName}</option>
		</select>
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
		font-weight: 400;
		margin-bottom: 0.25rem;
		font-size: 1rem;
	}

	.sidebar:not(.full-width) h3 {
		margin-top: 0;
	}

	.user-list {
		display: grid;
		grid-template-columns: 100%;
	}

	.sidebar:not(.sidebar.full-width) .user-list {
		row-gap: 1rem;
		column-gap: 0.5rem;
		grid-template-columns: repeat(auto-fill, min(10rem, calc(50% - 0.25rem)));
	}

	.user-list > div {
		padding: 0.375rem 0 0.375rem 0.5rem;
	}

	.sidebar:not(.full-width) .user-list > div {
		padding: 0;
	}

	.user-list > div > a {
		display: flex;
		align-items: center;
		cursor: pointer;
		text-decoration: none;
		padding: 1px 0 1px 1px;
	}

	.user-list > li > a span {
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

	.week-start-container {
		display: flex;
		flex-direction: column;
	}

	.week-start-container label {
		margin-bottom: 0.125rem;
	}

	.week-start-container select {
		max-width: 6rem;
	}

	hr {
		width: 100%;
		margin-left: 0;
		margin-bottom: 0;
		border: none;
		border-top: 1px solid var(--color-fg);
	}

	@media (max-width: 35rem) {
		.sidebar:not(.sidebar.full-width) .user-list {
			/* grid-template-columns: repeat(2, 1fr); */
		}
	}
</style>
