import { days, setCookie } from '$lib/server/cookies'
import { getData, modifyData } from '$lib/server/db'
import { connectBot } from '$lib/server/discord/bot'
import type { Handle } from '@sveltejs/kit'

await connectBot()

export const handle: Handle = async ({ event, resolve }) => {
	console.log('begin handle', event.routeId)
	let session = event.cookies.get('wec-session')
	const sessions = getData().sessions
	let storedSession = session && sessions.find((s) => s.sessionID === session)
	if (storedSession) console.log('found stored session')
	const now = Date.now()
	if (storedSession && storedSession.expires <= now) {
		console.log('stored session is expired')
		modifyData({ sessions: sessions.filter((s) => s.expires > now) })
		session = undefined
		storedSession = undefined
	}
	if (!session || !storedSession) {
		session = crypto.randomUUID()
		console.log('no session, generated new:', session)
		setCookie(event.cookies, 'wec-session', session, {
			expires: days(30),
		})
		modifyData({
			sessions: [
				...sessions,
				{ sessionID: session, expires: days(30).getTime() },
			],
		})
	}
	event.locals.session = session
	return await resolve(event)
}
