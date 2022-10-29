import type { PageLoad } from './$types'

export const load: PageLoad = async ({ params, parent }) => {
	console.log('begin /[slug]', params.slug)
	return { day: params.slug }
}
