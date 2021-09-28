import { ICommand } from 'wokcommands'
import DiscordJS, { MessageButton, MessageActionRow, MessageEmbed } from 'discord.js'
import ConfirmationDialogue from '../util/confirm'

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
        description: 'How long the poll is available for in days',
        required: true,
        type: DiscordJS.Constants.ApplicationCommandOptionTypes.NUMBER
    },
    {
        name: 'hide_names',
        description: 'Don\'t show who voted for what',
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
        required: false,
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
    const [title, time, is_anonymous, ...options] = args
    const row = new MessageActionRow()
    const embed = new MessageEmbed()
        .setTitle(title)
        .setColor('AQUA')
        .setFooter(`This poll is set to last for ${time} day(s)`)
    // This is weird but it seems to be the only way to get nicknames
    const user = await msgInt.guild?.members.fetch({
        user: msgInt.user
    })
    embed.setAuthor(`${user?.displayName ?? msgInt.user.username}'s poll`, msgInt.user.displayAvatarURL())

    let votes = new Map()
    let hasVoted = new Map()
    let voters: Map<string, DiscordJS.User[]> = new Map()
    let optionIdToName = new Map()

    options.forEach((option, i) => {
        row.addComponents(new MessageButton()
            .setCustomId(`option_${i}`)
            .setLabel(option)
            .setStyle(DiscordJS.Constants.MessageButtonStyles.PRIMARY)
        )
        optionIdToName.set(`option_${i}`, option)
        votes.set(`option_${i}`, 0)
        if (is_anonymous == "false") { 
            embed.addField(option, '[0%]')
        } else {
            embed.addField(option, '0 vote(s) [0%]')
        }
    })
    new ConfirmationDialogue(msgInt, channel).send('Create the poll?\n' + args, async (done) => {
        if (done === DiscordJS.Constants.MessageButtonStyles.SUCCESS) {
            const poll = await channel.send({
                embeds: [
                    embed
                ],
                components: [row]
            })
            const filter = () => { return true };

            const collector = poll.createMessageComponentCollector({
                filter,
                time: parseFloat(time) * 1000 * 60 * 60 * 24 // days to ms
            })

            let totalVotes = 0

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
                        .setColor('AQUA')
                        .setFooter(`This poll is set to last for ${time} day(s)`)
                
                    votes.forEach((v, k) => {
                        if (is_anonymous == 'false') {
                            newEmbed.addField(optionIdToName.get(k), `${voters.get(k)?.join(' ') ?? ''} [${((v/totalVotes) * 100).toFixed(0)}%]`)
                        } else {
                            newEmbed.addField(optionIdToName.get(k), `${v} vote(s) [${((v/totalVotes) * 100).toFixed(0)}%]`)
                        }
                    })

                    poll.edit({
                        embeds: [newEmbed]
                    })

                    click.reply({
                        content: 'Your vote was recorded',
                        ephemeral: true
                    })
                } else {
                    click.reply({
                        content: 'bruh you can\'t vote more than once',
                        ephemeral: true
                    })
                }
            })
        }
    })
  }
} as ICommand