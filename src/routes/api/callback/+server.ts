import { getAccess, setCookies } from '$lib/server/discord/oauth'
import { redirect, type RequestHandler } from '@sveltejs/kit'
import { sha256 } from 'hash-wasm'

export const GET: RequestHandler = async ({ url, fetch, cookies, locals }) => {
	console.log('begin /callback')
	const sentState = await sha256(locals.session)
	const receivedState = url.searchParams.get('state')
	if (receivedState !== sentState) {
		console.error(
			`Received mismatched state!\n  Sent:${sentState}\n  Received:${receivedState}`
		)
		throw redirect(302, '/')
	}
	const response = await getAccess(url.searchParams.get('code')!, fetch)

	if (response.error) {
		console.log('redirect to / due error', response.error)
		throw redirect(302, '/')
	} else {
		setCookies(cookies, response)
	}

	throw redirect(302, '/')
}
