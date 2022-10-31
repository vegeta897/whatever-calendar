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
		// TODO: Validate incoming data
		// TODO: Insert await sleep to test slow server UX
		const formData = await request.formData()
		if (formData.has('mark')) {
			const mark = JSON.parse(formData.get('mark') as string)
			const day = formData.get('day') as string
			const marks = { ...getData().marks }
			if (mark) {
				marks[day] = {
					...(marks[day] || {}),
					[locals.discordMember.id]: {
						type: 1,
						createTimestamp: Date.now(),
						lastModifyTimestamp: Date.now(),
					},
				}
			} else if (marks[day]) {
				// Get marks object excluding the user's deleted mark
				const { [locals.discordMember.id]: _, ...otherMarks } = marks[day]
				if (Object.values(otherMarks).length > 0) {
					marks[day] = otherMarks
				} else {
					delete marks[day] // Delete date entirely if no other marks left
				}
			}
			modifyData({ marks })
		} else {
			const userMarks = JSON.parse(formData.get('myMarks') as string) as Record<
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
					const { [locals.discordMember.id]: _, ...otherMarks } =
						marks[yyyymmdd]
					if (Object.values(otherMarks).length > 0) {
						marks[yyyymmdd] = otherMarks
					} else {
						delete marks[yyyymmdd] // Delete date entirely if no other marks left
					}
				}
			}
			modifyData({ marks })
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
