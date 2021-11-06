import { SlashCommandBooleanOption, SlashCommandBuilder, SlashCommandNumberOption, SlashCommandStringOption } from "@discordjs/builders";
import Discord, { CommandInteraction, MessageActionRow, MessageEmbed, MessageSelectMenu, MessageSelectOptionData, SelectMenuInteraction } from "discord.js";
import prettyMilliseconds from "pretty-ms";
import RYBotCommand from "../rybommand";
import ConfirmationDialogue from "../util/confirm";


export default {
    type: 'SLASH',
    data: new SlashCommandBuilder()
        .setName('poll')
        .setDescription('Create a poll')
        .addStringOption(
            new SlashCommandStringOption()
                .setName('title')
                .setDescription('Title of the poll')
                .setRequired(true))
        .addNumberOption(
            new SlashCommandNumberOption()
                .setName('time')
                .setDescription('How long the poll is available for in hours')
                .setRequired(true))
        .addBooleanOption(
            new SlashCommandBooleanOption()
                .setName('show_names')
                .setDescription('Switch to False to keep voting anonymous')
                .setRequired(true))
        .addStringOption(
            new SlashCommandStringOption()
                .setName('option_1')
                .setDescription('First option')
                .setRequired(true))
        .addStringOption(
            new SlashCommandStringOption()
                .setName('option_2')
                .setDescription('Second option')
                .setRequired(true))
        .addStringOption(
            new SlashCommandStringOption()
                .setName('option_3')
                .setDescription('Third option')
                .setRequired(false))
        .addStringOption(
            new SlashCommandStringOption()
                .setName('option_4')
                .setDescription('Fourth option')
                .setRequired(false))
        .addStringOption(
            new SlashCommandStringOption()
                .setName('option_5')
                .setDescription('Fifth option')
                .setRequired(false))
        .addStringOption(
            new SlashCommandStringOption()
                .setName('option_6')
                .setDescription('Sixth option')
                .setRequired(false))
        .addStringOption(
            new SlashCommandStringOption()
                .setName('option_7')
                .setDescription('Seventh option')
                .setRequired(false))
        .addStringOption(
            new SlashCommandStringOption()
                .setName('option_8')
                .setDescription('Eighth option')
                .setRequired(false)),

    execute: async (interaction: CommandInteraction, args: string[]) => {
        const [title, time, show_names, ...options]: string[] = args
        const row = new MessageActionRow()
        const menu = new MessageSelectMenu()
        const embed = new MessageEmbed()
            .setTitle(title)
            .setColor('BLUE')
            .setFooter(`This poll ends in ${prettyMilliseconds(parseFloat(time) * 1000 * 60 * 60)}`)

        // This is weird but it seems to be the only way to get nicknames

        const user = await interaction.guild?.members.fetch({
            user: interaction.user
        })
        embed.setAuthor(`${user?.displayName ?? interaction.user.username}'s poll`, interaction.user.displayAvatarURL())

        // Keeps track of amount of votes each option has
        let votes = new Map()
        // Keeps track of who has already voted
        let hasVoted = new Map()
        // Stores who voted for each option
        let voters = new Map()
        // Get the actual name of the option from the button ID
        let optionIdToName = new Map()

        menu.setCustomId('menu')
            .setPlaceholder('Select an option')
            .addOptions(
                options.map((option, i) => {
                    return {
                        value: 'option_' + i,
                        label: option
                    } as MessageSelectOptionData
                })
            )

        options.forEach((option, i) => {
            optionIdToName.set(`option_${i}`, option)
            votes.set(`option_${i}`, 0)
            if (show_names == 'true') {
                embed.addField(option, '(0) [0%]')
            } else {
                embed.addField(option, '0 votes [0%]')
            }
        })
        
        row.addComponents(menu)

        // Ask the user to confirm

        new ConfirmationDialogue(interaction, 60).send('**Create the poll?**\n' +
            `**title**: ${title}\n**time**: ${time} hours\n**show_names**: ${show_names}\n**choices**: ${options.join(', ')}`, async (done) => {
                if (done === Discord.Constants.MessageButtonStyles.SUCCESS) {
                    const timeCreated = Date.now()
                    const poll = await interaction?.channel?.send({
                        embeds: [
                            embed
                        ],
                        components: [row]
                    })
                    if (poll) {
                        const collector = poll.createMessageComponentCollector({
                            time: parseFloat(time) * 1000 * 60 * 60 // hours to ms
                        })
    
                        let totalVotes = 0
    
                        // On a button press
    
                        collector.on('collect', async (click: SelectMenuInteraction) => {
                            console.log(click.user.username + ' clicked on menu item ' + click.values[0])
                            if (!hasVoted.has(click.user.id)) {
                                hasVoted.set(click.user.id, true);
                                if (voters.get(click.values[0])) {
                                    voters.get(click.values[0])?.push(click.user)
                                } else {
                                    voters.set(click.values[0], [click.user])
                                }
                                votes.set(click.values[0], (votes.get(click.values[0]) ?? 0) + 1)
                                totalVotes += 1
                                const newEmbed = new MessageEmbed()
                                    .setAuthor(`${user?.displayName ?? interaction.user.username}'s poll`, interaction.user.displayAvatarURL())
                                    .setTitle(title)
                                    .setColor('BLUE')
                                    .setFooter(`This poll ends in ${prettyMilliseconds(timeCreated + (parseFloat(time) * 1000 * 60 * 60) - Date.now())}`)
    
                                votes.forEach((v, k) => {
                                    if (show_names == 'true') {
                                        newEmbed.addField(optionIdToName.get(k),
                                            `${voters.get(k)?.join(', ') ?? ''} (${v}) [${((v / totalVotes) * 100).toFixed(0)}%]`)
                                    } else {
                                        newEmbed.addField(optionIdToName.get(k),
                                            `${v} vote${v == 1 ? '' : 's'} [${((v / totalVotes) * 100).toFixed(0)}%]`)
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
                        console.log(user?.displayName + '\'s poll has ended')
                        const newEmbed = new MessageEmbed()
                            .setAuthor(`${user?.displayName ?? interaction.user.username}'s poll`,
                                interaction.user.displayAvatarURL())
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
                                    `${voters.get(k)?.join(', ') ?? ''} (${v}) [${((v / totalVotes) * 100).toFixed(0)}%]`)
                            } else {
                                newEmbed.addField(`${winner == k ? '✅' : ''} ${optionIdToName.get(k)}`,
                                    `${v} vote${v == 1 ? '' : 's'} [${((v / totalVotes) * 100).toFixed(0)}%]`)
                            }
                        })

                        poll.edit({
                            embeds: [newEmbed],
                            components: []
                        })
                    })
                }
            }
        })
    }
} as RYBotCommand