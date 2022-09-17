import { SlashCommandBuilder, SlashCommandStringOption } from '@discordjs/builders'
import Discord, { MessageEmbed } from 'discord.js'
import RYBotCommand from '../rybommand'
import ConfirmationDialogue from '../util/confirm'

export default {
    type: 'SLASH',
    data: new SlashCommandBuilder()
        .setName('confess')
        .setDescription('Fully anonymous message')
        .addStringOption(
            new SlashCommandStringOption()
                .setName('subject')
                .setRequired(true)
                .setDescription('Write anything')
        )
        .addStringOption(
            new SlashCommandStringOption()
                .setName('body')
                .setRequired(true)
                .setDescription('Write anything')
        ),
    execute: async (interaction, args) => {
        if (!interaction) return
        if (!args) return
        const [title, confession] = args
        const confirm = new ConfirmationDialogue(interaction)
        const status = await confirm.send(`Are you sure you want to send "${confession}"?`);
        if (status) {
            interaction.channel?.send({
                embeds: [
                    new MessageEmbed()
                        .setTitle(title)
                        .setDescription(confession)
                        .setColor('#ffffff')
                ]
            })
        }
    }
} as RYBotCommand