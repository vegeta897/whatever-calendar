import { refresh, setCookies } from '$lib/server/discord/oauth'
import type { RequestHandler } from '@sveltejs/kit'

export const GET: RequestHandler = async ({ url, fetch, cookies }) => {
	console.log('begin /refresh')
	const response = await refresh(url.searchParams.get('code')!, fetch)

	if (response.error) {
		return new Response(JSON.stringify({ error: response.error }), {
			status: 500,
		})
	}

	setCookies(cookies, response)

	return new Response(
		JSON.stringify({ discord_access_token: response.access_token }),
		{
			status: 200,
		}
	)
}
