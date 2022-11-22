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
		/** Discord avatar URL */
		avatarURL: string
		/** Hex color in #FFFFFF format */
		color?: string
	}

	type WheneverUser = {
		id: string
		/** Hex color in #FFFFFF format */
		color?: string
		/** Guild nickname, or fallback to username */
		name: string
		/** Discord avatar URL */
		avatarURL: string
		/** Indicates whether user is the client */
		me?: boolean
	}

	type MarkData = {
		YYYYMMDD: Readonly<string>
		userID: Readonly<string>
		timestamp: Readonly<number>
		note?: string
		noteTimestamp?: number
	}
}
