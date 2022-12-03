import {
	APP_URL,
	DISCORD_BOT_TOKEN,
	DISCORD_CLIENT_ID,
} from '$env/static/private'
import { Client, REST, Routes, SlashCommandBuilder } from 'discord.js'
import { DateTime } from 'luxon'
import { getVotes } from '../db'

const commands = [
	new SlashCommandBuilder()
		.setName('whenever')
		.setDescription('Get overview & status for the Whenever calendar'),
]

const rest = new REST({ version: '10' }).setToken(DISCORD_BOT_TOKEN)

export async function registerCommands() {
	try {
		await rest.put(Routes.applicationCommands(DISCORD_CLIENT_ID), {
			body: commands,
		})
		console.log('Successfully reloaded application (/) commands')
	} catch (error) {
		console.error(error)
	}
}

function getCalendarStats() {
	const votes = getVotes()
	const days = [...new Set(votes.map((v) => v.YYYYMMDD))]
	const users = [...new Set(votes.map((v) => v.userID))]
	let stats = `The calendar has **${votes.length}** votes on **${days.length}** days from **${users.length}** users`

	let mostVotesOnAnyDay = 0
	let mostVotedDays: string[] = []
	for (const day of days) {
		const voteCount = votes.filter((v) => v.YYYYMMDD === day).length
		if (voteCount > mostVotesOnAnyDay) {
			mostVotedDays.length = 0
			mostVotesOnAnyDay = voteCount
		}
		if (voteCount === mostVotesOnAnyDay) {
			mostVotedDays.push(day)
		}
	}
	mostVotedDays = mostVotedDays.map((day) =>
		DateTime.fromFormat(day, 'yyyy-LL-dd').toFormat('MMM d')
	)
	if (mostVotedDays.length === 1) {
		stats += `\n**${mostVotedDays[0]}** has the most votes (${mostVotesOnAnyDay})`
	} else if (mostVotedDays.length === 2) {
		stats += `\n**${mostVotedDays[0]}** and **${mostVotedDays[1]}** have the most votes (${mostVotesOnAnyDay} each)`
	} else if (mostVotedDays.length === 3) {
		stats += `\n**${mostVotedDays[0]}**, **${mostVotedDays[1]}** and **${mostVotedDays[2]}** have the most votes (${mostVotesOnAnyDay} each)`
	}
	return stats
}

// setTimeout(() => console.log(getCalendarStats()), 5000)

export function handleCommands(bot: Client) {
	bot.on('interactionCreate', async (interaction) => {
		if (!interaction.isChatInputCommand()) return
		if (interaction.commandName === 'whenever') {
			const status = `**Vote on the days you can play Sven!**

${getCalendarStats()}

${APP_URL}`
			await interaction.reply(status)
		}
	})
}
