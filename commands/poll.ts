import { ICommand } from 'wokcommands'
import DiscordJS, { MessageButton, MessageActionRow, Interaction } from 'discord.js'
import ConfirmationDialogue from '../util/confirm'

export default {
  category: 'General',
  description: 'Create a poll', 
  slash: true, 
  cooldown: '1m',
  testOnly: true, 
  minArgs: 3,
  expectedArgs: '<title> <option1> <option2> <option3> <option4>',

  options: [
    {
        name: 'title',
        description: 'Title of the poll',
        required: true,
        type: DiscordJS.Constants.ApplicationCommandOptionTypes.STRING,
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
    const [title, ...options] = args
    const row = new MessageActionRow()
    options.forEach((option, i) => {
        row.addComponents(new MessageButton()
        .setCustomId('option_' + i)
        .setLabel(option)
        .setStyle(DiscordJS.Constants.MessageButtonStyles.PRIMARY)
        )
    })
    const db = new ConfirmationDialogue(msgInt, channel).send('Create the poll?', async (done, click) => {
        if (done === DiscordJS.Constants.MessageButtonStyles.SUCCESS) {
            await click.reply({
                content: `**${title}**`,
                components: [row]
            })
        }
    })
  }
} as ICommand