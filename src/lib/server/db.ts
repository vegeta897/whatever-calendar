import { Low, JSONFile } from 'lowdb'

// https://stackoverflow.com/a/59700012/2612679
type DeepReadonly<T> = T extends Function // eslint-disable-line @typescript-eslint/ban-types
	? T
	: T extends object
	? { readonly [K in keyof T]: DeepReadonly<T[K]> }
	: T

type DBData = {
	sessions: Session[]
	marks: Record<string, Record<string, Mark>>
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
db.data ||= { marks: {}, sessions: [] }

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
	const userIDs: Set<string> = new Set()
	for (const markDay of Object.values(db.data!.marks)) {
		Object.keys(markDay).forEach((userID) => userIDs.add(userID))
	}
	return [...userIDs]
}

export function modifyData(data: Partial<DBData>) {
	db.data = <DBData>{ ...db.data, ...data }
	queueWriteData()
}

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
