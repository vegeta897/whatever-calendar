import { dev, building } from '$app/environment'
import { PUBLIC_GLOBAL_TIMEZONE } from '$env/static/public'
import { days } from '$lib/server/cookies'
import { Low, JSONFile } from 'lowdb'
import { DateTime } from 'luxon'

// https://stackoverflow.com/a/59700012/2612679
type DeepReadonly<T> = T extends Function // eslint-disable-line @typescript-eslint/ban-types
	? T
	: T extends object
	? { readonly [K in keyof T]: DeepReadonly<T[K]> }
	: T

type DBData = {
	sessions: Session[]
	votes: VoteData[]
	events: WheneverEvent[]
}

type Session = Readonly<{
	sessionID: string
	discordID: string
	expires: number
}>

// Use JSON file for storage
const adapter = new JSONFile<DBData>('./db.json')
const db = new Low<DBData>(adapter)
if (!building) await db.read()

db.data ||= { events: [], votes: [], sessions: [] }
db.data.events ||= [] // Migration, remove after first deploy

if (!dev && !building) setInterval(() => cleanupData(), 10 * 60 * 1000)

export function getData(): DeepReadonly<DBData> {
	return db.data!
}

export function getSession(id?: string): Session | undefined {
	if (!id) return undefined
	return db.data!.sessions.find((s) => s.sessionID === id)
}

export function addOrRefreshSession(session: Omit<Session, 'expires'>) {
	modifyData({
		sessions: [
			...db.data!.sessions.filter((s) => s.sessionID !== session.sessionID),
			{ ...session, expires: days(14).getTime() },
		],
	})
}

export function getWheneverUserIDs(me?: string) {
	// Build set of all member IDs
	const voteUsers = getVotes().map((m) => m.userID)
	if (me) voteUsers.push(me)
	return [...new Set(voteUsers)]
}

export function getVotes(): DBData['votes'] {
	// Get votes, filtering out ones from the past
	const now = DateTime.now()
		.setZone(PUBLIC_GLOBAL_TIMEZONE)
		.startOf('day')
		.toMillis()
	return getData().votes.filter(
		(m) =>
			DateTime.fromFormat(m.YYYYMMDD, 'yyyy-LL-dd')
				.setZone(PUBLIC_GLOBAL_TIMEZONE, { keepLocalTime: true })
				.toMillis() >= now
	)
}

export function cleanupData() {
	// Delete expired sessions and old vote data
	const now = Date.now()
	modifyData({
		sessions: db.data!.sessions.filter((s) => s.expires > now),
		votes: getVotes(),
	})
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
