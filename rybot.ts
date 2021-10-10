import { ActivitiesOptions, Client, Collection } from "discord.js";
import { REST } from '@discordjs/rest'
import { Routes } from 'discord-api-types/v9';
import fs from 'fs'
import RYBotCommand from "./rybommand";

// Basically just a wrapper for a Discord.js client

export default class RYBot {
    private client: Client
    private guilds: string[]
    private prefix: string
    private commandsDir: string
    private commands: Collection<string, RYBotCommand>

    constructor(client: Client, options: { commandsDir: string, testGuilds: string[], prefix: string }) {
        this.commandsDir = options.commandsDir
        this.client = client
        this.guilds = options.testGuilds
        this.prefix = options.prefix
        this.commands = new Collection()
        this.init()
        this.listen()
    }

    private async init() {
        const commands: Object[] = [];
        const commandFiles = fs.readdirSync(this.commandsDir).filter(file => file.endsWith('.ts'));
        const rest = new REST({ version: '9' }).setToken(process.env.TOKEN ?? '')

        // Import all commands and add them to the bot

        for (const file of commandFiles) {
            const {default: command} = await import('./commands/' + file)
            this.commands.set(command.data.name, command)
            // For pushing to the API
            if (command.type == 'SLASH') {
                commands.push(command.data.toJSON());
            }
        }

        // Register the commands with the Discord API per guild

        this.guilds.forEach(guild => {
            rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID ?? '', guild), { body: commands })
            .then(() => console.log('Successfully registered application commands for guild ' + guild))
            .catch(console.error);
        })
    }

    private listen() {

        // Slash commands

        this.client.on('interactionCreate', async interaction => {
            if (!interaction.isCommand()) return;

            const command = this.commands.get(interaction.commandName)
            
            if (!command) return
            
            let args: string[] = []
            interaction.options.data.forEach(option => {
                const {value: val} = option
                if (val != undefined) args.push(val.toString())
            })

            try {
                command.execute(interaction, args)
            } catch (error) {
                console.error(error)
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true })
            }
        })

        // Legacy commands

        this.client.on('messageCreate', async message => {
            if (!message.content.startsWith(this.prefix)) return
            const [commandName, ...args] = message.content.slice(1).split(' ')
            const command = this.commands.get(commandName)
            if (!command) return

            try {
                command.execute(undefined, args, message)
            } catch (error) {
                console.error(error)
            }

        })
    }

    public setActivity(activity: ActivitiesOptions) {
        this.client.user?.setActivity(activity)
    }
}