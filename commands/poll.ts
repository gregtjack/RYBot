import { ICommand } from 'wokcommands'
import DiscordJS, { MessageButton, MessageActionRow, MessageEmbed } from 'discord.js'
import ConfirmationDialogue from '../util/confirm'
import prettyMilliseconds from 'pretty-ms'

export default {
  category: 'General',
  description: 'Create a poll', 
  slash: true, 
  cooldown: '1m',
  testOnly: true, 
  minArgs: 4,
  expectedArgs: '<title> <time> <hide_names> <option1> <option2> <option3> <option4>',

  options: [
    {
        name: 'title',
        description: 'Title of the poll',
        required: true,
        type: DiscordJS.Constants.ApplicationCommandOptionTypes.STRING,
    },
    {
        name: 'time',
        description: 'How long the poll is available for in hours',
        required: true,
        type: DiscordJS.Constants.ApplicationCommandOptionTypes.NUMBER
    },
    {
        name: 'show_names',
        description: 'Show who voted for what',
        required: true,
        type: DiscordJS.Constants.ApplicationCommandOptionTypes.BOOLEAN
    },
    {
        name: 'option_1',
        description: 'First choice',
        required: true,
        type: DiscordJS.Constants.ApplicationCommandOptionTypes.STRING,
    },
    {
        name: 'option_2',
        description: 'Second choice',
        required: true,
        type: DiscordJS.Constants.ApplicationCommandOptionTypes.STRING,
    },
    {
        name: 'option_3',
        description: 'Third choice',
        required: false,
        type: DiscordJS.Constants.ApplicationCommandOptionTypes.STRING,
    },  
    {
        name: 'option_4',
        description: 'Fourth choice',
        required: false,
        type: DiscordJS.Constants.ApplicationCommandOptionTypes.STRING,
    },  
  ],
  
  callback: async ({ interaction: msgInt, args, channel }) => {
    const [title, time, show_names, ...options] = args
    const row = new MessageActionRow()
    const embed = new MessageEmbed()
        .setTitle(title)
        .setColor('BLUE')
        .setFooter(`This poll ends in ${prettyMilliseconds(parseFloat(time) * 1000 * 60 * 60)}`)

    // This is weird but it seems to be the only way to get nicknames

    const user = await msgInt.guild?.members.fetch({
        user: msgInt.user
    })
    embed.setAuthor(`${user?.displayName ?? msgInt.user.username}'s poll`, msgInt.user.displayAvatarURL())

    // Keeps track of amount of votes each option has
    let votes = new Map()
    // Keeps track of who has already voted
    let hasVoted = new Map()
    // Stores who voted for each option
    let voters = new Map()
    // Get the actual name of the option from the button ID
    let optionIdToName = new Map()

    options.forEach((option, i) => {
        row.addComponents(new MessageButton()
            .setCustomId(`option_${i}`)
            .setLabel(option)
            .setStyle(DiscordJS.Constants.MessageButtonStyles.PRIMARY)
        )
        optionIdToName.set(`option_${i}`, option)
        votes.set(`option_${i}`, 0)
        if (show_names == 'true') { 
            embed.addField(option, '[0%]')
        } else {
            embed.addField(option, '0 votes [0%]')
        }
    })

    // Ask the user to confirm

    new ConfirmationDialogue(msgInt, channel).send('**Create the poll?**\n' + 
    `**title**: ${title}\n**time**: ${time} hours\n**show_names**: ${show_names}\n**choices**: ${options.join(', ')}`, async (done) => {
            if (done === DiscordJS.Constants.MessageButtonStyles.SUCCESS) {
                const timeCreated = Date.now()
                const poll = await channel.send({
                    embeds: [
                        embed
                    ],
                    components: [row]
                })

                const collector = poll.createMessageComponentCollector({
                    time: parseFloat(time) * 1000 * 60 * 60 // hours to ms
                })

                let totalVotes = 0

                // On a button press

                collector.on('collect', async (click) => {
                    if (!hasVoted.has(click.user.id)) {
                        hasVoted.set(click.user.id, true);
                        if (voters.get(click.customId)) {
                            voters.get(click.customId)?.push(click.user)
                        } else {
                            voters.set(click.customId, [click.user])
                        }
                        votes.set(click.customId, (votes.get(click.customId ?? 0) + 1))
                        totalVotes += 1
                        const newEmbed = new MessageEmbed()
                            .setAuthor(`${user?.displayName ?? msgInt.user.username}'s poll`, msgInt.user.displayAvatarURL())
                            .setTitle(title)
                            .setColor('BLUE')
                            .setFooter(`This poll ends in ${prettyMilliseconds(timeCreated + (parseFloat(time) * 1000 * 60 * 60) - Date.now())}`)
                    
                        votes.forEach((v, k) => {
                            if (show_names == 'true') {
                                newEmbed.addField(optionIdToName.get(k),
                                    `${voters.get(k)?.join(', ') ?? ''} [${((v/totalVotes) * 100).toFixed(0)}%]`)
                            } else {
                                newEmbed.addField(optionIdToName.get(k), 
                                    `${v} vote${v == 1 ? '' : 's'} [${((v/totalVotes) * 100).toFixed(0)}%]`)
                            }
                        })

                        poll.edit({
                            embeds: [newEmbed]
                        })

                        click.reply({
                            content: 'your vote was recorded',
                            ephemeral: true
                        })
                    } else {
                        click.reply({
                            content: 'bruh you can\'t vote more than once',
                            ephemeral: true
                        })
                    }
                })

                // Called when time runs out

                collector.on('end', (collection) => {
                    const newEmbed = new MessageEmbed()
                            .setAuthor(`${user?.displayName ?? msgInt.user.username}'s poll`, 
                                msgInt.user.displayAvatarURL())
                            .setTitle(title)
                            .setColor('GREEN')
                            .setFooter(`This poll has ended`)
                    let maxVotes = 0
                    let winner = '';

                    votes.forEach((v, k) => {
                        if (v > maxVotes) {
                            maxVotes = v
                            winner = k
                        }
                    })

                    votes.forEach((v, k) => {
                        if (show_names == 'true') {
                            newEmbed.addField(`${winner == k ? '✅' : ''} ${optionIdToName.get(k)}`,
                                `${voters.get(k)?.join(', ') ?? ''} [${((v/totalVotes) * 100).toFixed(0)}%]`)
                        } else {
                            newEmbed.addField(`${winner == k ? '✅' : ''} ${optionIdToName.get(k)}`, 
                                `${v} vote${v == 1 ? '' : 's'} [${((v/totalVotes) * 100).toFixed(0)}%]`)
                        }
                    })

                    poll.edit({
                        embeds: [newEmbed],
                        components: []
                    })
                })
            }
        })
    }
} as ICommand