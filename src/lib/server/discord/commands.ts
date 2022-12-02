import {
	APP_URL,
	DISCORD_BOT_TOKEN,
	DISCORD_CLIENT_ID,
} from '$env/static/private'
import { Client, REST, Routes, SlashCommandBuilder } from 'discord.js'
import { getMarks } from '../db'

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

export function handleCommands(bot: Client) {
	bot.on('interactionCreate', async (interaction) => {
		if (!interaction.isChatInputCommand()) return
		if (interaction.commandName === 'whenever') {
			const marks = getMarks()
			const days = [...new Set(marks.map((m) => m.YYYYMMDD))]
			const users = [...new Set(marks.map((m) => m.userID))]
			const status = `**Whenever**
The calendar has **${marks.length}** marks on **${days.length}** days from **${users.length}** users

${APP_URL}`
			await interaction.reply(status)
		}
	})
}
