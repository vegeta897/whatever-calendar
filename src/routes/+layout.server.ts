import { getData, getWheneverUserIDs } from '$lib/server/db'
import { getMembers } from '$lib/server/discord/bot'
import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = async ({ cookies, locals }) => {
	console.log(new Date().toTimeString().substring(0, 8), 'layout.server load!')
	const pageData: App.PageData = {}
	if (locals.discordUser) pageData.discordUser = locals.discordUser
	if (locals.discordMember) {
		pageData.discordMember = locals.discordMember
		pageData.marks = getData().marks as Mark[]
		pageData.notes = getData().notes as Note[]
		pageData.users = await getMembers(getWheneverUserIDs())
		pageData.users[locals.discordMember.id].me = true
		const weekStart = cookies.get('wec-weekStart')
		if (weekStart !== undefined) {
			pageData.weekStart = +weekStart as 7 | 1
		}
	}
	return pageData
}
