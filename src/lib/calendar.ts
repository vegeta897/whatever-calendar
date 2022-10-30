import { browser } from '$app/environment'
import { readable, writable } from 'svelte/store'

const END_YEAR = 2022
const END_MONTH = 12

export const days = readable<CalendarDay[]>(getDays())
export const weekStart = writable<0 | 1>(0)

export type CalendarDay = {
	date: Date
	day: number
	month: number
	year: number
	weekday: number
	weekend: boolean
	YYYYMMDD: string
}

function getDays(): CalendarDay[] {
	// This takes less than a millisecond, better to run on client than transfer the data
	const startDay = new Date()
	startDay.setHours(0, 0, 0, 0)
	const finalDay = new Date(END_YEAR, END_MONTH, 0)
	const days: CalendarDay[] = []
	const dayLooper = new Date(startDay)
	while (dayLooper <= finalDay) {
		const day: Omit<CalendarDay, 'YYYYMMDD'> = {
			date: new Date(dayLooper),
			day: dayLooper.getDate(),
			month: dayLooper.getMonth(),
			year: dayLooper.getFullYear(),
			weekday: dayLooper.getDay(),
			weekend: [0, 6].includes(dayLooper.getDay()),
		}
		days.push({
			...day,
			YYYYMMDD: `${zeroPad(day.year!)}-${zeroPad(day.month! + 1)}-${zeroPad(
				day.day!
			)}`,
		})
		dayLooper.setDate(dayLooper.getDate() + 1)
	}
	return days
}

export function getPreDays(
	days: CalendarDay[],
	before: Date,
	weekStart: 0 | 1
) {
	const preDays: number[] = []
	const preDayLooper = new Date(days.find((d) => sameDay(d.date, before))!.date)
	while (preDayLooper.getDay() !== weekStart) {
		preDayLooper.setDate(preDayLooper.getDate() - 1)
		preDays.push(preDayLooper.getDate())
	}
	return preDays.reverse()
}

export function sameDay(dateA: Date, dateB: Date) {
	return (
		dateA.getFullYear() === dateB.getFullYear() &&
		dateA.getMonth() === dateB.getMonth() &&
		dateA.getDate() === dateB.getDate()
	)
}

export function getWeekdayNames(weekStart: 0 | 1) {
	return weekStart === 0 ? WEEKDAY_NAMES_SHORT : WEEKDAY_NAMES_START_MON
}

const locale = (browser && navigator.language) || 'default'

const sunday = new Date()
sunday.setDate(sunday.getDate() - sunday.getDay())
const monday = new Date(sunday)
monday.setDate(monday.getDate() + 1)
export const sundayName = sunday.toLocaleDateString(locale, { weekday: 'long' })
export const mondayName = monday.toLocaleDateString(locale, { weekday: 'long' })

export const WEEKDAY_NAMES: string[] = []
const WEEKDAY_NAMES_SHORT: string[] = []
const WEEKDAY_NAMES_START_MON: string[] = []
const weekday = new Date(2000, 0)
for (let i = 0; i < 7; i++) {
	WEEKDAY_NAMES[weekday.getDay()] = weekday.toLocaleString(locale, {
		weekday: 'long',
	})
	const shortName = weekday.toLocaleString(locale, {
		weekday: 'short',
	})
	WEEKDAY_NAMES_SHORT[weekday.getDay()] = shortName
	WEEKDAY_NAMES_START_MON[(weekday.getDay() + 6) % 7] = shortName
	weekday.setDate(weekday.getDate() + 1)
}

export const MONTH_NAMES: string[] = []
export const MONTH_ABBREV: string[] = []
// Don't use today's date because setMonth could result in the wrong month if it's e.g. the 31st
const month = new Date(2000, 0)
for (let i = 0; i < 12; i++) {
	month.setMonth(i)
	MONTH_NAMES[month.getMonth()] = month.toLocaleString(locale, {
		month: 'long',
	})
	MONTH_ABBREV[month.getMonth()] = month.toLocaleString(locale, {
		month: 'short',
	})
}

function zeroPad(number: number) {
	return number.toString().padStart(2, '0')
}
