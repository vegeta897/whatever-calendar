import { deleteCookies } from '$lib/server/cookies'
import { redirect, type RequestHandler } from '@sveltejs/kit'

export const GET: RequestHandler = ({ cookies }) => {
	console.log('begin /logout')
	deleteCookies(cookies)
	throw redirect(302, '/')
}
