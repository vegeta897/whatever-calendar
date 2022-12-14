// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types
declare namespace App {
	interface Locals {
		session: string
		discordID?: string
		discordUser?: DiscordUser
		discordMember?: DiscordMember
	}

	interface PageData {
		discordUser?: DiscordUser
		discordMember?: DiscordMember
		weekStart?: 7 | 1
		votes?: VoteData[]
		notes?: Note[]
		users?: Record<string, WheneverUser>
	}

	interface Error {
		message: string
		name: string
	}
}
