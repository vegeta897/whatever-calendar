import { getData, modifyData } from '$lib/server/db'
import { error } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import { redirect } from '@sveltejs/kit'

export const load: PageServerLoad = ({ locals, params }) => {
	/* TODO: Should this trigger on each day navigation,
	   to grab the freshest info for the day? */
	/* Note, using params.slug creates a dependency that 
	   causes the server to be called on each navigation */
	console.log('(server) load /[slug]' /*, params.slug*/)
	if (!locals.discordMember) {
		console.log('member not authed, redirecting to root')
		throw redirect(302, '/')
	}
	// return { day: params.slug, server: true }
}

export const actions: Actions = {
	marks: async ({ request, locals }) => {
		console.log('marks action received!')
		if (!locals.discordMember) {
			throw error(401, {
				name: 'Oops...',
				message: 'Your session was lost, please connect to Discord again',
			})
		}
		const userID = locals.discordMember.id
		// TODO: Validate incoming data
		// TODO: Insert await sleep to test slow server UX
		const formData = await request.formData()
		if (!formData.has('mark')) throw 'Request invalid, missing "mark" form data'
		const doMark = JSON.parse(formData.get('mark') as string)
		const YYYYMMDD = formData.get('day') as string
		const marks = [...getData().marks]
		if (doMark) {
			const existingMark = marks.find(
				(m) => m.userID === userID && m.YYYYMMDD === YYYYMMDD
			)
			if (!existingMark) {
				marks.push({ YYYYMMDD, userID, timestamp: Date.now() })
				modifyData({ marks })
			}
		} else {
			modifyData({
				marks: marks.filter(
					(m) => m.userID !== userID || m.YYYYMMDD !== YYYYMMDD
				),
			})
		}
	},
	notes: async ({ request, locals }) => {
		console.log('notes action received!')
		if (!locals.discordMember) {
			throw error(401, {
				name: 'Oops...',
				message: 'Your session was lost, please connect to Discord again',
			})
		}
	},
}
