import {
	DISCORD_CLIENT_ID,
	DISCORD_CLIENT_SECRET,
	DISCORD_REDIRECT_URI,
} from '$env/static/private'
import type { RequestHandler } from '@sveltejs/kit'

export const GET: RequestHandler = async ({ url, fetch, cookies }) => {
  console.log('begin /refresh')
	const dataObject = {
		client_id: DISCORD_CLIENT_ID,
		client_secret: DISCORD_CLIENT_SECRET,
		grant_type: 'refresh_token',
		redirect_uri: DISCORD_REDIRECT_URI,
		refresh_token: url.searchParams.get('code')!,
	}

	const request = await fetch('https://discord.com/api/oauth2/token', {
		method: 'POST',
		body: new URLSearchParams(dataObject),
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
	})
	const response = await request.json()

	if (response.error) {
		return new Response(JSON.stringify({ error: response.error }), {
			status: 500,
		})
	}

	cookies.set('discord_access_token', response.access_token, {
		expires: new Date(Date.now() + response.expires_in), // ~10 minutes
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

	return new Response(
		JSON.stringify({ discord_access_token: response.access_token }),
		{
			status: 200,
		}
	)
}
