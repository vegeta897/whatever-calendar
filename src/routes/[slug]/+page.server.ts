import { getData, modifyData } from '$lib/server/db'
import { error } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import { redirect } from '@sveltejs/kit'

export const load: PageServerLoad = ({ locals, params }) => {
	console.log('(server) load /[slug]', params.slug)
	if (!locals.discordMember) {
		console.log('member not authed, redirecting to root')
		throw redirect(302, '/')
	}
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
		// TODO: Validate incoming data
		const data = await request.formData()
		const userMarks = JSON.parse(data.get('myMarks') as string) as Record<
			string,
			Mark | null
		>
		// console.log(userMarks)
		const marks = { ...getData().marks }
		for (const [yyyymmdd, mark] of Object.entries(userMarks)) {
			if (mark) {
				marks[yyyymmdd] = {
					...(marks[yyyymmdd] || {}),
					[locals.discordMember.id]: mark,
				}
			} else if (marks[yyyymmdd]) {
				// Get marks object excluding the user's deleted mark
				const { [locals.discordMember.id]: _, ...otherMarks } = marks[yyyymmdd]
				if (Object.values(otherMarks).length > 0) {
					marks[yyyymmdd] = otherMarks
				} else {
					delete marks[yyyymmdd] // Delete date entirely if no other marks left
				}
			}
		}
		modifyData({ marks })
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
