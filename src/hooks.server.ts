import { days, setCookie } from '$lib/server/cookies'
import { getData, modifyData } from '$lib/server/db'
import { connectBot, getMemberInfo } from '$lib/server/discord/bot'
import { getUser } from '$lib/server/discord/oauth'
import type { Handle } from '@sveltejs/kit'

await connectBot()

export const handle: Handle = async ({ event, resolve }) => {
	console.log('begin handle', event.routeId)
	let session = event.cookies.get('wec-session')
	const sessions = getData().sessions
	let storedSession =
		(session && sessions.find((s) => s.sessionID === session)) || undefined
	if (storedSession) console.log('found stored session')
	const now = Date.now()
	// Delete session if expired
	if (storedSession && storedSession.expires <= now) {
		console.log('stored session is expired')
		modifyData({ sessions: sessions.filter((s) => s.expires > now) })
		session = undefined
		storedSession = undefined
	}
	if (!session) {
		session = crypto.randomUUID()
		console.log('no session, generated new:', session)
		setCookie(event.cookies, 'wec-session', session, { expires: days(30) })
	}
	event.locals.session = session
	// API routes only need the session
	if (event.routeId?.startsWith('api/')) return await resolve(event)

	if (!storedSession) {
		console.log('no stored session, getting discord user')
		event.locals.discordUser =
			(await getUser(event.cookies, event.fetch)) || undefined
	}
	const userID = storedSession?.discordID || event.locals.discordUser?.id
	if (userID) {
		console.log('have user ID, getting member info')
		const discordMember = await getMemberInfo(userID)
		if (discordMember) {
			event.locals.discordMember = discordMember
			event.locals.discordUser = {
				id: discordMember.id,
				username: discordMember.username,
				discriminator: discordMember.discriminator,
			}
			// If this is a new session, store it because they're a verified member
			if (!storedSession) {
				storedSession = {
					sessionID: session,
					discordID: userID,
					expires: days(30).getTime(),
				}
				modifyData({ sessions: [...sessions, storedSession] })
			}
		}
	}
	return await resolve(event)
}
