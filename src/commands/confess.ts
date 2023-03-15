import {
    SlashCommandBuilder,
    SlashCommandStringOption,
} from "@discordjs/builders";
import { EmbedBuilder } from "discord.js";
import { Command } from "../rybot.types";
import ConfirmationDialogue from "../util/confirm";

export default {
    type: "SLASH",
    options: new SlashCommandBuilder()
        .setName("confess")
        .setDescription("Fully anonymous message")
        .addStringOption(
            new SlashCommandStringOption()
                .setName("subject")
                .setRequired(true)
                .setDescription("Write anything")
        )
        .addStringOption(
            new SlashCommandStringOption()
                .setName("body")
                .setRequired(true)
                .setDescription("Write anything")
        ),
    disabled: true,
    execute: async (interaction, args) => {
        if (!interaction) return;
        if (!args) return;
        const [title, confession] = args;
        const embed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(confession)
            .setColor("#ffffff");
        const confirm = new ConfirmationDialogue(interaction);
        const status = await confirm.send(
            `Are you sure you want to send "${embed}"?`
        );
        if (status) {
            interaction.channel?.send({
                embeds: [],
            });
        }
    },
} as Command;
