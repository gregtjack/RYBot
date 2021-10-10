import { SlashCommandBuilder, SlashCommandIntegerOption, SlashCommandStringOption } from '@discordjs/builders'
import Discord, { CommandInteraction, MessageActionRow, MessageButton, MessageEmbed } from 'discord.js'
import RYBotCommand from '../rybommand'
import ConfirmationDialogue from '../util/confirm'

export default {
    type: 'SLASH',
    data: new SlashCommandBuilder()
        .setName('event')
        .setDescription('Create an event')
        .addStringOption(
            new SlashCommandStringOption()
                .setName('title')
                .setRequired(true)
                .setDescription('Name of the event'))
        .addStringOption(
            new SlashCommandStringOption()
                .setName('description')
                .setDescription('Description of the event')
                .setRequired(true))
        .addStringOption(
            new SlashCommandStringOption()
                .setName('where')
                .setDescription('Location of event')
                .setRequired(true))
        .addStringOption(
            new SlashCommandStringOption()
                .setName('when')
                .setDescription('Date and time of the event')
                .setRequired(true))
        .addIntegerOption(
            new SlashCommandIntegerOption()
                .setName('lifetime')
                .setDescription('How many days will this event remain active')
                .setRequired(true)
        ),

    execute: async (interaction, args) => {
        if (!interaction) return
        if (!args) return
        new ConfirmationDialogue(interaction).send("Create the event?", async (status) => {
            const [title, description, where, when, lifetime] = args

            let people: Map<string, string> = new Map()

            if (status === Discord.Constants.MessageButtonStyles.SUCCESS) {
                const row = new MessageActionRow()
                    .addComponents([
                        new MessageButton()
                            .setCustomId('going')
                            .setStyle('SUCCESS')
                            .setLabel('Going'),
                        new MessageButton()
                            .setCustomId('not_going')
                            .setLabel('Not Going')
                            .setStyle('DANGER'),
                        new MessageButton()
                            .setCustomId('maybe')
                            .setLabel('Maybe')
                            .setStyle('SECONDARY')
                    ])

                const embed = new MessageEmbed()
                    .setTitle(title)
                    .setDescription(description)
                    .setColor('BLURPLE')

                    .setAuthor(interaction.user.username + ' created an event', interaction.user.displayAvatarURL())
                    .addField('When', when, true)
                    .addField('Where', where, true)
                    .addField('Going', 'No responses')
                    .addField('Not Going', 'No responses')
                    .addField('Maybe', 'No responses')
                if (interaction.channel) {
                    const event = await interaction.channel.send({
                        content: '@everyone',
                        embeds: [embed],
                        components: [row]
                    })
                    
                    const collector = event.createMessageComponentCollector({
                        time: 1000 * 120 * 24 * (parseInt(lifetime)),
                    })
    
                    collector.on('collect', (click) => {
                        const going: string[] = [], not_going: string[] = [], maybe: string[] = []
                        people.set(click.user.id, click.customId)
                        people.forEach((v, k) => {
                            if (v == 'going') {
                                going.push(k)
                            } else if (v == 'not_going') {
                                not_going.push(k)
                            } else {
                                maybe.push(k)
                            }
                        })
                        const newEmbed = new MessageEmbed()
                            .setTitle(title as string)
                            .setDescription(description as string)
                            .setColor('BLURPLE')
                       
                            .setAuthor(interaction.user.username + ' created an event', interaction.user.displayAvatarURL())
                            .addField('When', when as string, true)
                            .addField('Where', where as string, true)
                            .addField('Going', going.length > 0 ? going.map(e => `<@${e}>`).join(' ') + ` (${going.length})` : 'No responses')
                            .addField('Not Going', not_going.length > 0 ? not_going.map(e => `<@${e}>`).join(' ') + ` (${not_going.length})` : 'No responses')
                            .addField('Maybe', maybe.length > 0 ? maybe.map(e => `<@${e}>`).join(' ') + ` (${maybe.length})` : 'No responses')
    
                        event.edit({ embeds: [newEmbed] })
    
                        click.reply({
                            content: 'Recorded response',
                            ephemeral: true
                        })
                    })
                }
            }
        })
    }
} as RYBotCommand