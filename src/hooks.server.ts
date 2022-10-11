import { DISCORD_SERVER_ID } from '$env/static/private'
import { logRateLimitHeaders, refresh, setCookies } from '$lib/discord'
import type { Handle } from '@sveltejs/kit'

const DISCORD_API_URL = 'https://discordapp.com/api'

export const handle: Handle = async ({ event, resolve }) => {
	// TODO: Need to generate a user session cookie that is tied to their discord auth cookies
	// A user can have more than one session cookie (it's generated per device)
	console.log('begin handle', event.routeId)
	// return await resolve(event)
	if (event.routeId?.startsWith('api/')) {
		// Ignore API routes
		return await resolve(event)
	}
	const refreshToken = event.cookies.get('discord_refresh_token')
	let accessToken = event.cookies.get('discord_access_token')
	console.log('refresh:', refreshToken)
	console.log('access:', accessToken)
	if (refreshToken && !accessToken) {
		console.log('Have refresh token, no access token')
		const refreshed = await refresh(refreshToken, fetch)
		if (refreshed.error) {
			console.error('Discord auth refresh error', refreshed.error)
		} else {
			setCookies(event.cookies, refreshed)
			console.log('refreshed!', refreshed)
			accessToken = refreshed.access_token
		}
	}
	// TODO: Locals does not persist between requests. Store discord info in lowdb!
	if (
		(!event.locals.discordUser || !event.locals.discordGuild) &&
		accessToken
	) {
		console.log('getting user info...')
		const discordUserRequest = await fetch(`${DISCORD_API_URL}/users/@me`, {
			headers: { Authorization: `Bearer ${accessToken}` },
		})
		logRateLimitHeaders(discordUserRequest.headers)
		const discordUserResponse = await discordUserRequest.json()

		console.log('getting guild info...')
		const discordGuildRequest = await fetch(
			`${DISCORD_API_URL}/users/@me/guilds/${DISCORD_SERVER_ID}/member`,
			{ headers: { Authorization: `Bearer ${accessToken}` } }
		)
		logRateLimitHeaders(discordGuildRequest.headers)
		const discordGuildResponse = await discordGuildRequest.json()

		// console.log(discordGuildResponse)

		// TODO: Filter to properties specified in App.Locals
		if (discordUserResponse.id) {
			event.locals.discordUser = { ...discordUserResponse }
		}
		if (discordGuildResponse.user) {
			event.locals.discordGuild = { ...discordGuildResponse }
		}
	}
	return await resolve(event)
}
