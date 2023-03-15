import { Client, CommandInteraction, Message } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";

export type CommandType = 'SLASH' | 'LEGACY';

export interface Command {
    type: CommandType;
    options: SlashCommandBuilder | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
    disabled?: boolean;
    execute(
        command?: CommandInteraction,
        args?: string[],
        message?: Message
    ): void;
}

export interface Feature {
    name: string;
    description: string;
    disabled?: boolean;
    start(client: Client): void;
}
