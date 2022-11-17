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
import { DateTime } from 'luxon'

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

// TODO: Insert await sleep to test slow server UX
export const actions: Actions = {
	mark: async ({ request, locals }) => {
		console.log('mark action received!')
		checkAuth(locals.discordMember)
		const formData = await request.formData()
		if (!formData.has('mark')) {
			validationError('Request invalid, missing "mark" form data', {
				user: locals.discordMember.username,
			})
		}
		const userID = locals.discordMember.id
		let doMark: boolean
		try {
			doMark = JSON.parse(formData.get('mark') as string)
		} catch (e) {
			validationError(
				`Request invalid, received non-boolean "mark" form data`,
				{
					mark: formData.get('mark'),
					user: locals.discordMember.username,
				}
			)
			return
		}
		const YYYYMMDD = formData.get('day') as string
		if (!YYYYMMDD || !get(days).find((d) => d.YYYYMMDD === YYYYMMDD)) {
			validationError(`Request invalid, "${YYYYMMDD}" is an invalid day`, {
				YYYYMMDD,
				user: locals.discordMember.username,
			})
		}
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
			validationError('Request invalid, missing "noteText" form data', {
				user: locals.discordMember.username,
			})
		}
		const noteText = formData.get('noteText') as string
		if (typeof noteText !== 'string') {
			validationError(
				'Request invalid, received non-string "noteText" form data',
				{ noteText, user: locals.discordMember.username }
			)
		}
		const YYYYMMDD = formData.get('day') as string
		if (!YYYYMMDD || !get(days).find((d) => d.YYYYMMDD === YYYYMMDD)) {
			validationError(`Request invalid, "${YYYYMMDD}" is an invalid day`, {
				YYYYMMDD,
				user: locals.discordMember.username,
			})
		}
		const marks = [...getData().marks]
		const notedMark = marks.find(
			(m) => m.userID === locals.discordMember!.id && m.YYYYMMDD === YYYYMMDD
		)!
		if (!notedMark) {
			validationError(
				`Tried to modify the note for a mark that doesn't exist`,
				{ YYYYMMDD, user: locals.discordMember.username }
			)
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

function validationError(message: string, ...debugData: any[]) {
	console.log(DateTime.now().toFormat('f'), 'Validation error!')
	console.log('Message:', message)
	if (debugData.length > 0) console.log(...debugData)
	throw error(400, { name: 'Oops...', message })
}

function checkAuth(
	discordMember?: DiscordMember
): asserts discordMember is DiscordMember {
	if (!discordMember) {
		throw error(401, {
			name: 'Oops...',
			message: 'Your session was lost, please log in again',
		})
	}
}
