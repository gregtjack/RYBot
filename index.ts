import Discord, { Intents } from 'discord.js'
import dotenv from 'dotenv'
import path from 'path'
import RYBot from './rybot'
dotenv.config()

const client = new Discord.Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS
    ]
})

client.on('ready', () => {
    new RYBot(client, {
        testGuilds: ['697496245463154788', '743291806917328957'],
        commandsDir: path.join(__dirname, '/commands')
    })
    .setActivity({type: 'PLAYING', name: '🎺'})
})

client.login(process.env.TOKEN)