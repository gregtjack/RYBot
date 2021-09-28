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
  expectedArgs: '<title> <time> <hideVotes?> <option1> <option2> <option3> <option4>',

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
        name: 'hide_votes',
        description: 'Hide votes until time is up',
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
    const [title, time, hideVotes, ...options] = args
    const row = new MessageActionRow()
    const embed = new MessageEmbed()
        .setAuthor(msgInt.user.username + ' created a poll', msgInt.user.displayAvatarURL())
        .setTitle(title)
        .setColor('RED')
        .setFooter(`This poll is set to last for ${time} day(s)`)

    let votes = new Map()
    let voters = new Map()
    let optionIdToName = new Map()

    options.forEach((option, i) => {
        row.addComponents(new MessageButton()
            .setCustomId(`option_${i}`)
            .setLabel(option)
            .setStyle(DiscordJS.Constants.MessageButtonStyles.PRIMARY)
        )
        optionIdToName.set(`option_${i}`, option)
        votes.set(`option_${i}`, 0)
        if (hideVotes == 'false') embed.addField(option, '0 (0%)')
    })
    const confirm = new ConfirmationDialogue(msgInt, channel).send('Create the poll?', async (done) => {
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

            collector.on('collect', (click) => {
                if (!voters.has(click.user.id)) {
                    voters.set(click.user.id, 1);
                    votes.set(click.customId, (votes.get(click.customId ?? 0) + 1))
                    totalVotes += 1
                    const newEmbed = new MessageEmbed()
                        .setAuthor(msgInt.user.username + ' created a poll', msgInt.user.displayAvatarURL())
                        .setTitle(title)
                        .setColor('RED')
                        .setFooter(`This poll is set to last for ${time} day(s)`)

                    votes.forEach((k, v) => {
                        if (hideVotes == 'false') newEmbed.addField(optionIdToName.get(v), `${k} (${((k/totalVotes) * 100).toFixed(0)}%)`)
                    })

                    if (hideVotes == 'false') poll.edit({
                        embeds: [newEmbed]
                    })

                    click.reply({
                        content: 'Your vote was recorded!',
                        ephemeral: true
                    })
                } else {
                    click.reply({
                        content: 'You cannot vote more than once',
                        ephemeral: true
                    })
                }
            })
        }
    })
  }
} as ICommand