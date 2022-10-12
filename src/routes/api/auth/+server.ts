import { AUTH_URL } from '$lib/server/discord/oauth'
import { redirect, type RequestHandler } from '@sveltejs/kit'
import { sha256 } from 'hash-wasm'

export const GET: RequestHandler = async ({ locals }) => {
	console.log('begin /auth')
	throw redirect(302, AUTH_URL + `&state=${await sha256(locals.session)}`)
}
