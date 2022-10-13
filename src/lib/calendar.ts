import { browser } from '$app/environment'
import { writable } from 'svelte/store'

export type CalendarDay = {
	date: Date
	day: number
	month: number
	year: number
	marked: 0 | 1 | 2
	weekday: number
	weekend: boolean
}

export function getDays(year: number, months: number[]) {
	const startDay = new Date(year, months[0] - 1, -5) // Include 6 days before start
	const finalMonth = months[months.length - 1]
	const finalDay = new Date(year, finalMonth, 6) // Include 6 days after final
	const days: CalendarDay[] = []
	const dayLooper = new Date(startDay)
	while (dayLooper <= finalDay) {
		const day: CalendarDay = {
			date: new Date(dayLooper),
			day: dayLooper.getDate(),
			month: dayLooper.getMonth() + 1,
			year: dayLooper.getFullYear(),
			marked: 0,
			weekday: dayLooper.getDay(),
			weekend: [0, 6].includes(dayLooper.getDay()),
		}
		days.push(day)
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
// Don't use today's date because setMonth could result in the wrong month if it's e.g. the 31st
const month = new Date(2000, 0)
for (let i = 0; i < 12; i++) {
	month.setMonth(i)
	MONTH_NAMES[month.getMonth()] = month.toLocaleString(locale, {
		month: 'long',
	})
}
