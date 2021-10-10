import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, Message } from "discord.js";

export default interface RYBotCommand {
    type: 'SLASH' | 'LEGACY',
    data: SlashCommandBuilder | 
          Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup"> | 
          {name: string, description: string},
    execute(command?: CommandInteraction, args?: string[], message?: Message): void
}