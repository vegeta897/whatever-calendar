import type { LayoutServerLoad } from './$types'
import { join, dirname } from 'path'
import { Low, JSONFile } from 'lowdb'
import { fileURLToPath } from 'url'

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

type PageData = {
	discordUser?: App.Locals['discordUser']
	discordGuild?: App.Locals['discordGuild']
	userData?: UserData
	weekStart?: number
}

// TODO: Move this db to hooks.server.ts, add userData to App.Locals
// Use JSON file for storage
const __dirname = dirname(fileURLToPath(import.meta.url))
const file = join(__dirname, 'db.json')
const adapter = new JSONFile<UserData>(file)
const db = new Low<UserData>(adapter)

await db.read()

db.data ||= { users: [] }

export const load: LayoutServerLoad = ({ cookies, locals }) => {
	const pageData: PageData = {}
	if (locals.discordUser) pageData.discordUser = locals.discordUser
	if (locals.discordGuild) pageData.discordGuild = locals.discordGuild
	if (locals.discordGuild) {
		pageData.userData = db.data!
		const weekStart = cookies.get('wec-weekStart')
		if (weekStart !== undefined) {
			pageData.weekStart = +weekStart
		}
	}
	return pageData
}
