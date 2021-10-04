import { ActivitiesOptions, Client, Collection } from "discord.js";
import { REST } from '@discordjs/rest'
import { Routes } from 'discord-api-types/v9';
import fs from 'fs'
import RYBotCommand from "./rybommand";

// Basically just a wrapper for a Discord.js client

export default class RYBot {
    private client: Client
    private guilds: string[]
    private commandsDir: string
    private commands: Collection<string, RYBotCommand>

    constructor(client: Client, options: { commandsDir: string, testGuilds: string[] }) {
        this.commandsDir = options.commandsDir
        this.client = client
        this.guilds = options.testGuilds
        this.commands = new Collection()
        this.init()
        this.listen()
        
    }

    private async init() {
        const commands: Object[] = [];
        const commandFiles = fs.readdirSync(this.commandsDir).filter(file => file.endsWith('.ts'));
        const rest = new REST({ version: '9' }).setToken(process.env.TOKEN ?? '')
        for (const file of commandFiles) {
            const commandImport = await import('./commands/' + file)
            const command = commandImport.default
            this.commands.set(command.data.name, command)
            commands.push(command.data.toJSON());
        }

        // Register the commands with the Discord API

        this.guilds.forEach(guild => {
            rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID ?? '', guild), { body: commands })
            .then(() => console.log('Successfully registered application commands for guild ' + guild))
            .catch(console.error);
        })
    }

    private listen() {
        this.client.on('interactionCreate', async interaction => {
            if (!interaction.isCommand()) return;

            const command = this.commands.get(interaction.commandName)
            
            if (!command) return
            
            let args: string[] = []
            interaction.options.data.forEach(option => {
                const {value: val} = option
                if (val) args.push(val.toString())
            })

            try {
                await command.execute(interaction, args)
            } catch (error) {
                console.error(error)
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true })
            }
        })
    }

    public setActivity(activity: ActivitiesOptions) {
        this.client.user?.setActivity(activity)
    }
}