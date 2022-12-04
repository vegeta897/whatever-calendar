import { dev } from '$app/environment'
import {
	APP_URL,
	DISCORD_BOT_TOKEN,
	DISCORD_CLIENT_ID,
} from '$env/static/private'
import {
	ActionRowBuilder,
	Client,
	ModalBuilder,
	REST,
	Routes,
	SlashCommandBuilder,
	TextInputBuilder,
	TextInputStyle,
} from 'discord.js'
import { DateTime } from 'luxon'
import { getVotes } from '../db'

const commands = [
	new SlashCommandBuilder()
		.setName('whenever')
		.setDescription('View info or create events in the Whenever calendar')
		.addSubcommand((subcommand) =>
			subcommand.setName('info').setDescription('View info about the calendar')
		)
		.addSubcommandGroup((group) =>
			group
				.setName('event')
				.setDescription('Add or edit events on the calendar')
				.addSubcommand((subcommand) =>
					subcommand
						.setName('create')
						.setDescription('Create a new event on the calendar')
						.addStringOption((option) =>
							option
								.setName('name')
								.setDescription('The name of the event')
								.setMinLength(3)
								.setMaxLength(40)
						)
						.addStringOption((option) =>
							option
								.setName('description')
								.setDescription('A brief description of the event')
								.setMinLength(5)
								.setMaxLength(256)
						)
						.addStringOption((option) =>
							option
								.setName('cutoff')
								.setDescription(
									'The latest date that can be voted on for the event, in YYYY-MM-DD format'
								)
								.setMinLength(10)
								.setMaxLength(10)
						)
						.addStringOption((option) =>
							option
								.setName('color')
								.setDescription(
									'The calendar background color for the event, in #hex format'
								)
								.setMinLength(7)
								.setMaxLength(7)
						)
				)
		),
]

const rest = new REST({ version: '10' }).setToken(DISCORD_BOT_TOKEN)

rest.on('restDebug', (restDebug) => {
	console.log(restDebug)
})

export async function registerCommands() {
	try {
		// await rest.delete(
		// 	Routes.applicationGuildCommand(
		// 		DISCORD_CLIENT_ID,
		// 		'1045279421138997268', // Whenever server
		// 		'1048026669392343060' // /whenever guild command
		// 	)
		// )
		if (dev) {
			await rest.put(
				Routes.applicationGuildCommands(
					DISCORD_CLIENT_ID,
					'1045279421138997268'
				),
				{
					body: commands,
				}
			)
		} else {
			await rest.put(Routes.applicationCommands(DISCORD_CLIENT_ID), {
				body: commands,
			})
		}
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
	// TODO: Need to dispose of listeners on old client instance
	// when app restarts in dev mode
	bot.on('interactionCreate', async (interaction) => {
		if (!interaction.isChatInputCommand()) return
		console.log('incoming command')
		if (dev && interaction.guildId !== '1045279421138997268') return
		if (dev && interaction.commandGuildId !== '1045279421138997268') return
		console.log('name:', interaction.commandName)
		console.log('subgroup:', interaction.options.getSubcommandGroup())
		console.log('subcommand:', interaction.options.getSubcommand())
		console.log('id:', interaction.id)
		if (interaction.commandName === 'whenever') {
			const subgroup = interaction.options.getSubcommandGroup()
			const subcommand = interaction.options.getSubcommand()
			if (subcommand === 'info') {
				const status = `**Vote on the days you can play Sven!**

${getCalendarStats()}

${APP_URL}`
				await interaction.reply(status)
			} else if (subcommand === 'create') {
				const options = new Map(
					['name', 'description', 'cutoff', 'color']
						.map((option) => [option, interaction.options.getString(option)])
						.filter((option) => option[1]) as [string, string][]
				)
				if (
					!options.has('name') ||
					!options.has('description') ||
					!options.has('cutoff')
				) {
					// Missing required options, create a modal
					const modal = new ModalBuilder()
						.setCustomId('eventInfo')
						.setTitle('Event Info')
						.addComponents(
							[
								new TextInputBuilder()
									.setCustomId('eventNameInput')
									.setLabel('Event name')
									.setStyle(TextInputStyle.Short)
									.setRequired(true)
									.setMinLength(3)
									.setMaxLength(40),
								new TextInputBuilder()
									.setCustomId('eventDescriptionInput')
									.setLabel('Description')
									.setStyle(TextInputStyle.Paragraph)
									.setRequired(true)
									.setMinLength(5)
									.setMaxLength(256)
									.setPlaceholder('A brief summary or explanation'),
								new TextInputBuilder()
									.setCustomId('eventCutoffInput')
									.setLabel('Cutoff date')
									.setStyle(TextInputStyle.Short)
									.setRequired(true)
									.setMinLength(10)
									.setMaxLength(10)
									.setPlaceholder('2023-01-31'),
								new TextInputBuilder()
									.setCustomId('eventColorInput')
									.setLabel('Calendar color')
									.setStyle(TextInputStyle.Short)
									.setMinLength(7)
									.setMaxLength(7)
									.setPlaceholder('#ffdb3b'),
							].map(
								(input) =>
									new ActionRowBuilder().addComponents(
										input
									) as ActionRowBuilder<TextInputBuilder>
							)
						)
					await interaction.showModal(modal)
				} else {
					// All required options present
					await interaction.reply(`Event "${options.get('name')}" created`)
				}
			}
		}
	})

	bot.on('interactionCreate', async (interaction) => {
		if (!interaction.isModalSubmit()) return
		console.log('modal submission received!')
		const fields = new Map(
			[
				'eventNameInput',
				'eventDescriptionInput',
				'eventCutoffInput',
				'eventColorInput',
			].map((field) => [field, interaction.fields.getTextInputValue(field)])
		)
		interaction.reply(`Event "${fields.get('eventNameInput')}" created`)
	})
}
