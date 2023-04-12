import {
    SlashCommandBooleanOption,
    SlashCommandBuilder,
    SlashCommandNumberOption,
    SlashCommandStringOption,
} from "@discordjs/builders";
import {
    ActionRowBuilder,
    APIEmbedField,
    ButtonInteraction,
    CommandInteraction,
    EmbedBuilder,
    Events,
    StringSelectMenuBuilder,
    StringSelectMenuInteraction,
    ThreadAutoArchiveDuration,
} from "discord.js";
import prettyMilliseconds from "pretty-ms";
import pino from "pino";
import ConfirmationDialogue from "../util/confirm";
import { Command } from "../rybot.types";

const logger = pino();

export default {
    type: "SLASH",
    options: new SlashCommandBuilder()
        .setName("poll")
        .setDescription("Create a poll")
        .addStringOption(
            new SlashCommandStringOption()
                .setName("title")
                .setDescription("Title of your poll")
                .setRequired(true)
        )
        .addNumberOption(
            new SlashCommandNumberOption()
                .setName("time")
                .setDescription("How long the poll is available for in hours")
                .setRequired(true)
        )
        .addBooleanOption(
            new SlashCommandBooleanOption()
                .setName("anonymous")
                .setDescription("Choose to hide or show names")
                .setRequired(true)
        )
        .addBooleanOption(
            new SlashCommandBooleanOption()
                .setName("create_thread")
                .setDescription(
                    "Create a thread on the poll for further discussion"
                )
                .setRequired(true)
        )
        .addStringOption(
            new SlashCommandStringOption()
                .setName("option_1")
                .setDescription("Option 1")
                .setRequired(true)
        )
        .addStringOption(
            new SlashCommandStringOption()
                .setName("option_2")
                .setDescription("Option 2")
                .setRequired(true)
        )
        .addStringOption(
            new SlashCommandStringOption()
                .setName("option_3")
                .setDescription("Option 3")
                .setRequired(false)
        )
        .addStringOption(
            new SlashCommandStringOption()
                .setName("option_4")
                .setDescription("Option 4")
                .setRequired(false)
        )
        .addStringOption(
            new SlashCommandStringOption()
                .setName("option_5")
                .setDescription("Option 5")
                .setRequired(false)
        )
        .addStringOption(
            new SlashCommandStringOption()
                .setName("option_6")
                .setDescription("Option 6")
                .setRequired(false)
        )
        .addStringOption(
            new SlashCommandStringOption()
                .setName("option_7")
                .setDescription("Option 7")
                .setRequired(false)
        )
        .addStringOption(
            new SlashCommandStringOption()
                .setName("option_8")
                .setDescription("Option 8")
                .setRequired(false)
        ),
    execute: async (interaction: CommandInteraction, args: string[]) => {
        const [title, time, anonymous, createThread, ...optionNames]: string[] =
            args;

        const options = optionNames.map((option, i) => {
            console.log(option);
            return {
                value: "option_" + i,
                label: option,
            };
        });

        const row = new ActionRowBuilder<StringSelectMenuBuilder>();
        const embed = new EmbedBuilder()
            .setTitle(title)
            .setColor("Random")
            .setFooter({
                text: `this poll ends in ${prettyMilliseconds(
                    parseFloat(time) * 1000 * 60 * 60,
                    { compact: true }
                )}`,
            });

        // This is weird but it seems to be the only way to get nicknames
        const user = await interaction.guild?.members.fetch({
            user: interaction.user,
        });

        embed.setAuthor({
            name: `${user?.displayName ?? interaction.user.username}'s poll`,
            iconURL: interaction.user.displayAvatarURL(),
        });

        let optionIdToName = new Map();

        embed.addFields(
            ...options.map((option) => {
                optionIdToName.set(option.value, option.label);
                if (anonymous === "true") {
                    return { name: option.label, value: "0%" };
                } else {
                    return { name: option.label, value: "0%" };
                }
            })
        );

        row.addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('select')
                .setPlaceholder('Select an option')
                .addOptions(
                    ...options.map((option) => {
                        return {
                            label: option.label,
                            description: option.value,
                            value: option.value,
                        };
                    })
                )
        );

        // Ask the user to confirm

        const confirmed = await new ConfirmationDialogue(interaction, 60).send(
            `Create poll?\ntitle: ${title}\ntime: ${time} hours\nanonymous: ${anonymous}\nchoices: ${options
                .map((e) => e.label)
                .join(", ")}`
        );

        if (!confirmed) {
            return;
        }

        logger.info(`${user?.displayName} created poll '${title}'`);

        const timeCreated = Date.now();
        const poll = await interaction?.channel?.send({
            embeds: [embed],
            components: [row],
        });

        if (createThread === "true") {
            await poll?.startThread({
                name: title,
                autoArchiveDuration: ThreadAutoArchiveDuration.OneWeek,
            });
        }

        const collector = poll?.createMessageComponentCollector({
            time: parseFloat(time) * 1000 * 60 * 60,
        });

        const voters = new Map<string, string>();
        let votes: Map<string, string[]>;

        const getTotalVotes = () => {
            let total = 0;
            votes.forEach((v, _k) => {
                total += v.length;
            });
            return total;
        };

        collector?.on('collect', async (i: StringSelectMenuInteraction) => {
            const [username, userId, voteLabel] = [
                i.user.username,
                i.user.id,
                i.values[0],
            ];
            logger.info(
                `Poll ${title}: ${username} voted for '${optionIdToName.get(
                    voteLabel
                )}'`
            );
            votes = new Map<string, string[]>();
            options.forEach((o) => votes.set(o.value, []));
            voters.set(userId, voteLabel);
            voters.forEach((option, id) =>
                votes.get(option)
                    ? votes.get(option)?.push(id)
                    : votes.set(option, [id])
            );

            const newPoll = embed.setFields().setFooter({
                text: `This poll ends in ${prettyMilliseconds(
                    timeCreated +
                        parseFloat(time) * 1000 * 60 * 60 -
                        Date.now(),
                    { compact: true }
                )}`,
            });

            let newFields: APIEmbedField[] = [];
            votes.forEach((users, option) => {
                const ratio = ((users.length / getTotalVotes()) * 100).toFixed(
                    0
                );
                newFields.push({
                    name: optionIdToName.get(option),
                    value:
                        anonymous === 'true'
                            ? `${users.length} vote${
                                  users.length == 1 ? "" : "s"
                              } (${ratio}%)`
                            : `${
                                  users.map((user) => `<@${user}>`).join(" ") ??
                                  ''
                              } (${ratio}%)`,
                });
            });

            newPoll.addFields(newFields);

            poll?.edit({ embeds: [newPoll] });

            i.reply({
                content: `You voted for "${optionIdToName.get(i.values[0])}"`,
                ephemeral: true,
            });
        });

        // Called when time runs out
        collector?.on("end", (_collection) => {
            logger.info(
                `Poll '${title}' (${user?.displayName}) poll has ended`
            );
            const newEmbed = new EmbedBuilder()
                .setAuthor({
                    name: `${
                        user?.displayName ?? interaction.user.username
                    }'s poll`,
                    iconURL: interaction.user.displayAvatarURL(),
                })
                .setTitle(title)
                .setColor("Green")
                .setFooter({ text: "Voting has ended" });

            let maxVotes = 0;
            let winner = "";
            votes.forEach((voters, optionId) => {
                if (voters.length > maxVotes) {
                    maxVotes = voters.length;
                    winner = optionId;
                }
            });

            const fields: APIEmbedField[] = [];
            votes.forEach((voters: string[], optionId: string) => {
                const ratio = ((voters.length / getTotalVotes()) * 100).toFixed(
                    0
                );
                const name = `${
                    winner === optionId ? "✅" : ""
                } ${optionIdToName.get(optionId)}`;

                if (anonymous === "true") {
                    fields.push({
                        name,
                        value: `${voters.length} vote${
                            voters.length === 1 ? "" : "s"
                        } (${ratio}%)`,
                    });
                } else {
                    fields.push({
                        name,
                        value: `${
                            voters.map((e) => `<@${e}>`).join(" ") ?? ""
                        } (${ratio}%)`,
                    });
                }
            });

            newEmbed.addFields(fields);

            poll?.edit({
                embeds: [newEmbed],
                components: [],
            });
        });
    },
} as Command;
