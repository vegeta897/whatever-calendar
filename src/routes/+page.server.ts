import type { PageServerLoad, Actions } from './$types'

export const load: PageServerLoad = async ({ parent }) => {
	const data = await parent()
	return data
}

export const actions: Actions = {
	update: async ({ request, cookies }) => {
		console.log('update action received!')
		const data = await request.formData()
		const userData = JSON.parse(data.get('userData') as string)
		console.log(userData)
	},
}
