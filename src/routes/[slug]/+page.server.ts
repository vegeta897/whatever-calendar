import { getData, getMarks, modifyData } from '$lib/server/db'
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

// TODO: Validate incoming data
// TODO: Insert await sleep to test slow server UX
export const actions: Actions = {
	mark: async ({ request, locals }) => {
		console.log('mark action received!')
		checkAuth(locals.discordMember)
		const formData = await request.formData()
		if (!formData.has('mark')) {
			throw error(400, {
				name: 'Oops...',
				message: 'Request invalid, missing "mark" form data',
			})
		}
		const userID = locals.discordMember.id
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
	addNote: async ({ request, locals }) => {
		console.log('addNote action received!')
		checkAuth(locals.discordMember)
		const formData = await request.formData()
		if (!formData.has('noteText')) {
			throw error(400, {
				name: 'Oops...',
				message: 'Request invalid, missing "noteText" form data',
			})
		}
		const userID = locals.discordMember.id
		const noteText = formData.get('noteText') as string
		const YYYYMMDD = formData.get('day') as string
		const marks = [...getData().marks]
		const notedMark = marks.find(
			(m) => m.userID === userID && m.YYYYMMDD === YYYYMMDD
		)!
		if (!notedMark) {
			throw error(400, {
				name: 'Oops...',
				message: `Error trying to add a note to a mark that doesn't exist`,
			})
		}
		modifyData({
			marks: [
				...marks.filter((m) => m !== notedMark),
				{
					...notedMark,
					noteTimestamp: Date.now(),
					note: noteText,
				},
			],
		})
		// const notes = [...getData().notes]
		// modifyData({
		// 	notes: [
		// 		...notes,
		// 		{
		// 			YYYYMMDD,
		// 			userID,
		// 			text: noteText.trim(),
		// 			timestamp: Date.now(),
		// 			lastEditTimestamp: Date.now(),
		// 		},
		// 	],
		// })
	},
	deleteNote: async ({ request, locals }) => {
		console.log('deleteNote action received!')
		checkAuth(locals.discordMember)
		const formData = await request.formData()
		if (!formData.has('noteID')) {
			throw error(400, {
				name: 'Oops...',
				message: 'Request invalid, missing "noteID" form data',
			})
		}
		const userID = locals.discordMember.id
		const noteID = formData.get('noteID') as string
		// const notes = [...getData().notes]
		// const deletedNote = notes.find(
		// 	(n) => `${n.YYYYMMDD}:${n.userID}:${n.timestamp}` === noteID
		// )
		// if (!deletedNote) {
		// 	throw error(400, {
		// 		name: 'Oops...',
		// 		message: 'It looks like that note was already deleted!',
		// 	})
		// }
		// if (deletedNote.userID !== userID) {
		// 	throw error(401, {
		// 		name: 'Oops...',
		// 		message: 'You are not authorized to delete that note!',
		// 	})
		// }
		// modifyData({ notes: notes.filter((n) => n !== deletedNote) })
	},
}

function checkAuth(
	discordMember?: DiscordMember
): asserts discordMember is DiscordMember {
	if (!discordMember) {
		throw error(401, {
			name: 'Oops...',
			message: 'Your session was lost, please connect to Discord again',
		})
	}
}
