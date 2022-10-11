import {
	DISCORD_CLIENT_ID,
	DISCORD_CLIENT_SECRET,
	DISCORD_REDIRECT_URI,
} from '$env/static/private'
import type { RequestEvent } from '@sveltejs/kit'

const TOKEN_API = 'https://discord.com/api/oauth2/token'

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
	const request = await fetch(TOKEN_API, fetchOptions(dataObject))
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
	const request = await fetch(TOKEN_API, fetchOptions(dataObject))
	logRateLimitHeaders(request.headers)
	return await request.json()
}

const COOKIE_DEFAULTS = {
	httpOnly: true,
	path: '/',
	sameSite: 'strict',
} as const

export async function setCookies(
	cookies: RequestEvent['cookies'],
	response: { access_token: string; refresh_token: string; expires_in: number }
) {
	cookies.set('discord_access_token', response.access_token, {
		expires: new Date(Date.now() + response.expires_in), // ~10 minutes
		...COOKIE_DEFAULTS,
	})
	cookies.set('discord_refresh_token', response.refresh_token, {
		expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
		...COOKIE_DEFAULTS,
	})
}
