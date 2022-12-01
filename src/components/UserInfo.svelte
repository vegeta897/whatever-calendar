<script lang="ts">
	import { page } from '$app/stores'
	import Avatar from './Avatar.svelte'

	const myUserID = $page.data.discordMember!.id
	const myUser = $page.data.users![myUserID]
</script>

<div class="user-info">
	<div class="avatar-name">
		<Avatar user={myUser} size="2rem" />
		<span>{myUser.name}</span>
	</div>
</div>

<style>
	.user-info {
		display: flex;
		align-items: center;
		width: 190px;
		box-sizing: border-box;
		height: 100%;
	}

	.avatar-name {
		flex-grow: 1;
		display: flex;
		align-items: center;
	}

	.avatar-name span {
		display: inline-block;
		margin-left: 0.625rem;
	}
</style>
