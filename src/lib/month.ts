import { browser } from '$app/environment'
import { writable } from 'svelte/store'

export type CalendarDay = {
	date: Date
	day: number
	inMonth: boolean
	marked: 0|1|2
	weekend: boolean
}

export const weekStart = writable<0 | 1>(0)

const locale = browser ? navigator.language || 'default' : 'default'

const sunday = new Date()
sunday.setDate(sunday.getDate() - sunday.getDay())
const monday = new Date(sunday)
monday.setDate(monday.getDate() + 1)
export const sundayName = sunday.toLocaleDateString(locale, { weekday: 'long' })
export const mondayName = monday.toLocaleDateString(locale, { weekday: 'long' })

export function getMonthData(year: number, month: number, weekStart: 0 | 1) {
	const monthStart = new Date()
	monthStart.setHours(0, 0, 0, 0)
	monthStart.setFullYear(year)
	monthStart.setMonth(month - 1) // Zero-indexed
	monthStart.setDate(1)
	const startDay = new Date(monthStart)
	startDay.setDate(
		startDay.getDate() - ((7 + startDay.getDay() - weekStart) % 7)
	)

	const days: CalendarDay[] = []
	const dayLooper = new Date(startDay)
	const weekdayNames: string[] = []
	let i = 0
	while (true) {
		if (weekdayNames.length < 7)
			weekdayNames.push(dayLooper.toLocaleString(locale, { weekday: 'short' }))
		days.push({
			date: new Date(dayLooper),
			day: dayLooper.getDate(),
			marked: 0,
			inMonth: dayLooper.getMonth() + 1 === month,
			weekend: [0, 6].includes(dayLooper.getDay()),
		})
		dayLooper.setDate(dayLooper.getDate() + 1)
		if (
			dayLooper > monthStart &&
			dayLooper.getMonth() + 1 !== month &&
			dayLooper.getDay() === weekStart
		)
			break
		if (i++ > 50) break
	}

	return {
		name: monthStart.toLocaleString(locale, { month: 'long' }),
		days,
		weekdayNames,
	}
}
