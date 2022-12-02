import {
	DISCORD_BOT_TOKEN,
	DISCORD_CLIENT_ID,
	DISCORD_SERVER_ID,
	APP_URL,
} from '$env/static/private'
import {
	Client,
	Guild,
	GatewayIntentBits,
	Events,
	REST,
	SlashCommandBuilder,
	Routes,
} from 'discord.js'
import { DateTime } from 'luxon'

let botConnected = false
let discordServer: Guild

const bot = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
})

const rest = new REST({ version: '10' }).setToken(DISCORD_BOT_TOKEN)

const commands = [
	new SlashCommandBuilder()
		.setName('whenever')
		.setDescription('Get overview & status for the Whenever calendar'),
]

export async function connectBot() {
	const promise = new Promise<void>((resolve) => {
		if (botConnected) {
			resolve()
		} else {
			bot.once(Events.ClientReady, async () => {
				botConnected = true
				discordServer = await bot.guilds.fetch(DISCORD_SERVER_ID)
				console.log(
					DateTime.now().toFormat('f'),
					`Discord bot online, connected to "${discordServer.name}"`
				)
				resolve()
			})
			bot.on('interactionCreate', async (interaction) => {
				if (!interaction.isChatInputCommand()) return
				if (interaction.commandName === 'whenever') {
					await interaction.reply(APP_URL)
				}
			})
			bot.login(DISCORD_BOT_TOKEN)
		}
	})
	try {
		console.log('Started refreshing application (/) commands.')

		await rest.put(
			Routes.applicationGuildCommands(DISCORD_CLIENT_ID, '1045279421138997268'),
			{ body: commands }
		)

		console.log('Successfully reloaded application (/) commands.')
	} catch (error) {
		console.error(error)
	}
	return promise
}

export async function fetchMembers(userIDs: string | string[]) {
	if (!Array.isArray(userIDs)) userIDs = [userIDs]
	// Fetching an array of users always skips cache, so we fetch individually
	await Promise.all(
		userIDs.map((user) => discordServer.members.fetch({ user }))
	)
}

export async function getMember(
	userID: string
): Promise<DiscordMember | undefined> {
	await fetchMembers(userID)
	const member = await discordServer.members.fetch(userID)
	if (!member) return undefined
	const discordMember: DiscordMember = {
		id: member.id,
		username: member.user.username,
		discriminator: member.user.discriminator,
		nick: member.nickname,
		avatarURL: member.displayAvatarURL({ size: 64 }),
	}
	if (member.displayColor) discordMember.color = member.displayHexColor
	return discordMember
}

export async function getUsers(
	userIDs: string[]
): Promise<Record<string, WheneverUser>> {
	await fetchMembers(userIDs)
	const users: Record<string, WheneverUser> = {}
	discordServer.members.cache.forEach((member) => {
		// Don't include members not requested
		if (!userIDs.includes(member.id)) return
		users[member.id] = {
			id: member.id,
			name: member.displayName,
			avatarURL: member.displayAvatarURL({ size: 64 }),
		}
		if (member.displayColor) users[member.id].color = member.displayHexColor
	})
	return users
}
