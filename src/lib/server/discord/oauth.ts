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

export function logRateLimitHeaders(headers: Headers) {
	rateLimitHeaders.forEach(
		(header) => headers.get(header) && console.log(header, headers.get(header))
	)
}

const rateLimitHeaders = [
	'X-RateLimit-Limit',
	'X-RateLimit-Remaining',
	'X-RateLimit-Reset',
	'X-RateLimit-Reset-After',
	'X-RateLimit-Bucket',
	'X-RateLimit-Scope',
] as const

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
