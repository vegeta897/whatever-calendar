import { Low, JSONFile } from 'lowdb'

// https://stackoverflow.com/a/59700012/2612679
type DeepReadonly<T> = T extends Function // eslint-disable-line @typescript-eslint/ban-types
	? T
	: T extends object
	? { readonly [K in keyof T]: DeepReadonly<T[K]> }
	: T

type DBData = {
	sessions: Session[]
	marks: Mark[]
	notes: Note[]
}

type Session = Readonly<{
	sessionID: string
	discordID: string
	expires: number
}>

// Use JSON file for storage
const adapter = new JSONFile<DBData>('./db.json')
const db = new Low<DBData>(adapter)
await db.read()
db.data ||= { marks: [], notes: [], sessions: [] }

export function getData(): DeepReadonly<DBData> {
	return db.data!
}

export function getSession(id?: string): Session | undefined {
	if (!id) return undefined
	return db.data!.sessions.find((s) => s.sessionID === id)
}

export function addSession(session: Session) {
	modifyData({ sessions: [...db.data!.sessions, session] })
}

export function getWheneverUserIDs() {
	// Build set of all member IDs
	return [...new Set(db.data!.marks.map((m) => m.userID))]
}

export function modifyData(data: Partial<DBData>) {
	db.data = <DBData>{ ...db.data, ...data }
	queueWriteData()
}

// TODO: This might be unecessary? Conflicts may have been caused by HMR
// LowDB uses Steno under the hood which should be handling any conflicts
let dirty = false
function queueWriteData() {
	dirty = true
	setTimeout(writeData)
}

let writing = false
async function writeData() {
	if (!dirty || writing) return
	writing = true
	try {
		await db.write()
	} catch (e) {
		console.log(new Date(), 'Error writing to DB!', e)
	}
	writing = false
	dirty = false
}
