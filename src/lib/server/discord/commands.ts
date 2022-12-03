import {
	APP_URL,
	DISCORD_BOT_TOKEN,
	DISCORD_CLIENT_ID,
} from '$env/static/private'
import { Client, REST, Routes, SlashCommandBuilder } from 'discord.js'
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
	const mostVotedDay = days.reduce((most, current) => {
		if (
			votes.filter((v) => v.YYYYMMDD === current).length >
			votes.filter((v) => v.YYYYMMDD === most).length
		) {
			return current
		} else {
			return most
		}
	}, days[0])
	const users = [...new Set(votes.map((v) => v.userID))]
	return `The calendar has **${votes.length}** votes on **${days.length}** days from **${users.length}** users
${mostVotedDay} has the most votes`
}

// setTimeout(() => console.log(getCalendarStats()), 5000)

export function handleCommands(bot: Client) {
	bot.on('interactionCreate', async (interaction) => {
		if (!interaction.isChatInputCommand()) return
		if (interaction.commandName === 'whenever') {
			const status = `**Whenever**
${getCalendarStats()}

${APP_URL}`
			await interaction.reply(status)
		}
	})
}
