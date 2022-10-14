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
					resolve()
					discordServer = bot.guilds.get(DISCORD_SERVER_ID)!
					console.log(
						`Discord bot online, connected to "${discordServer.name}"`
					)
				}
			})
			bot.connect()
		}
	})
	return promise
}

export async function getMemberInfo(userID: string) {
	const member = (
		await discordServer.fetchMembers({
			limit: 1,
			userIDs: [userID],
		})
	)[0]
	return (
		member && {
			id: member.id,
			username: member.username,
			discriminator: member.discriminator,
			nick: member.nick,
			avatarURL: member.avatarURL,
		}
	)
}
