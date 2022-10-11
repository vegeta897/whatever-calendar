import {
	API_URL,
	logRateLimitHeaders,
	refresh,
	setCookies,
} from '$lib/server/discord'
import { DISCORD_SERVER_ID } from '$env/static/private'
import type { LayoutServerLoad } from './$types'

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
			console.error('Discord auth refresh error', refreshed.error)
			return pageData
		} else {
			setCookies(cookies, refreshed)
			console.log('refreshed!', refreshed)
			accessToken = refreshed.access_token
		}
	}
	// TODO: Store discord info in lowdb!
	// Change session cookie to expire on session,
	// don't fetch discord info unless a new session was created?
	console.log('getting user info...')
	const discordUserRequest = await fetch(`${API_URL}/users/@me`, {
		headers: { Authorization: `Bearer ${accessToken}` },
	})
	logRateLimitHeaders(discordUserRequest.headers)
	const discordUser = await discordUserRequest.json()
	if (discordUser.id) {
		console.log('got user', discordUser.id)
		// TODO: Filter to properties specified in App.Locals
		locals.discordUser = { ...discordUser }
	} else {
		console.error('Error getting discord user', discordUser)
	}
	if (locals.discordUser) pageData.discordUser = locals.discordUser
	if (locals.discordGuild) pageData.discordGuild = locals.discordGuild
	if (locals.discordGuild) {
		// pageData.userData = db.data!
		const weekStart = cookies.get('wec-weekStart')
		if (weekStart !== undefined) {
			pageData.weekStart = +weekStart
		}
	}
	return pageData
}
