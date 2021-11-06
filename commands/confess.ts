import { SlashCommandBuilder, SlashCommandStringOption } from '@discordjs/builders'
import Discord, { MessageEmbed } from 'discord.js'
import RYBotCommand from '../rybommand'
import ConfirmationDialogue from '../util/confirm'

export default {
    type: 'SLASH',
    data: new SlashCommandBuilder()
        .setName('confess')
        .setDescription('Acknowledge your sins. Fully anonymous.')
        .addStringOption(
            new SlashCommandStringOption()
                .setName('confession')
                .setRequired(true)
                .setDescription('What do you wish to share')
    ),
    execute: async (interaction, args) => {
        if (!interaction) return
        if (!args) return
        new ConfirmationDialogue(interaction).send("Are you sure you want to confess?", async (status) => {
            const [confession] = args
            if (status == Discord.Constants.MessageButtonStyles.SUCCESS) {
                interaction.channel?.send({
                    embeds: [
                        new MessageEmbed()
                            .setTitle('Confession')
                            .setDescription(confession)
                            .setColor('#ffffff')
                    ]
                })
            }
        })
    }
} as RYBotCommand