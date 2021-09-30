import Discord, { MessageActionRow, MessageButton, MessageEmbed } from 'discord.js'
import { ICommand } from 'wokcommands'
import ConfirmationDialogue from '../../util/confirm'

export default {
    category: 'General',
    description: 'Create an event. Date format: "mm/dd/yyyy". Time format: "xx:xx[am|pm]"',
    slash: true,
    expectedArgs: '<title> <description> <where> <date> <img_url>',
    minArgs: 4,
    testOnly: true,
    cooldown: '3m',
    options: [
        {
            name: 'title',
            description: 'Name of event',
            type: Discord.Constants.ApplicationCommandOptionTypes.STRING,
            required: true,
        },
        {
            name: 'description',
            description: 'Event description',
            type: Discord.Constants.ApplicationCommandOptionTypes.STRING,
            required: true
        },
        {
            name: 'where',
            description: 'Location of event',
            type: Discord.Constants.ApplicationCommandOptionTypes.STRING,
            required: true,
        },
        {
            name: 'date_time',
            description: 'The date and time of the event',
            type: Discord.Constants.ApplicationCommandOptionTypes.STRING,
            required: true
        },
        {
            name: 'img_url',
            description: 'URL of an image to display on the event',
            type: Discord.Constants.ApplicationCommandOptionTypes.STRING,
            required: false
        }
    ], 

    callback: ({ interaction, channel, args}) => {
        new ConfirmationDialogue(interaction, channel).send("Create the event?", async (status) => {
            const [title, description, where, date, url] = args
            let going: Discord.User[] = [] 
            let maybe: Discord.User[] = []
            let not_going: Discord.User[] = []
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
                    .setColor('BLUE')
                    .setImage(url)
                    .setAuthor(interaction.user.username + ' created an event', interaction.user.displayAvatarURL())
                    .addField('When', date, true)
                    .addField('Where', where, true)
                    .addField('Going', 'Nobody :(')
                    .addField('Maybe', 'nobody :(')
                const event = await channel.send({
                    content: '@everyone',
                    embeds: [embed],
                    components: [row]
                })
            } else {

            }
        })
    }
} as ICommand
