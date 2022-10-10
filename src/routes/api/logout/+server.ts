import { redirect, type RequestHandler } from '@sveltejs/kit'

export const GET: RequestHandler = ({ cookies }) => {
	console.log('begin /logout')
	cookies.delete('discord_access_token', {
		maxAge: -1,
		httpOnly: true,
		path: '/',
		sameSite: 'strict',
	})
	cookies.delete('discord_refresh_token', {
		maxAge: -1,
		httpOnly: true,
		path: '/',
		sameSite: 'strict',
	})
	throw redirect(302, '/')
}
