import { SlashCommandBuilder } from "@discordjs/builders";
import { Command } from "../rybot.types";

export default {
    type: "LEGACY",
    options: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Ping the bot to test for a response'),
    execute: async (_interaction, _args, message) => {
        if (!message) return;
        message.reply({
            content: "Pong!",
        });
    },
} as Command;
