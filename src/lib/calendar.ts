import { browser } from '$app/environment'
import { writable } from 'svelte/store'
import { DateTime } from 'luxon'
import { PUBLIC_GLOBAL_TIMEZONE } from '$env/static/public'

const FINAL_DAY = DateTime.fromObject({ year: 2022, month: 12 })
	.setZone(PUBLIC_GLOBAL_TIMEZONE, { keepLocalTime: true })
	.endOf('month')
	.startOf('day')

// These get overwritten in Calendar.svelte; is there a better way to do this?
export const today = writable<DateTime>(
	DateTime.now().setZone(PUBLIC_GLOBAL_TIMEZONE)
)
export const now = writable<DateTime>(
	DateTime.now().setZone(PUBLIC_GLOBAL_TIMEZONE)
)
export const days = writable<CalendarDay[]>([])
export const weekStart = writable<7 | 1>(1)

export type CalendarDay = {
	datetime: DateTime
	day: number
	month: number
	year: number
	weekday: number
	YYYYMMDD: string
}

export function getDays(): CalendarDay[] {
	// This takes less than 1ms, better to run on client than transfer the data
	const days: CalendarDay[] = []
	const startDay = DateTime.now().setZone(PUBLIC_GLOBAL_TIMEZONE).startOf('day')
	let dayLooper = startDay.plus(0)
	do {
		const day: CalendarDay = {
			datetime: dayLooper.plus(0),
			day: dayLooper.day,
			month: dayLooper.month,
			year: dayLooper.year,
			weekday: dayLooper.weekday,
			YYYYMMDD: dayLooper.toFormat('yyyy-LL-dd'),
		}
		days.push(day)
		dayLooper = dayLooper.plus({ days: 1 })
	} while (dayLooper <= FINAL_DAY)
	return days
}

export function getPreDays(
	days: CalendarDay[],
	before: DateTime,
	weekStart: 7 | 1
) {
	const preDays: { day: number; month: string }[] = []
	let preDayLooper = days
		.find((d) => d.datetime.hasSame(before, 'day'))!
		.datetime.plus(0)
	while (preDayLooper.weekday !== weekStart) {
		preDayLooper = preDayLooper.minus({ days: 1 })
		preDays.push({ day: preDayLooper.day, month: preDayLooper.monthShort })
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
export const sunName = sunday.toLocaleDateString(locale, { weekday: 'short' })
export const monName = monday.toLocaleDateString(locale, { weekday: 'short' })

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
