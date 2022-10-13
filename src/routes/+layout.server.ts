import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = async ({ cookies, locals }) => {
	console.log(new Date().toTimeString(), 'layout.server load!')
	const pageData: App.PageData = {}
	if (locals.discordUser) pageData.discordUser = locals.discordUser
	if (locals.discordMember) {
		pageData.discordMember = locals.discordMember
		// pageData.userData = db.data!
		const weekStart = cookies.get('wec-weekStart')
		if (weekStart !== undefined) {
			pageData.weekStart = +weekStart
		}
	}
	return pageData
}
