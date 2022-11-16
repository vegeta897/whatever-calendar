import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = async ({ locals }) => {
	console.log(new Date().toTimeString().substring(0, 8), 'layout.server load!')
	const pageData: App.PageData = {}
	if (locals.discordUser) pageData.discordUser = locals.discordUser
	return pageData
}
