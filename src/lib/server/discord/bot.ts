import { DISCORD_BOT_TOKEN, DISCORD_SERVER_ID } from '$env/static/private'
// import { Client, Guild } from 'eris'
import { Client, Guild, GatewayIntentBits, Events } from 'discord.js'

let botConnected = false
let discordServer: Guild
const bot = new Client({ intents: [GatewayIntentBits.Guilds] })

// @ts-ignore Error does have a code property 1006 for "Connection reset by peer"
// bot.on('error', (error) => error.code !== 1006 && console.log(error))

export async function connectBot() {
	const promise = new Promise<void>((resolve) => {
		if (botConnected) {
			resolve()
		} else {
			bot.once(Events.ClientReady, async () => {
				botConnected = true
				discordServer = await bot.guilds.fetch(DISCORD_SERVER_ID)
				console.log(`Discord bot online, connected to "${discordServer.name}"`)
				resolve()
			})
			bot.login(DISCORD_BOT_TOKEN)
		}
	})
	return promise
}

export async function getMember(
	userID: string
): Promise<DiscordMember | undefined> {
	await getMembers([userID])
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

let fetchingMembers: Promise<void>
const memberFetchTimes: Map<string, number> = new Map()

export async function getMembers(
	userIDs: string[],
	noCache = false
): Promise<Record<string, WheneverUser>> {
	await fetchingMembers // Wait for fetch if one is in progress
	if (noCache || userIDs.some((id) => !discordServer.members.resolve(id))) {
		await (fetchingMembers = new Promise(async (res) => {
			const fetched = await discordServer.members.fetch({ user: userIDs })
			fetched.forEach(({ id }) => memberFetchTimes.set(id, Date.now()))
			res()
		}))
	}
	const members: Record<string, WheneverUser> = {}
	discordServer.members.cache.forEach((member) => {
		// Don't include members not requested
		if (!userIDs.includes(member.id)) return
		members[member.id] = {
			name: member.displayName,
			avatarURL: member.displayAvatarURL({ size: 64 }),
		}
		if (member.displayColor) members[member.id].color = member.displayHexColor
		// const color = 123456789
		// if (color) members[id].color = `#${color.toString(16).padStart(6, '0')}`
	})
	return members
}
