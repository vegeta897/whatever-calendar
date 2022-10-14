import { getData } from '$lib/server/db'
import { getMembers } from '$lib/server/discord/bot'
import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = async ({ cookies, locals }) => {
	console.log(new Date().toTimeString().substring(0, 8), 'layout.server load!')
	const pageData: App.PageData = {}
	if (locals.discordUser) pageData.discordUser = locals.discordUser
	if (locals.discordMember) {
		pageData.discordMember = locals.discordMember
		pageData.marks = getData().marks
		// Build set of all member IDs
		const userIDs: Set<string> = new Set()
		for (const markDay of Object.values(pageData.marks)) {
			Object.keys(markDay).forEach((userID) => userIDs.add(userID))
		}
		console.time('getMembers')
		// TODO: This is way too slow, need to cache members
		pageData.users = await getMembers([...userIDs])
		console.timeEnd('getMembers')
		const weekStart = cookies.get('wec-weekStart')
		if (weekStart !== undefined) {
			pageData.weekStart = +weekStart
		}
	}
	return pageData
}
