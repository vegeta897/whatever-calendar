import { dev } from '$app/environment'
import {
	APP_URL,
	DISCORD_BOT_TOKEN,
	DISCORD_CLIENT_ID,
} from '$env/static/private'
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	Client,
	ComponentType,
	ModalBuilder,
	REST,
	Routes,
	SlashCommandBuilder,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
	TextInputBuilder,
	TextInputStyle,
	type MessageActionRowComponentBuilder,
} from 'discord.js'
import { DateTime } from 'luxon'
import { getData, getVotes, modifyData } from '../db'
import slug from 'slug'

const commands = [
	new SlashCommandBuilder()
		.setName('whenever')
		.setDescription('View info or create events in the Whenever calendar'),
	// .addSubcommand((subcommand) =>
	// 	subcommand
	// 		.setName('create')
	// 		.setDescription('Create a new event on the calendar')
	// 		.addStringOption((option) =>
	// 			option
	// 				.setName('name')
	// 				.setDescription('The name of the event')
	// 				.setMinLength(3)
	// 				.setMaxLength(40)
	// 		)
	// 		.addStringOption((option) =>
	// 			option
	// 				.setName('description')
	// 				.setDescription('A brief description of the event')
	// 				.setMinLength(5)
	// 				.setMaxLength(256)
	// 		)
	// 		.addStringOption((option) =>
	// 			option
	// 				.setName('cutoff')
	// 				.setDescription(
	// 					'The latest date that can be voted on for the event, in YYYY-MM-DD format'
	// 				)
	// 				.setMinLength(10)
	// 				.setMaxLength(10)
	// 		)
	// ),
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
		console.log('id:', interaction.id)
		if (interaction.commandName === 'whenever') {
			const components = [
				new ActionRowBuilder().addComponents(
					new ButtonBuilder()
						.setCustomId('createEvent')
						.setLabel('Create Event')
						.setStyle(ButtonStyle.Success),
					new ButtonBuilder()
						.setCustomId('deleteEvent')
						.setLabel('Delete Event')
						.setStyle(ButtonStyle.Danger)
				),
				new ActionRowBuilder().addComponents(
					new ButtonBuilder()
						.setLabel('Open Calendar')
						.setStyle(ButtonStyle.Link)
						.setURL(APP_URL)
				),
			] as ActionRowBuilder<MessageActionRowComponentBuilder>[]

			const wheneverCommandReply = await interaction.reply({
				content: getCalendarStats(),
				components,
				fetchReply: true,
				ephemeral: true,
			})
			// TODO: Maybe instead of using modals, use a series of questions and replies?
			//
			wheneverCommandReply
				.createMessageComponentCollector({
					componentType: ComponentType.Button,
					time: 10 * 60 * 1000,
				})
				.on('collect', async (wheneverCommandButtonInteraction) => {
					console.log('button component interaction incoming')
					console.log(
						wheneverCommandButtonInteraction.customId,
						wheneverCommandButtonInteraction.id
					)
					if (wheneverCommandButtonInteraction.customId === 'createEvent') {
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
								].map(
									(input) =>
										new ActionRowBuilder().addComponents(
											input
										) as ActionRowBuilder<TextInputBuilder>
								)
							)
						wheneverCommandButtonInteraction.showModal(modal)
						wheneverCommandButtonInteraction
							.awaitModalSubmit({ time: 5 * 60 * 1000 })
							.then((modalSubmitInteraction) => {
								console.log('modalSubmitInteraction received!')
								const fields = new Map(
									[
										'eventNameInput',
										'eventDescriptionInput',
										'eventCutoffInput',
									].map((field) => [
										field,
										modalSubmitInteraction.fields.getTextInputValue(field),
									])
								)
								createEvent({
									name: fields.get('eventNameInput')!,
									description: fields.get('eventDescriptionInput')!,
									cutoffDate: fields.get('eventCutoffInput')!,
									createdBy: interaction.user.id,
								})
								modalSubmitInteraction.reply(
									`Event "${fields.get('eventNameInput')}" was created by ${
										interaction.user
									}`
								)
							})
					} else if (
						wheneverCommandButtonInteraction.customId === 'deleteEvent'
					) {
						const deleteEventButtonReply =
							await wheneverCommandButtonInteraction.reply({
								content: 'Select an event to delete',
								ephemeral: true,
								fetchReply: true,
								components: [
									new ActionRowBuilder().addComponents(
										new StringSelectMenuBuilder()
											.setCustomId('deleteEventSelect')
											.setPlaceholder('Select event')
											.addOptions(
												...getData().events.map((event) => ({
													label: event.name,
													description: event.description.substring(0, 100),
													value: event.slug,
												}))
											)
									) as ActionRowBuilder<StringSelectMenuBuilder>,
								],
							})
						deleteEventButtonReply
							.createMessageComponentCollector({
								componentType: ComponentType.StringSelect,
								time: 5 * 60 * 1000,
							})
							.on('collect', async (deleteEventSelectInteraction) => {
								console.log('deleteEventSelect received!')
								const selectedEvent = deleteEventSelectInteraction.values[0]
								console.log('selected:', selectedEvent)
								const event = getData().events.find(
									(event) => event.slug === selectedEvent
								)
								wheneverCommandButtonInteraction.deleteReply()
								if (event) {
									const deleteEventSelectReply =
										await deleteEventSelectInteraction.reply({
											content: `Are you sure you want to delete "${event.name}"?`,
											ephemeral: true,
											fetchReply: true,
											components: [
												new ActionRowBuilder().addComponents(
													new ButtonBuilder()
														.setCustomId('confirmDeleteEvent')
														.setLabel('Confirm Delete')
														.setStyle(ButtonStyle.Danger),
													new ButtonBuilder()
														.setCustomId('cancelDeleteEvent')
														.setLabel('Cancel')
														.setStyle(ButtonStyle.Secondary)
												) as ActionRowBuilder<MessageActionRowComponentBuilder>,
											],
										})
									deleteEventSelectReply
										.createMessageComponentCollector({
											componentType: ComponentType.Button,
											time: 30 * 1000,
										})
										.on('collect', (deleteEventButtonInteraction) => {
											console.log('event delete button interaction incoming')
											console.log(
												deleteEventButtonInteraction.customId,
												deleteEventButtonInteraction.id
											)
											deleteEventSelectInteraction.deleteReply()
											if (
												deleteEventButtonInteraction.customId ===
												'confirmDeleteEvent'
											) {
												modifyData({
													events: getData().events.filter(
														(event) => event.slug !== selectedEvent
													),
												})
												deleteEventButtonInteraction.reply(
													`Event "${event.name}" was deleted by ${interaction.user}`
												)
											} else if (
												deleteEventButtonInteraction.customId ===
												'cancelDeleteEvent'
											) {
												deleteEventButtonInteraction.reply(
													'Cancelled, no event was deleted'
												)
											}
										})
										.on('end', async () => {
											if (deleteEventSelectReply.deletable) {
												deleteEventSelectInteraction.deleteReply()
											}
										})
								} else {
									deleteEventSelectInteraction.reply({
										content:
											'Oops, it looks like this event was already deleted!',
										components: [],
									})
								}
							})
							.on('end', () => {
								interaction.editReply({
									content:
										'Command timed out, use `/whenever` to begin another',
									components: [
										new ActionRowBuilder().addComponents(
											new ButtonBuilder()
												.setLabel('Open Calendar')
												.setStyle(ButtonStyle.Link)
												.setURL(APP_URL)
										) as ActionRowBuilder<MessageActionRowComponentBuilder>,
									],
								})
							})
					}
				})
				.on('end', () => {
					interaction.editReply({
						content: 'Command timed out, use `/whenever` to begin another',
						components: [
							new ActionRowBuilder().addComponents(
								new ButtonBuilder()
									.setLabel('Open Calendar')
									.setStyle(ButtonStyle.Link)
									.setURL(APP_URL)
							) as ActionRowBuilder<MessageActionRowComponentBuilder>,
						],
					})
				})
		}
	})
}

type EventCreateOptions = Partial<WheneverEvent> &
	Pick<WheneverEvent, 'name' | 'description' | 'cutoffDate' | 'createdBy'>

function createEvent(options: EventCreateOptions) {
	const events = [...getData().events]
	events.push({
		...options,
		slug: slugifyEventName(options.name, events),
		createdAt: Date.now(),
	})
	modifyData({ events })
}

function slugifyEventName(name: string, events: Pick<WheneverEvent, 'slug'>[]) {
	let slugged: string
	let discriminator = 0
	do {
		slugged = slug(name) + (discriminator ? `-${discriminator}` : '')
		discriminator++
	} while (events.some((e) => e.slug === slugged))
	return slugged
}
