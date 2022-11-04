import type { PageLoad } from './$types'
import { days } from '../../lib/calendar'
import { get } from 'svelte/store'
import { redirect } from '@sveltejs/kit'

export const load: PageLoad = async ({ params, parent, data }) => {
	console.log('begin /[slug]', params.slug)
	if (params.slug === 'calendar') return { day: null }
	const dayFromSlug = get(days).find((day) => day.YYYYMMDD === params.slug)
	if (!dayFromSlug) {
		// Invalid day slug (redirect apparently works client-side too!)
		throw redirect(302, '/calendar')
	}
	return { day: dayFromSlug }
}
