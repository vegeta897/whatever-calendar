import {
	DISCORD_CLIENT_ID,
	DISCORD_CLIENT_SECRET,
	DISCORD_REDIRECT_URI,
} from '$env/static/private'
import { redirect, type RequestHandler } from '@sveltejs/kit'

export const GET: RequestHandler = async ({ url, fetch, cookies }) => {
	console.log('begin /callback')
	const dataObject = {
		client_id: DISCORD_CLIENT_ID,
		client_secret: DISCORD_CLIENT_SECRET,
		grant_type: 'authorization_code',
		redirect_uri: DISCORD_REDIRECT_URI,
		code: url.searchParams.get('code')!,
	}

	const request = await fetch('https://discord.com/api/oauth2/token', {
		method: 'POST',
		body: new URLSearchParams(dataObject),
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
	})
	const response = await request.json()

	if (response.error) {
		console.log('redirect to / due error', response.error)
		throw redirect(302, '/')
	}

	console.log(response)

	cookies.set('discord_access_token', response.access_token, {
		expires: new Date(Date.now() + response.expires_in), // 10 minutes
		httpOnly: true,
		path: '/',
		sameSite: 'strict',
	})
	cookies.set('discord_refresh_token', response.refresh_token, {
		expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
		httpOnly: true,
		path: '/',
		sameSite: 'strict',
	})
	throw redirect(302, '/')
}
