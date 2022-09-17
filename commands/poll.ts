import {
  SlashCommandBooleanOption,
  SlashCommandBuilder,
  SlashCommandNumberOption,
  SlashCommandStringOption,
} from "@discordjs/builders";
import Discord, {
  CommandInteraction,
  MessageActionRow,
  MessageEmbed,
  MessageSelectMenu,
  MessageSelectOptionData,
  SelectMenuInteraction,
} from "discord.js";
import prettyMilliseconds from "pretty-ms";
import RYBotCommand from "../rybommand";
import ConfirmationDialogue from "../util/confirm";

export default {
  type: "SLASH",
  data: new SlashCommandBuilder()
    .setName("poll")
    .setDescription("Create a poll")
    .addStringOption(
      new SlashCommandStringOption()
        .setName("title")
        .setDescription("Title of the poll")
        .setRequired(true)
    )
    .addNumberOption(
      new SlashCommandNumberOption()
        .setName("time")
        .setDescription("How long the poll is available for in hours. 1 week = 168 hours")
        .setRequired(true)
    )
    .addBooleanOption(
      new SlashCommandBooleanOption()
        .setName("anonymous")
        .setDescription("Choose to hide or show names")
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
    const [title, time, anonymous, ...optionNames]: string[] = args;
    const options = optionNames.map((option, i) => {
      return {
        value: "option_" + i,
        label: option,
      } as MessageSelectOptionData;
    });
    const row = new MessageActionRow();
    const menu = new MessageSelectMenu();
    const embed = new MessageEmbed()
      .setTitle(title)
      .setColor('RANDOM')
      .setFooter(
        `This poll ends in ${prettyMilliseconds(parseFloat(time) * 1000 * 60 * 60, { compact: true })}`
      );
    const color = embed.color;

    // This is weird but it seems to be the only way to get nicknames

    const user = await interaction.guild?.members.fetch({
      user: interaction.user,
    });
    embed.setAuthor(
      `${user?.displayName ?? interaction.user.username}'s poll`,
      interaction.user.displayAvatarURL()
    );

    let optionIdToName = new Map();

    menu.setCustomId("menu")
      .setPlaceholder("Select an option")
      .addOptions(options);

    options.forEach((option, i) => {
      optionIdToName.set(option.value, option.label);
      if (anonymous == 'true') {
        embed.addField(option.label, "0 votes [0%]");
      } else {
        embed.addField(option.label, "(0) [0%]");
      }
    });

    row.addComponents(menu);

    // Ask the user to confirm

    const confirm = new ConfirmationDialogue(interaction, 60)
    const res = await confirm.send(`**Create the poll?**\n**title**: ${title}\n**time**: ${time} hours\n**anonymous**: ${anonymous}\n**choices**: ${options.map(e => e.label).join(", ")}`);
    if (res) {
      const timeCreated = Date.now();
      const poll = await interaction?.channel?.send({ embeds: [embed], components: [row] });
      const collector = poll?.createMessageComponentCollector({ time: parseFloat(time) * 1000 * 60 * 60 });
      const voters = new Map<string, string>();
      let votes: Map<string, string[]>;
      const getTotalVotes = () => {
        let total = 0;
        votes.forEach((v, _k) => {
          total += v.length;
        })
        return total;
      }
      collector?.on("collect", async (click: SelectMenuInteraction) => {
        votes = new Map<string, string[]>();
        options.forEach(o => votes.set(o.value, []));
        voters.set(click.user.id, click.values[0]);
        voters.forEach((option, userId) => votes.get(option) ? votes.get(option)?.push(userId) : votes.set(option, [userId]));

        const newPoll = new MessageEmbed()
          .setAuthor(`${user?.displayName ?? interaction.user.username}'s poll`, interaction.user.displayAvatarURL())
          .setTitle(title)
          .setColor(color ?? 'BLUE')
          .setFooter(
            `This poll ends in ${prettyMilliseconds(
              timeCreated +
              parseFloat(time) *
              1000 *
              60 *
              60 -
              Date.now(),
              { compact: true }
            )}`
          );

        votes.forEach((users, option) => {
          newPoll.addField(optionIdToName.get(option),
            anonymous == 'true'
              ? `${users.length} vote${users.length == 1 ? '' : 's'} [${((users.length / getTotalVotes()) * 100).toFixed(0)}%]`
              : `${users.map(e => `<@${e}>`).join(' ') ?? ''} (${users.length}) [${((users.length / getTotalVotes()) * 100).toFixed(0)}%]`);
        });

        poll?.edit({ embeds: [newPoll] });

        click.reply({
          content: `You voted for "${optionIdToName.get(click.values[0])}"`,
          ephemeral: true,
        });
      });

      // Called when time runs out

      collector?.on("end", (collection) => {
        console.log(`${user?.displayName}'s poll has ended`);
        const newEmbed = new MessageEmbed()
          .setAuthor(`${user?.displayName ?? interaction.user.username}'s poll`, interaction.user.displayAvatarURL())
          .setTitle(title)
          .setColor("GREEN")
          .setFooter(`This poll has ended`);
        let maxVotes = 0;
        let winner = '';

        votes.forEach((voters, optionId) => {
          if (voters.length > maxVotes) {
            maxVotes = voters.length;
            winner = optionId;
          }
        });

        votes.forEach((voters, optionId) => {
          if (anonymous == 'false') {
            newEmbed.addField(`${winner == optionId ? '✅' : ''} ${optionIdToName.get(optionId)}`,
              `${voters.map(e => `<@${e}>`).join(' ') ?? ""} (${voters.length}) [${((voters.length / getTotalVotes()) * 100).toFixed(0)}%]`);
          } else {
            newEmbed.addField(`${winner == optionId ? '✅' : ''} ${optionIdToName.get(optionId)}`,
              `${voters.length} vote${voters.length == 1 ? '' : "s"} [${((voters.length / getTotalVotes()) * 100).toFixed(0)}%]`);
          }
        });

        poll?.edit({
          embeds: [newEmbed],
          components: [],
        });
      });

    }
  },
} as RYBotCommand;
