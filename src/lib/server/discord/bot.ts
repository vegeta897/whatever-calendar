import { DISCORD_BOT_TOKEN, DISCORD_SERVER_ID } from '$env/static/private'
import { Client, Guild } from 'eris'

let botConnected = false
let discordServer: Guild
const bot = new Client(DISCORD_BOT_TOKEN)

// @ts-ignore Error does have a code property 1006 for "Connection reset by peer"
bot.on('error', (error) => error.code !== 1006 && console.log(error))

export async function connectBot() {
	const promise = new Promise<void>((resolve) => {
		if (botConnected) {
			resolve()
		} else {
			bot.on('ready', async () => {
				if (!botConnected) {
					botConnected = true
					discordServer = bot.guilds.get(DISCORD_SERVER_ID)!
					console.log(
						`Discord bot online, connected to "${discordServer.name}"`
					)
					resolve()
				}
			})
			bot.connect()
		}
	})
	return promise
}

export async function getMember(
	userID: string
): Promise<DiscordMember | undefined> {
	await getMembers([userID])
	const member = discordServer.members.get(userID)
	return (
		member && {
			id: member.id,
			username: member.username,
			discriminator: member.discriminator,
			nick: member.nick,
			avatarURL: member.avatarURL,
			color:
				member.roles // Get color of highest role for member
					.map((r) => discordServer.roles.get(r))
					.sort((a, b) => b!.position - a!.position)
					.find((r) => r!.color !== 0)?.color || 0,
		}
	)
}

let fetchingMembers: Promise<void>
const memberFetchTimes: Map<string, number> = new Map()

export async function getMembers(
	userIDs: string[],
	noCache = false
): Promise<Record<string, WheneverUser>> {
	await fetchingMembers // Wait for fetch if one is in progress
	if (noCache || userIDs.some((id) => !discordServer.members.has(id))) {
		await (fetchingMembers = new Promise(async (res) => {
			const fetched = await discordServer.fetchMembers({ userIDs })
			fetched.forEach(({ id }) => memberFetchTimes.set(id, Date.now()))
			res()
		}))
	}
	const members: Record<string, WheneverUser> = {}
	discordServer.members.forEach(({ id, roles, username, nick, avatarURL }) => {
		// Don't include members not requested
		if (!userIDs.includes(id)) return
		members[id] = {
			color:
				roles // Get color of highest role for member
					.map((r) => discordServer.roles.get(r))
					.sort((a, b) => b!.position - a!.position)
					.find((r) => r!.color !== 0)?.color || 0,
			name: nick || username,
			avatarURL,
		}
	})
	return members
}
