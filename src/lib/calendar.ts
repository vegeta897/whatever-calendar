import { browser } from '$app/environment'
import { readable, writable } from 'svelte/store'

export const YEAR = 2022
export const MONTHS = [10, 11, 12] as const

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
	const startDay = new Date()
	startDay.setHours(0, 0, 0, 0)
	const finalMonth = MONTHS[MONTHS.length - 1]
	const finalDay = new Date(YEAR, finalMonth, 0)
	const days: CalendarDay[] = []
	const dayLooper = new Date(startDay)
	while (dayLooper <= finalDay) {
		const day: Omit<CalendarDay, 'YYYYMMDD'> = {
			date: new Date(dayLooper),
			day: dayLooper.getDate(),
			month: dayLooper.getMonth() + 1,
			year: dayLooper.getFullYear(),
			weekday: dayLooper.getDay(),
			weekend: [0, 6].includes(dayLooper.getDay()),
		}
		days.push({
			...day,
			YYYYMMDD: `${zeroPad(day.year!)}-${zeroPad(day.month!)}-${zeroPad(
				day.day!
			)}`,
		})
		dayLooper.setDate(dayLooper.getDate() + 1)
	}
	return days
}

export function getCalendarDays(
	days: CalendarDay[],
	year: number,
	month: number,
	weekStart: 0 | 1
) {
	const monthDays = days.filter(
		(day) => day.year === year && day.month === month
	)
	const preDays = days.slice(
		days.indexOf(monthDays[0]) - ((7 + monthDays[0].weekday - weekStart) % 7),
		days.indexOf(monthDays[0])
	)
	const lastDay = monthDays[monthDays.length - 1]
	const postDays = days.slice(
		days.indexOf(lastDay) + 1,
		days.indexOf(lastDay) + (7 - lastDay.weekday + weekStart)
	)
	return [...preDays, ...monthDays, ...postDays]
}

export function getWeekdayNames(weekStart: 0 | 1) {
	return weekStart === 0 ? WEEKDAY_NAMES : WEEKDAY_NAMES_START_MON
}

const locale = (browser && navigator.language) || 'default'

const sunday = new Date()
sunday.setDate(sunday.getDate() - sunday.getDay())
const monday = new Date(sunday)
monday.setDate(monday.getDate() + 1)
export const sundayName = sunday.toLocaleDateString(locale, { weekday: 'long' })
export const mondayName = monday.toLocaleDateString(locale, { weekday: 'long' })

const WEEKDAY_NAMES: string[] = []
const WEEKDAY_NAMES_START_MON: string[] = []
const weekday = new Date(2000, 0)
for (let i = 0; i < 7; i++) {
	const name = weekday.toLocaleString(locale, {
		weekday: 'short',
	})
	WEEKDAY_NAMES[weekday.getDay()] = name
	WEEKDAY_NAMES_START_MON[(weekday.getDay() + 6) % 7] = name
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
