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

	type WheneverUser = {
		/** Hex color in base 10 - 0 if no color */
		color: number
		/** Guild nickname, or fallback to username */
		name: string
		/** Discord avatar URL */
		avatarURL: string
	}

	type Mark = {
		type: number // TODO: Create mark types
		note?: string
		createTimestamp: Readonly<number>
		lastModifyTimestamp: number
	}
}
