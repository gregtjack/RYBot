import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, Message } from "discord.js";

export default interface Command {
    type: 'SLASH' | 'LEGACY',
    options: SlashCommandBuilder | 
          Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup"> | 
          {name: string, description: string},
    disabled?: boolean,
    execute(command?: CommandInteraction, args?: string[], message?: Message): void
}