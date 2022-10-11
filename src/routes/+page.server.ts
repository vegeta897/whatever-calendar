import type { Actions } from './$types'

// TODO: Replace this with socket.io
export const actions: Actions = {
	update: async ({ request, cookies }) => {
		console.log('update action received!')
		const data = await request.formData()
		const userData = JSON.parse(data.get('userData') as string)
		console.log(userData)
	},
}
