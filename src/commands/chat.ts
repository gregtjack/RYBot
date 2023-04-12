import {
    SlashCommandBuilder,
    SlashCommandStringOption,
} from "@discordjs/builders";
import { Command } from "../rybot.types";
import { Configuration, OpenAIApi } from "openai";

const config = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
    organization: process.env.OPENAI_ORG,
});

const openai = new OpenAIApi(config);

export default {
    type: "SLASH",
    options: new SlashCommandBuilder()
        .setName("chat")
        .setDescription("ChatGPT because why not. Works only sometimes.")
        .addStringOption(
            new SlashCommandStringOption()
                .setName("input")
                .setRequired(true)
                .setDescription("Ask anything")
        ),
    execute: async (interaction, args) => {
        if (!interaction) return;
        if (!args) return;
        const [input] = args;
        await interaction.deferReply();
        try {
            const res = await openai.createChatCompletion({
                model: 'gpt-3.5-turbo',
                messages: [{role: "user", content: input, name: interaction.user.username }],
                temperature: 0.7,
            });
            await interaction.editReply(res.data.choices[0].message?.content.slice(0, 2000) ?? "No response");
        } catch (err) {
            await interaction.editReply({
                content: `Error completing chat: ${(err as Error).message}`
            })
        }
    },
} as Command;
