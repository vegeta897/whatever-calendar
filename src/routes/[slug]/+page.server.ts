import {
	getData,
	getMarks,
	getWheneverUserIDs,
	modifyData,
} from '$lib/server/db'
import { error, redirect } from '@sveltejs/kit'
import { get } from 'svelte/store'
import { days } from '$lib/calendar'
import type { Actions, PageServerLoad } from './$types'
import { getUsers } from '$lib/server/discord/bot'

export const load: PageServerLoad = async ({
	cookies,
	locals,
	params,
	url,
}) => {
	console.log(`(server) load /${params.slug}`)

	const dayFromSlug = get(days).find((day) => day.YYYYMMDD === params.slug)
	if (!locals.discordMember) {
		console.log('member not authed, redirecting to root')
		throw redirect(302, '/')
	}
	if (params.slug !== 'calendar' && !dayFromSlug) {
		// Invalid day slug
		throw redirect(302, '/calendar')
	}
	const pageData: App.PageData & { day: null | string; href: string } = {
		day: dayFromSlug?.YYYYMMDD || null,
		href: url.href,
	}
	pageData.discordMember = locals.discordMember
	pageData.marks = getMarks()
	pageData.users = await getUsers(getWheneverUserIDs())
	pageData.users[locals.discordMember.id].me = true
	const weekStart = cookies.get('wec-weekStart')
	if (weekStart !== undefined) {
		pageData.weekStart = +weekStart as 7 | 1
	}
	return pageData
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
	note: async ({ request, locals }) => {
		console.log('note action received!')
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
