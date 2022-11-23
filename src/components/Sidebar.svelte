<script lang="ts">
	import { page } from '$app/stores'
	import { weekStart, sundayName, mondayName } from '$lib/calendar'
	import Avatar from './Avatar.svelte'

	export let selectedUserID: string | null

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
</script>

<div class="sidebar">
	<div class="user-info">
		<Avatar user={myUser} size="1.5rem" />
		<span>{myUser.name}</span>
	</div>
	<hr />
	<h3>Filter marks</h3>
	<ol class="user-list">
		{#each users as user (user.id)}
			<li>
				<a
					href={user.id === selectedUserID
						? new URL($page.url.href).pathname
						: `?filter=${user.id}`}
					data-sveltekit-prefetch="off"
					on:click|preventDefault={() =>
						(selectedUserID = selectedUserID === user.id ? null : user.id)}
				>
					<div class="user-circle" class:selected={user.id === selectedUserID}>
						<div class="inner-dot" />
					</div>
					<span>{user.name}</span>
				</a>
			</li>
		{/each}
	</ol>

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
		width: 260px;
		box-sizing: border-box;
		padding: 1rem;
		position: sticky;
		top: 0;
		flex-shrink: 0;
		display: flex;
		flex-direction: column;
	}

	.sidebar > * + * {
		margin-top: 1rem;
	}

	.user-info {
		display: flex;
	}

	.user-info span {
		margin-left: 0.5rem;
	}

	h3 {
		font-weight: 400;
		margin-bottom: 0.25rem;
		font-size: 1rem;
	}

	.user-list {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.user-list > li {
		padding: 0.375rem 0 0.375rem 0.5rem;
	}

	.user-list > li > a {
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
		width: 90%;
		margin-left: 0;
		margin-bottom: 0;
		border: none;
		border-top: 1px solid var(--color-fg);
	}

	@media (max-width: 1126px) {
		.sidebar {
			display: none;
		}
	}
</style>
