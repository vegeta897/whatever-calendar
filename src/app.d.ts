// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types
declare namespace App {
	interface Locals {
		session: string
		state: string
		discordUser?: {
			id: string
			/**
			 * Global username, not including discriminator
			 */
			username: string
			/**
			 * Global avatar hash
			 * Begins with "_a" if animated
			 */
			avatar: string | null
			discriminator: string
		}
		discordGuild?: {
			/**
			 * Nickname the user has in the guild, if any
			 */
			nick: string | null
			avatar: string | null
			/**
			 * List of role IDs the user has in the guild
			 */
			roles: string[]
		}
	}
	interface PageData {
		discordUser?: Locals['discordUser']
		discordGuild?: Locals['discordGuild']
		weekStart?: number
	}
}
