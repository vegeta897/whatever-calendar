// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types
declare namespace App {
	interface Locals {
		discord: {
			user: {
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
			guild: null | {
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
	}
}
