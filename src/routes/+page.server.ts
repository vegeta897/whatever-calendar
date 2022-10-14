import { getData, modifyData } from '$lib/server/db'
import { error } from '@sveltejs/kit'
import type { Actions } from './$types'

export const actions: Actions = {
	update: async ({ request, locals }) => {
		console.log('update action received!')
		if (!locals.discordMember) {
			throw error(401, {
				name: '🤚 Hold up',
				message:
					"You are not logged in, or you don't belong to the server<br><br>Please connect to Discord again",
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
}
