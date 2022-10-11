import { days, setCookie } from '$lib/server/cookies'
import { db } from '$lib/server/db'
import type { Handle } from '@sveltejs/kit'
import { sha256 } from 'hash-wasm'

export const handle: Handle = async ({ event, resolve }) => {
	console.log('begin handle', event.routeId)
	let session = event.cookies.get('wec-session')
	let storedSession =
		session && db.data!.sessions.find((s) => s.sessionID === session)
	if (storedSession) console.log('found stored session')
	const now = Date.now()
	if (storedSession && storedSession.expires <= now) {
		console.log('stored session is expired')
		db.data!.sessions = db.data!.sessions.filter((s) => s.expires > now)
		session = undefined
		storedSession = undefined
	}
	if (!session || !storedSession) {
		session = crypto.randomUUID()
		console.log('no session, generated new:', session)
		setCookie(event.cookies, 'wec-session', session, {
			expires: days(30),
		})
		db.data!.sessions.push({ sessionID: session, expires: days(30).getTime() })
	}
	db.write()
	event.locals.session = session
	event.locals.state = await sha256(session)
	console.log('created state', event.locals.state)
	// return await resolve(event)
	// if (event.routeId?.startsWith('api/')) {
	// 	// Ignore API routes
	// 	return await resolve(event)
	// }

	// console.log('getting guild info...')
	// const discordGuildRequest = await fetch(
	// 	`${API_URL}/users/@me/guilds/${DISCORD_SERVER_ID}/member`,
	// 	{ headers: { Authorization: `Bearer ${accessToken}` } }
	// )
	// logRateLimitHeaders(discordGuildRequest.headers)
	// const discordGuildResponse = await discordGuildRequest.json()

	// console.log(discordGuildResponse)

	// if (discordGuildResponse.user) {
	// 	event.locals.discordGuild = { ...discordGuildResponse }
	// }

	return await resolve(event)
}
