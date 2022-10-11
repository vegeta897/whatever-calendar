import { getAccess, setCookies } from '$lib/discord'
import { redirect, type RequestHandler } from '@sveltejs/kit'

export const GET: RequestHandler = async ({ url, fetch, cookies }) => {
	console.log('begin /callback')
	const state = url.searchParams.get('state')
	const response = await getAccess(url.searchParams.get('code')!, fetch)

	if (response.error) {
		console.log('redirect to / due error', response.error)
		throw redirect(302, '/')
	} else {
		setCookies(cookies, response)
	}

	throw redirect(302, '/')
}
