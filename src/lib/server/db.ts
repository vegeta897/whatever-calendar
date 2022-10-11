import { Low, JSONFile } from 'lowdb'

type DBData = {
	sessions: Session[]
} & Record<string, any>

type Session = {
	sessionID: string
	discordUserID?: string // TODO: Is this needed? We get discord user every request
	expires: number
}

// Use JSON file for storage
const adapter = new JSONFile<DBData>('./db.json')

export const db = new Low<DBData>(adapter)

await db.read()

db.data ||= { users: [], sessions: [] }
