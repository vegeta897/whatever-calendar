import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = async ({ locals }) => {
	const pageData: App.PageData = {}
	if (locals.discordUser) pageData.discordUser = locals.discordUser
	return pageData
}
