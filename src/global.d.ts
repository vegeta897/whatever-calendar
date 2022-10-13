export {}
declare global {
	type DiscordUser = {
		id: string
		/** Global username, not including discriminator */
		username: string
		discriminator: string
	}

	type DiscordMember = DiscordUser & {
		/** User nickname for configured server, if they have one */
		nick: string | null
		avatarURL: string
	}
}
