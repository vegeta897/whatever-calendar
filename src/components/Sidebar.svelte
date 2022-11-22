<script lang="ts">
	import { page } from '$app/stores'
	import { weekStart, sundayName, mondayName } from '$lib/calendar'
	import Avatar from './Avatar.svelte'

	export let selectedUser: WheneverUser | null

	const myUserID = $page.data.discordMember!.id
	const myUser = $page.data.users![myUserID]

	$: users = [
		myUser,
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
	<ol class="user-list">
		{#each users as user (user.id)}
			<li>
				<a
					href="#"
					on:click|preventDefault={() =>
						(selectedUser = selectedUser === user ? null : user)}
				>
					<div class="user-circle" class:selected={user === selectedUser}>
						<div class="inner-dot" />
					</div>
					{user.name}
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
	<a href="/api/logout" data-sveltekit-prefetch="off">Sign out</a>
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

	.user-info {
		display: flex;
		margin-bottom: 0.75rem;
	}

	.user-info span {
		margin-left: 0.5rem;
	}

	.user-list {
		list-style: none;
		margin: 0;
		margin-bottom: 1rem;
		padding: 0;
	}

	.user-list > li {
		padding: 0.5rem 0;
	}

	.user-list > li > a {
		display: flex;
		align-items: center;
		cursor: pointer;
		text-decoration: none;
	}

	.user-circle {
		width: 1.5rem;
		height: 1.5rem;
		margin-right: 0.75rem;
		border-radius: 50%;
		box-shadow: 0 0 0 1px var(--color-fg);
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
		margin-bottom: 1rem;
	}

	.week-start-container label {
		margin-bottom: 0.125rem;
	}

	.week-start-container select {
		max-width: 6rem;
	}

	@media (max-width: 1126px) {
		.sidebar {
			display: none;
		}
	}
</style>
