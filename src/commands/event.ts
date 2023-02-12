import {
  SlashCommandBooleanOption,
  SlashCommandBuilder,
  SlashCommandIntegerOption,
  SlashCommandStringOption,
} from "@discordjs/builders";
import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import Command from "../command";
import ConfirmationDialogue from "../util/confirm";

export default {
  type: "SLASH",
  options: new SlashCommandBuilder()
    .setName("event")
    .setDescription("Create an event")
    .addStringOption(
      new SlashCommandStringOption()
        .setName("title")
        .setRequired(true)
        .setDescription("Name of the event")
    )
    .addStringOption(
      new SlashCommandStringOption()
        .setName("description")
        .setDescription("Description of the event")
        .setRequired(true)
    )
    .addBooleanOption(
      new SlashCommandBooleanOption()
        .setName("at_everyone")
        .setDescription("Send the message with a ping to @everyone")
        .setRequired(true)
    )
    .addStringOption(
      new SlashCommandStringOption()
        .setName("where")
        .setDescription("Location of event")
        .setRequired(true)
    )
    .addStringOption(
      new SlashCommandStringOption()
        .setName("when")
        .setDescription("Date and time of the event")
        .setRequired(true)
    )
    .addIntegerOption(
      new SlashCommandIntegerOption()
        .setName("lifetime")
        .setDescription("How many days will this event remain active")
        .setRequired(true)
    ),

  execute: async (interaction, args) => {
    if (!interaction) return;
    if (!args) return;
    const confirm = new ConfirmationDialogue(interaction);
    const res = await confirm.send("Create the event?");
    const [title, description, pingEveryone, where, when, lifetime] = args;

    let people: Map<string, string> = new Map();

    if (res) {
      const row = new ActionRowBuilder<ButtonBuilder>().addComponents([
        new ButtonBuilder()
          .setCustomId("going")
          .setStyle(ButtonStyle.Success)
          .setLabel("Going"),
        new ButtonBuilder()
          .setCustomId("not_going")
          .setLabel("Not Going")
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId("maybe")
          .setLabel("Maybe")
          .setStyle(ButtonStyle.Secondary),
      ]);

      const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor("Aqua")
        .setAuthor({
          name: interaction.user.username + " created an event",
          iconURL: interaction.user.displayAvatarURL(),
        })
        .addFields(
          { name: "Where", value: where, inline: true },
          { name: "When", value: when, inline: true },
        );

      if (interaction.channel) {
        const message = {
            content: '',
            embeds: [embed],
            components: [row],
        };
        if (pingEveryone === 'true') {
            message['content'] = '@everyone';
        }
        const event = await interaction.channel.send(message);
        const collector = event.createMessageComponentCollector({
          time: 1000 * 120 * 24 * parseInt(lifetime),
        });

        collector.on("collect", (click) => {
          const going: string[] = [],
            not_going: string[] = [],
            maybe: string[] = [];
          people.set(click.user.id, click.customId);
          people.forEach((v, k) => {
            if (v == "going") {
              going.push(k);
            } else if (v == "not_going") {
              not_going.push(k);
            } else {
              maybe.push(k);
            }
          });
          const newEmbed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(description)
            .setColor("Aqua")
            .setAuthor({
              name: interaction.user.username + " created an event",
              iconURL: interaction.user.displayAvatarURL(),
            })
            .addFields(
              { name: "Where", value: where, inline: true },
              { name: "When", value: when, inline: true },
              {
                name: "Going",
                value:
                  going.length > 0
                    ? going.map((e) => `<@${e}>`).join(" ") +
                      ` (${going.length})`
                    : "No responses",
              },
              {
                name: "Not Going",
                value:
                  not_going.length > 0
                    ? not_going.map((e) => `<@${e}>`).join(" ") +
                      ` (${not_going.length})`
                    : "No responses",
              },
              {
                name: "Maybe",
                value:
                  maybe.length > 0
                    ? maybe.map((e) => `<@${e}>`).join(" ") +
                      ` (${maybe.length})`
                    : "No responses",
              }
            );

          event.edit({ embeds: [newEmbed] });

          click.reply({
            content: "Recorded response",
            ephemeral: true,
          });
        });
      }
    }
  },
} as Command;
