import {
	API_URL,
	logRateLimitHeaders,
	refresh,
	setCookies,
} from '$lib/server/discord/oauth'
import { DISCORD_SERVER_ID } from '$env/static/private'
import type { LayoutServerLoad } from './$types'
import { getMemberInfo } from '$lib/server/discord/bot'

export const load: LayoutServerLoad = async ({ cookies, locals, fetch }) => {
	console.log(new Date().toTimeString(), 'layout.server load!')
	const pageData: App.PageData = {}
	const refreshToken = cookies.get('discord_refresh_token')
	if (!refreshToken) {
		return pageData
	}
	let accessToken = cookies.get('discord_access_token')
	console.log('refresh:', refreshToken)
	console.log('access:', accessToken)
	if (!accessToken) {
		console.log('Have refresh token, no access token')
		const refreshed = await refresh(refreshToken, fetch)
		if (refreshed.error) {
			console.error('Discord auth refresh error:', refreshed.error)
			return pageData
		} else {
			setCookies(cookies, refreshed)
			console.log('refreshed!', refreshed)
			accessToken = refreshed.access_token
		}
	}
	// TODO: Only do this for new session IDs to attach the discord user ID
	// We can use the bot to get user info
	console.log('getting user info...')
	const discordUserRequest = await fetch(`${API_URL}/users/@me`, {
		headers: { Authorization: `Bearer ${accessToken}` },
	})
	logRateLimitHeaders(discordUserRequest.headers)
	const discordUser = await discordUserRequest.json()
	if (discordUser.id) {
		console.log('got user', discordUser.id)
		locals.discordUser = {
			id: discordUser.id,
			username: discordUser.username,
			discriminator: discordUser.discriminator,
		}
	} else {
		console.error('Error getting discord user', discordUser)
	}
	if (locals.discordUser) {
		pageData.discordUser = locals.discordUser
		const member = await getMemberInfo(locals.discordUser.id)
		if (member) {
			pageData.discordUser.member = {
				nick: member.nick,
				avatarURL: member.avatarURL,
			}
			// pageData.userData = db.data!
			const weekStart = cookies.get('wec-weekStart')
			if (weekStart !== undefined) {
				pageData.weekStart = +weekStart
			}
		}
	}
	return pageData
}
