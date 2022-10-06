import type { PageServerLoad } from './$types'

export const load: PageServerLoad = ({ url }) => {
	console.log(url.searchParams.get('u'))
	return {
		users: [],
		foo: 'bar',
	}
}
