import { days, setCookie } from '$lib/server/cookies'
import { addSession, getData, getSession, modifyData } from '$lib/server/db'
import { connectBot, getMemberInfo } from '$lib/server/discord/bot'
import { getUser } from '$lib/server/discord/oauth'
import type { Handle } from '@sveltejs/kit'
import { sequence } from '@sveltejs/kit/hooks'

await connectBot()

const handleSession: Handle = async ({ event, resolve }) => {
	console.log('begin handleSession', event.routeId)
	let session = event.cookies.get('wec-session')
	const storedSession = getSession(session)
	if (storedSession) console.log('found stored session')
	const now = Date.now()
	// Delete session if expired
	if (storedSession && storedSession.expires <= now) {
		console.log('stored session is expired')
		modifyData({ sessions: getData().sessions.filter((s) => s.expires > now) })
		session = undefined
	}
	if (!session) {
		session = crypto.randomUUID()
		console.log('no session, generated new:', session)
		setCookie(event.cookies, 'wec-session', session, { expires: days(30) })
	} else if (storedSession) {
		// We have an unexpired discord ID, pass it on
		event.locals.discordID = storedSession.discordID
	}
	event.locals.session = session
	return await resolve(event)
}

const handleDiscord: Handle = async ({ event, resolve }) => {
	// API routes only need the session
	if (event.routeId?.startsWith('api/')) return await resolve(event)
	// This session isn't stored if there is no discord ID
	const newSession = !event.locals.discordID
	if (!event.locals.discordID) {
		console.log('no discord ID, getting user info')
		event.locals.discordUser = await getUser(event.cookies, event.fetch)
		if (event.locals.discordUser)
			event.locals.discordID = event.locals.discordUser.id
	}
	if (event.locals.discordID) {
		console.log('have user ID, getting member info')
		const discordMember = await getMemberInfo(event.locals.discordID)
		// If the user is a server member, save member data and store their session
		if (discordMember) {
			event.locals.discordMember = discordMember
			event.locals.discordUser = {
				id: discordMember.id,
				username: discordMember.username,
				discriminator: discordMember.discriminator,
			}
			if (newSession) {
				addSession({
					sessionID: event.locals.session,
					discordID: event.locals.discordID,
					expires: days(30).getTime(),
				})
			}
		}
	}
	return await resolve(event)
}

export const handle = sequence(handleSession, handleDiscord)
