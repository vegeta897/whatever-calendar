import { days, setCookie } from '$lib/server/cookies'
import { db } from '$lib/server/db'
import { connectBot } from '$lib/server/discord/bot'
import type { Handle } from '@sveltejs/kit'

await connectBot()

export const handle: Handle = async ({ event, resolve }) => {
	console.log('begin handle', event.routeId)
	let session = event.cookies.get('wec-session')
	let storedSession =
		session && db.data!.sessions.find((s) => s.sessionID === session)
	if (storedSession) console.log('found stored session')
	const now = Date.now()
	let dbModified = false
	if (storedSession && storedSession.expires <= now) {
		console.log('stored session is expired')
		db.data!.sessions = db.data!.sessions.filter((s) => s.expires > now)
		dbModified = true
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
		dbModified = true
	}
	// TODO: Create wrapper to handle writes in a queue to avoid conflicts
	if (dbModified) db.write()
	event.locals.session = session
	return await resolve(event)
}
