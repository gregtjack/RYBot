import { ActivitiesOptions, Client, Collection } from "discord.js";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import fs from "fs";
import { Command } from "./rybot.types";
import { Logger } from "pino";

// Custom wrapper for a Discord.js client

export default class RYBotClient {
    private guilds: string[];
    private prefix: string;
    private token: string;
    private client_id: string;
    private commandsDir: string;
    private featuresDir: string;
    private commands: Collection<string, Command>;

    constructor(
        private client: Client,
        private logger: Logger,
        options: {
            commandsDir: string;
            client_id: string;
            token: string;
            featuresDir: string;
            testGuilds: string[];
            prefix: string;
        }
    ) {
        this.commandsDir = options.commandsDir;
        this.featuresDir = options.featuresDir;
        this.client = client;
        this.token = options.token;
        this.client_id = options.client_id;
        this.guilds = options.testGuilds;
        this.prefix = options.prefix;
        this.commands = new Collection();
    }

    private async load() {
        const commands: Object[] = [];
        const commandFiles = fs
            .readdirSync(this.commandsDir)
            .filter((file) => file.endsWith('.ts') || file.endsWith('.js'));
        const featureFiles = fs
            .readdirSync(this.featuresDir)
            .filter((file) => file.endsWith('.ts') || file.endsWith('.js'));
        const rest = new REST({ version: '10' }).setToken(this.token);

        // Import all commands
        for (const file of commandFiles) {
            const { default: command } = await import(`./commands/${file}`);
            if (!command.disabled) {
                this.logger.info(`Registering command '${command.options.name}'`)
                this.commands.set(command.options.name, command);
                // For pushing to the API
                if (command.type == 'SLASH') {
                    commands.push(command.options.toJSON());
                }
            }
        }

        // Start all features
        for (const file of featureFiles) {
            const { default: feature } = await import(`./features/${file}`);
            if (!feature.disabled) feature.start(this.client);
        }

        // Register the commands with the Discord API per guild
        this.guilds.forEach(async (guild) => {
            await rest.put(Routes.applicationGuildCommands(this.client_id, guild), {
                body: commands,
            });
            this.logger.info(`Successfully registered commands with the API`); 
        });
    }

    public start() {
        // Load commands and features
        this.load();

        this.client.on('interactionCreate', async (interaction) => {
            if (!interaction.isCommand()) return;

            const command = this.commands.get(interaction.commandName);

            if (!command) return;

            let args: string[] = [];

            interaction.options.data.forEach((option) => {
                const { value: val } = option;
                if (val != undefined) args.push(val.toString());
            });

            try {
                command.execute(interaction, args);
            } catch (error) {
                this.logger.error(error);
                await interaction.reply({
                    content: 'There was an error while executing this command',
                    ephemeral: true,
                });
            }
        });

        // Legacy commands

        this.client.on("messageCreate", async (message) => {
            if (!message.content.startsWith(this.prefix)) return;
            const [commandName, ...args] = message.content.slice(1).split(" ");
            const command = this.commands.get(commandName);
            if (!command) return;

            try {
                command.execute(undefined, args, message);
            } catch (error) {
                console.error(error);
            }
        });
    }

    public setActivity(activity: ActivitiesOptions) {
        this.client.user?.setActivity(activity);
    }
}
