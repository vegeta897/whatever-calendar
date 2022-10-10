import { DISCORD_API_URL, DISCORD_SERVER_ID, HOST } from '$env/static/private'
import type { Handle } from '@sveltejs/kit'

export const handle: Handle = async ({ event, resolve }) => {
	const refreshToken = event.cookies.get('discord_refresh_token')
	let accessToken = event.cookies.get('discord_access_token')
	console.log('refresh:', refreshToken, 'access:', accessToken)
	if (refreshToken && !accessToken) {
		// Refresh if access token expired
		const refreshRequest = await fetch(
			`${HOST}/api/refresh?code=${refreshToken}`
		)
		const refreshResponse = await refreshRequest.json()
		console.log(refreshResponse)
		accessToken = refreshResponse.discord_access_token
	}
	if (accessToken) {
		const discordUserRequest = await fetch(`${DISCORD_API_URL}/users/@me`, {
			headers: { Authorization: `Bearer ${accessToken}` },
		})
		const discordUserResponse = await discordUserRequest.json()

		const discordGuildRequest = await fetch(
			`${DISCORD_API_URL}/users/@me/guilds/${DISCORD_SERVER_ID}/member`,
			{ headers: { Authorization: `Bearer ${accessToken}` } }
		)
		const discordGuildResponse = await discordGuildRequest.json()

		if (discordUserResponse.id) {
			// TODO: Filter to properties specified in App.Locals
			event.locals.discord = {
				user: {
					...discordUserResponse,
				},
				guild: null,
			}
		}
		if (discordGuildResponse.user) {
			event.locals.discord.guild = { ...discordGuildResponse }
		}
	}
	const response = await resolve(event)
	return response
}
