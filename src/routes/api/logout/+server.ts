import { deleteCookies } from '$lib/server/cookies'
import { getData, modifyData } from '$lib/server/db'
import { redirect, type RequestHandler } from '@sveltejs/kit'

export const POST: RequestHandler = ({ cookies, locals }) => {
	console.log('begin /logout')
	deleteCookies(cookies)
	modifyData({
		sessions: getData().sessions.filter((s) => s.sessionID !== locals.session),
	})
	throw redirect(302, '/')
}
