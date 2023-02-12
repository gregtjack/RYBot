import {
  SlashCommandBooleanOption,
  SlashCommandBuilder,
  SlashCommandNumberOption,
  SlashCommandStringOption,
} from "@discordjs/builders";
import {
  ActionRowBuilder,
  APIEmbedField,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  CommandInteraction,
  EmbedBuilder,
  ThreadAutoArchiveDuration,
} from "discord.js";
import prettyMilliseconds from "pretty-ms";
import pino from "pino";
import ConfirmationDialogue from "../util/confirm";
import Command from "../command";

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
        .setDescription("Create a thread on the poll for further discussion")
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
            return {
                value: "option_" + i,
                label: option,
            };
        });
        const row = new ActionRowBuilder<ButtonBuilder>();
        const embed = new EmbedBuilder()
            .setTitle(title)
            .setColor('Yellow')
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
                return { name: option.label, value: "0 votes [0%]" };
                } else {
                return { name: option.label, value: "(0) [0%]" };
                }
            })
        );

        row.addComponents(
            ...options.map((option) => {
                return new ButtonBuilder()
                .setCustomId(option.value)
                .setLabel(option.label)
                .setStyle(ButtonStyle.Primary);
            })
        );

        // Ask the user to confirm

        const confirm = new ConfirmationDialogue(interaction, 60);
        const confirmed = await confirm.send(
            `**Create the poll?**\n**title**: ${title}\n**time**: ${time} hours\n**anonymous**: ${anonymous}\n**choices**: ${options
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

        collector?.on("collect", async (i: ButtonInteraction) => {
            logger.info(
                `Poll ${title}: ${i.user.username} voted for '${optionIdToName.get(
                i.customId
                )}'`
            );
            votes = new Map<string, string[]>();
            options.forEach((o) => votes.set(o.value, []));
            voters.set(i.user.id, i.customId);
            voters.forEach((option, userId) =>
                votes.get(option)
                ? votes.get(option)?.push(userId)
                : votes.set(option, [userId])
            );

            const newPoll = new EmbedBuilder()
                .setAuthor({
                    name: `${user?.displayName ?? interaction.user.username}'s poll`,
                    iconURL: interaction.user.displayAvatarURL(),
                })
                .setTitle(title)
                .setColor('Yellow')
                .setFooter({
                    text: `This poll ends in ${prettyMilliseconds(timeCreated + parseFloat(time) * 1000 * 60 * 60 - Date.now(),
                    { compact: true }
                )}`,
                });

            votes.forEach((users, option) => {
                newPoll.addFields({
                name: optionIdToName.get(option),
                value:
                    anonymous === "true"
                    ? `${users.length} vote${users.length == 1 ? "" : "s"} [${(
                        (users.length / getTotalVotes()) *
                        100
                        ).toFixed(0)}%]`
                    : `(${users.length}) ${
                        users.map((e) => `<@${e}>`).join(" ") ?? ""
                        } [${((users.length / getTotalVotes()) * 100).toFixed(0)}%]`,
                });
            });

            poll?.edit({ embeds: [newPoll] });

            i.reply({
                content: `You voted for "${optionIdToName.get(i.customId)}"`,
                ephemeral: true,
            });
        });

        // Called when time runs out
        collector?.on("end", (_collection) => {
            logger.info(`Poll '${title}' (${user?.displayName}) poll has ended`);
            const newEmbed = new EmbedBuilder()
                .setAuthor({
                name: `${user?.displayName ?? interaction.user.username}'s poll`,
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
                const name = `${winner === optionId ? "✅" : ""} ${optionIdToName.get(
                optionId
                )}`;
                if (anonymous === "true") {
                    fields.push({
                        name,
                        value: `${voters.length} vote${voters.length == 1 ? "" : "s"} [${(
                        (voters.length / getTotalVotes()) *
                        100
                        ).toFixed(0)}%]`,
                    });
                } else {
                    fields.push({
                        name,
                        value: `(${voters.length}) ${
                        voters.map((e) => `<@${e}>`).join(" ") ?? ""
                        } [${((voters.length / getTotalVotes()) * 100).toFixed(0)}%]`,
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
