import {
	DISCORD_CLIENT_ID,
	DISCORD_CLIENT_SECRET,
	DISCORD_REDIRECT_URI,
} from '$env/static/private'
import type { RequestEvent } from '@sveltejs/kit'
import { days, setCookie } from '$lib/server/cookies'

export const AUTH_URL = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(
	DISCORD_REDIRECT_URI
)}&response_type=code&scope=identify&prompt=none`
export const API_URL = 'https://discordapp.com/api'

const TOKEN_URL = API_URL + '/oauth2/token'

const DISCORD_REQUEST_DATA = {
	client_id: DISCORD_CLIENT_ID,
	client_secret: DISCORD_CLIENT_SECRET,
	redirect_uri: DISCORD_REDIRECT_URI,
} as const

const fetchOptions = (data: Record<string, string>) => {
	return {
		method: 'POST',
		body: new URLSearchParams(data),
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
	}
}

// TODO: Abstract getAccess() and refresh() into one function
export async function getAccess(
	authorizationCode: string,
	fetch: RequestEvent['fetch']
) {
	const dataObject = {
		grant_type: 'authorization_code',
		code: authorizationCode,
		...DISCORD_REQUEST_DATA,
	}
	const request = await fetch(TOKEN_URL, fetchOptions(dataObject))
	logRateLimitHeaders(request.headers)
	return request.json()
}

export async function refresh(
	refreshToken: string,
	fetch: RequestEvent['fetch']
) {
	const dataObject = {
		grant_type: 'refresh_token',
		refresh_token: refreshToken,
		...DISCORD_REQUEST_DATA,
	}
	const request = await fetch(TOKEN_URL, fetchOptions(dataObject))
	logRateLimitHeaders(request.headers)
	return await request.json()
}

export async function setCookies(
	cookies: RequestEvent['cookies'],
	response: { access_token: string; refresh_token: string; expires_in: number }
) {
	setCookie(cookies, 'discord_access_token', response.access_token, {
		expires: new Date(Date.now() + response.expires_in), // ~10 minutes
	})
	setCookie(cookies, 'discord_refresh_token', response.refresh_token, {
		expires: days(30),
	})
}

/**
 * Gets user info from Discord API
 *
 * @remarks
 *   Requires a valid access or refresh token stored in `cookies`
 * @param cookies - The `cookies` object from a RequestEvent object
 * @param fetch - The `fetch` function from a RequestEvent object
 * @returns (Promise) `DiscordUser` if successful, `undefined` if not
 */
export async function getUser(
	cookies: RequestEvent['cookies'],
	fetch: RequestEvent['fetch']
): Promise<DiscordUser | undefined> {
	const refreshToken = cookies.get('discord_refresh_token')
	if (!refreshToken) return undefined
	let accessToken = cookies.get('discord_access_token')
	console.log('refresh:', refreshToken)
	console.log('access:', accessToken)
	if (!accessToken) {
		console.log('Have refresh token, no access token')
		const refreshed = await refresh(refreshToken, fetch)
		if (refreshed.error) {
			console.error('Discord auth refresh error:', refreshed.error)
		} else {
			setCookies(cookies, refreshed)
			console.log('refreshed!')
			accessToken = refreshed.access_token
		}
	}
	if (!accessToken) return undefined
	console.log('getting user info...')
	const userRequest = await fetch(`${API_URL}/users/@me`, {
		headers: { Authorization: `Bearer ${accessToken}` },
	})
	logRateLimitHeaders(userRequest.headers)
	const user = await userRequest.json()
	if (user.id) {
		console.log('got user', user.id)
		return {
			id: user.id,
			username: user.username,
			discriminator: user.discriminator,
		}
	}
	console.error('Error getting discord user', user)
}

function logRateLimitHeaders(headers: Headers) {
	;[
		'X-RateLimit-Limit',
		'X-RateLimit-Remaining',
		'X-RateLimit-Reset',
		'X-RateLimit-Reset-After',
		'X-RateLimit-Bucket',
		'X-RateLimit-Scope',
	].forEach(
		(header) => headers.get(header) && console.log(header, headers.get(header))
	)
}
