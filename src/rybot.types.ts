import { Client, CommandInteraction, Message } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";

interface Command {
    type: "SLASH" | "LEGACY";
    options:
        | SlashCommandBuilder
        | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">
        | { name: string; description: string };
    disabled?: boolean;
    execute(
        command?: CommandInteraction,
        args?: string[],
        message?: Message
    ): void;
}

interface Feature {
    data: {
        name: string;
        description: string;
    };
    disabled?: boolean;
    start(client: Client): void;
}

export { Feature, Command };
