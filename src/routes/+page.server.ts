import type { PageServerLoad } from './$types'
import { redirect } from '@sveltejs/kit'

export const load: PageServerLoad = ({ locals }) => {
	console.log('(local) load /')
	if (locals.discordMember) {
		console.log('authed member, redirecting to /calendar')
		throw redirect(302, '/calendar')
	}
}
