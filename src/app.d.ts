// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types

type DiscordUser = {
	id: string
	/**
	 * Global username, not including discriminator
	 */
	username: string
	discriminator: string
}

type DiscordMember = DiscordUser & {
	/**
	 * User nickname for configured server, if they have one
	 */
	nick: string | null
	avatarURL: string
}

declare namespace App {
	interface Locals {
		session: string
	}

	interface PageData {
		discordUser?: DiscordUser
		discordMember?: DiscordMember
		weekStart?: number
	}
}
