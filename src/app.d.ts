// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types
declare namespace App {
	interface Locals {
		session: string
		discordUser?: {
			id: string
			/**
			 * Global username, not including discriminator
			 */
			username: String
			discriminator: string
			member?: {
				/**
				 * User nickname for configured server, if they have one
				 */
				nick: string | null
				avatarURL: string
			}
		}
	}
	interface PageData {
		discordUser?: Locals['discordUser']
		weekStart?: number
	}
}
