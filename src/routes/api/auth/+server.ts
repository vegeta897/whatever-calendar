import { DISCORD_CLIENT_ID, DISCORD_REDIRECT_URI } from '$env/static/private'
import { redirect, type RequestHandler } from '@sveltejs/kit'

const DISCORD_ENDPOINT = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(
	DISCORD_REDIRECT_URI
)}&response_type=code&scope=identify%20guilds.members.read&prompt=none`

export const GET: RequestHandler = ({ locals }) => {
	console.log('begin /auth')
	console.log('sending state', locals.state)
	throw redirect(302, DISCORD_ENDPOINT + `&state=${locals.state}`)
}
