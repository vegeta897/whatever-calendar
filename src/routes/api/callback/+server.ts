import { getAccess, setCookies } from '$lib/server/discord'
import { redirect, type RequestHandler } from '@sveltejs/kit'

export const GET: RequestHandler = async ({ url, fetch, cookies, locals }) => {
	console.log('begin /callback')
	const state = url.searchParams.get('state')
	if (state !== locals.state) {
		console.error(
			`Received mismatched state!\n  Sent:${locals.state}\n  Received:${state}`
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
