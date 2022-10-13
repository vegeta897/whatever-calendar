import type { RequestEvent } from '@sveltejs/kit'
import type { CookieSerializeOptions } from 'cookie'

type CookieName =
	| 'discord_access_token'
	| 'discord_refresh_token'
	| 'wec-session'

export function setCookie(
	cookies: RequestEvent['cookies'],
	name: CookieName,
	value: string,
	options?: CookieSerializeOptions
) {
	cookies.set(name, value, { path: '/', ...options })
}

export function deleteCookies(cookies: RequestEvent['cookies']) {
	cookies.delete('discord_access_token', { path: '/', maxAge: -1 })
	cookies.delete('discord_refresh_token', { path: '/', maxAge: -1 })
	cookies.delete('wec-session', { path: '/', maxAge: -1 })
}

export const days = (days = 30) =>
	new Date(Date.now() + days * 24 * 60 * 60 * 1000)
