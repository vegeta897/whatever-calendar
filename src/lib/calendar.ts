import { browser } from '$app/environment'
import { readable, writable } from 'svelte/store'
import { DateTime } from 'luxon'

const END_YEAR = 2022
const END_MONTH = 12

const _today = DateTime.now().setZone('America/New_York')

// TODO: This only runs once when the server starts, instead of on each request
// So "today" and "days" remains the same as time goes on
// Need to refresh on each request! Put this in Calendar.svelte
export const today = writable<DateTime>(_today)
export const days = readable<CalendarDay[]>(getDays())
export const weekStart = writable<7 | 1>(1)

export type CalendarDay = {
	datetime: DateTime
	day: number
	month: number
	year: number
	weekday: number
	weekend: boolean
	YYYYMMDD: string
}

// Experimenting with dates based on the "oldest" time zone
// const dayTest = new Date('2022-11-05T00:00:00.000-12:00')

function getDays(): CalendarDay[] {
	// This takes less than 1ms, better to run on client than transfer the data
	const days: CalendarDay[] = []
	const startDay = DateTime.now()
		.setZone('America/New_York')
		.set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
	const finalDay = startDay.set({
		year: END_YEAR,
		month: END_MONTH + 1,
		day: 0,
	})
	let dayLooper = startDay.plus(0)
	do {
		const day: CalendarDay = {
			datetime: dayLooper.plus(0),
			day: dayLooper.day,
			month: dayLooper.month,
			year: dayLooper.year,
			weekday: dayLooper.weekday,
			weekend: [0, 6].includes(dayLooper.day),
			YYYYMMDD: `${zeroPad(dayLooper.year)}-${zeroPad(
				dayLooper.month
			)}-${zeroPad(dayLooper.day)}`,
		}
		days.push(day)
		dayLooper = dayLooper.plus({ days: 1 })
	} while (dayLooper <= finalDay)
	return days
}

export function getPreDays(
	days: CalendarDay[],
	before: DateTime,
	weekStart: 7 | 1
) {
	const preDays: number[] = []
	let preDayLooper = days
		.find((d) => d.datetime.hasSame(before, 'day'))!
		.datetime.plus(0)
	while (preDayLooper.weekday !== weekStart) {
		preDayLooper = preDayLooper.minus({ days: 1 })
		preDays.push(preDayLooper.day)
	}
	return preDays.reverse()
}

export function getWeekdayNames(weekStart: 7 | 1) {
	return weekStart === 7 ? WEEKDAY_NAMES_SHORT : WEEKDAY_NAMES_START_MON
}

const locale = (browser && navigator.language) || 'default'

const sunday = new Date()
sunday.setDate(sunday.getDate() - sunday.getDay())
const monday = new Date(sunday)
monday.setDate(monday.getDate() + 1)
export const sundayName = sunday.toLocaleDateString(locale, { weekday: 'long' })
export const mondayName = monday.toLocaleDateString(locale, { weekday: 'long' })

const WEEKDAY_NAMES_SHORT: string[] = []
const WEEKDAY_NAMES_START_MON: string[] = []
const weekday = new Date(2000, 0)
for (let i = 0; i < 7; i++) {
	const shortName = weekday.toLocaleString(locale, {
		weekday: 'short',
	})
	WEEKDAY_NAMES_SHORT[weekday.getDay()] = shortName
	WEEKDAY_NAMES_START_MON[(weekday.getDay() + 6) % 7] = shortName
	weekday.setDate(weekday.getDate() + 1)
}

function zeroPad(number: number) {
	return number.toString().padStart(2, '0')
}
