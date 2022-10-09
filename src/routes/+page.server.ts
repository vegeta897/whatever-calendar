import type { PageServerLoad, Actions } from './$types'
import { join, dirname } from 'path'
import { Low, JSONFile } from 'lowdb'
import { fileURLToPath } from 'url'
import { error } from '@sveltejs/kit'

type YMD = [number, number, number]

type Span = {
	start: YMD
	end: YMD
}

type User = {
	name: string
	id: string
	spans: Span[]
}

export type UserData = {
	users: User[]
}

// Use JSON file for storage
const __dirname = dirname(fileURLToPath(import.meta.url))
const file = join(__dirname, 'db.json')
const adapter = new JSONFile<UserData>(file)
const db = new Low<UserData>(adapter)

await db.read()

db.data ||= { users: [] }

export const load: PageServerLoad = ({ url, cookies }) => {
	const userID = url.searchParams.get('u') || cookies.get('wec-user-id')
	console.log('loading user:', userID)
	if (!userID) throw error(401, 'Unauthorized!')
	cookies.set('wec-user-id', userID)
	return {
		userData: db.data!,
		weekStart: cookies.get('wec-weekStart') ?? undefined
	}
}

export const actions: Actions = {
	update: async ({ request, cookies }) => {
		console.log('update action received!')
		const data = await request.formData()
		const userData = JSON.parse(data.get('userData') as string)
		console.log(userData)
	},
}
